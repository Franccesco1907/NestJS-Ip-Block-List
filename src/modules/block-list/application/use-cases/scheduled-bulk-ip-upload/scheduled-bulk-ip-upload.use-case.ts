import { EnvironmentService } from "@config/environment";
import { CACHE_INSTANCE } from "@database/cache/cache.module";
import { IpAddress } from "@modules/block-list/domain/entities";
import { IpAddressRepository } from "@modules/block-list/infrastructure/repositories/ip-address.repository";
import { HttpService } from "@nestjs/axios";
import { Inject } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Keyv } from "cacheable";
import { firstValueFrom } from "rxjs";

export class ScheduledBulkIpUseCase {
  private readonly redisKey = 'blocked_ips';

  constructor(
    @Inject(IpAddressRepository) private readonly ipAddressRepository: IpAddressRepository,
    @Inject(CACHE_INSTANCE) private cacheManager: Keyv,
    private readonly httpService: HttpService,
    private readonly environmentService: EnvironmentService,
  ) { }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  // @Cron(CronExpression.EVERY_10_SECONDS)
  async execute(): Promise<{ message: string }> {
    console.log('ScheduledBulkIpUseCase executed');
    const blockedIpsUrl = this.environmentService.blockedIpsUrl;

    const response = await firstValueFrom(this.httpService.get<string>(blockedIpsUrl));
    const rawIps = response.data.trim().split('\n');

    const filteredIps = rawIps
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .filter(line => !line.startsWith('#'))
      .filter(line => !/\s[1-2]$/.test(line))
      .map(line => line.trim().split('\t')[0]);

    await this.cacheManager.delete(this.redisKey);

    await this.cacheManager.set(this.redisKey, JSON.stringify(filteredIps));

    const currentBlockedIpsEntities = await this.ipAddressRepository.findEntities();
    const currentBlockedIpsMap = new Map(currentBlockedIpsEntities.map(entity => [entity.ip, entity]));

    const ipsToAdd: IpAddress[] = [];
    const ipsToRemove: string[] = [];

    for (const ip of filteredIps) {
      if (!currentBlockedIpsMap.has(ip)) {
        ipsToAdd.push(new IpAddress({ ip }));
      }
    }

    for (const [ip, entity] of currentBlockedIpsMap) {
      if (!filteredIps.includes(ip)) {
        ipsToRemove.push(entity.id);
      }
    }

    if (ipsToAdd.length > 0) {
      await this.ipAddressRepository.save(ipsToAdd);
    }

    if (ipsToRemove.length > 0) {
      await this.ipAddressRepository.softDelete(ipsToRemove);
    }

    return {
      message: `Added ${ipsToAdd.length} IPs and removed ${ipsToRemove.length} IPs.`,
    };
  }
}