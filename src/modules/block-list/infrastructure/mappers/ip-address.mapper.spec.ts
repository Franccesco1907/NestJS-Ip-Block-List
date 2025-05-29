import { IpAddress } from "@modules/block-list/domain/entities";
import { IpAddressDto } from "../dto";
import { IpAddressMapper } from "./ip-address.mapper";

describe('IpAddressMapper', () => {
  describe('toIpAddressModel', () => {
    it('should correctly map an IpAddressDto to an IpAddress entity', () => {
      const ipAddressDto: IpAddressDto = {
        id: 'some-uuid',
        ip: '192.168.1.1',
        createdAt: new Date('2025-05-15T00:00:00.000Z'),
        updatedAt: new Date('2025-05-15T01:00:00.000Z'),
        deletedAt: null,
      };

      const ipAddressEntity = IpAddressMapper.toIpAddressModel(ipAddressDto);

      expect(ipAddressEntity).toBeInstanceOf(IpAddress);
      expect(ipAddressEntity.id).toBe(ipAddressDto.id);
      expect(ipAddressEntity.ip).toBe(ipAddressDto.ip);
      expect(ipAddressEntity.createdAt).toEqual(ipAddressDto.createdAt);
      expect(ipAddressEntity.updatedAt).toEqual(ipAddressDto.updatedAt);
      expect(ipAddressEntity.deletedAt).toBeNull();
    });
  });

  describe('toIpAddressDto', () => {
    it('should correctly map an IpAddress entity to an IpAddressDto', () => {
      const ipAddressEntity = new IpAddress({
        id: 'another-uuid',
        ip: '172.16.0.1',
        createdAt: new Date('2025-05-15T03:00:00.000Z'),
        updatedAt: new Date('2025-05-15T04:00:00.000Z'),
        deletedAt: new Date('2025-05-15T05:00:00.000Z'),
      });

      const ipAddressDto = IpAddressMapper.toIpAddressDto(ipAddressEntity);

      expect(ipAddressDto).toEqual({
        id: ipAddressEntity.id,
        ip: ipAddressEntity.ip,
        createdAt: ipAddressEntity.createdAt,
        updatedAt: ipAddressEntity.updatedAt,
        deletedAt: ipAddressEntity.deletedAt,
      });
    });

    it('should handle null values in IpAddress entity', () => {
      const ipAddressEntity = new IpAddress({
        id: undefined,
        ip: '192.168.0.100',
        createdAt: undefined,
        updatedAt: undefined,
        deletedAt: undefined,
      });

      const ipAddressDto = IpAddressMapper.toIpAddressDto(ipAddressEntity);

      expect(ipAddressDto).toEqual({
        id: undefined,
        ip: ipAddressEntity.ip,
        createdAt: undefined,
        updatedAt: undefined,
        deletedAt: undefined,
      });
    });
  });
});