import { IpAddress } from "@modules/block-list/domain/entities";
import { IpAddressDto } from "@modules/block-list/infrastructure/dto";
import { IpAddressMapper } from "@modules/block-list/infrastructure/mappers/ip-address.mapper";
import { IpAddressRepository } from "@modules/block-list/infrastructure/repositories/ip-address.repository";
import { BadRequestException, Inject } from "@nestjs/common";

export class AddIpUseCase {
  constructor(
    @Inject(IpAddressRepository) private readonly ipAddressRepository: IpAddressRepository,
  ) { }

  async execute(ip: string): Promise<IpAddressDto> {
    const existingIp = await this.ipAddressRepository.findByIp(ip);
    if (existingIp) {
      throw new BadRequestException(`IP address ${ip} already exists in the block list.`);
    }

    const newIp = await this.ipAddressRepository.upsert({ ip, deletedAt: null }, ['ip']);
    const ipAddressEntity = { ...newIp.generatedMaps[0], ip };
    return IpAddressMapper.toIpAddressDto(ipAddressEntity as IpAddress);
  }
}