import { CACHE_INSTANCE } from "@database/cache/cache.module";
import { IpAddressRepository } from "@modules/block-list/infrastructure/repositories/ip-address.repository";
import { Inject } from "@nestjs/common";
import { Keyv } from "cacheable";

export class CheckIpUseCase {
  private readonly redisKey = 'blocked_ips';

  constructor(
    @Inject(IpAddressRepository) private readonly ipAddressRepository: IpAddressRepository,
    @Inject(CACHE_INSTANCE) private readonly cacheManager: Keyv,
  ) { }

  async execute(ip: string): Promise<boolean> {
    const cachedIps = await this.cacheManager.get<string>(this.redisKey);
    if (cachedIps) {
      const blockedIpSet = new Set(JSON.parse(cachedIps));
      if (blockedIpSet.has(ip)) {
        return true;
      }
    }
    const ipAddress = await this.ipAddressRepository.findByIp(ip);
    return !!ipAddress;
  }
}