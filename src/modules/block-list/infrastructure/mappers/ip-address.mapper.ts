import { IpAddress } from "@modules/block-list/domain/entities";
import { IpAddressDto } from "../dto";

export class IpAddressMapper {
  static toIpAddressModel(ipAddressDto: IpAddressDto): IpAddress {
    return new IpAddress({
      id: ipAddressDto.id,
      ip: ipAddressDto.ip,
      createdAt: ipAddressDto.createdAt,
      updatedAt: ipAddressDto.updatedAt,
      deletedAt: ipAddressDto.deletedAt,
    });
  }

  static toIpAddressDto(ipAddressEntity: IpAddress): IpAddressDto {
    return {
      id: ipAddressEntity.id,
      ip: ipAddressEntity.ip,
      createdAt: ipAddressEntity.createdAt,
      updatedAt: ipAddressEntity.updatedAt,
      deletedAt: ipAddressEntity.deletedAt,
    };
  }
}