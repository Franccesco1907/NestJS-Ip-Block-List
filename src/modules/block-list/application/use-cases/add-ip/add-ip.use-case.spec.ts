import { Test, TestingModule } from '@nestjs/testing';
import { AddIpUseCase } from './add-ip.use-case';
import { IpAddressRepository } from '@modules/block-list/infrastructure/repositories/ip-address.repository';
import { BadRequestException } from '@nestjs/common';
import { IpAddress } from '@modules/block-list/domain/entities';
import { IpAddressMapper } from '@modules/block-list/infrastructure/mappers/ip-address.mapper';
import { IpAddressDto } from '@modules/block-list/infrastructure/dto';

const mockIpAddressRepository = () => ({
  findByIp: jest.fn(),
  upsert: jest.fn(),
});

const mockDate = new Date('2025-05-15T00:00:00.000Z');

describe('AddIpUseCase', () => {
  let useCase: AddIpUseCase;
  let ipAddressRepository: ReturnType<typeof mockIpAddressRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddIpUseCase,
        {
          provide: IpAddressRepository,
          useValue: mockIpAddressRepository(),
        },
      ],
    }).compile();

    useCase = module.get<AddIpUseCase>(AddIpUseCase);
    ipAddressRepository = module.get(IpAddressRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw BadRequestException if the IP address already exists', async () => {
    const existingIp = '192.168.1.1';
    (ipAddressRepository.findByIp as jest.Mock).mockResolvedValue(new IpAddress({ ip: existingIp }));

    await expect(useCase.execute(existingIp)).rejects.toThrowError(
      new BadRequestException(`IP address ${existingIp} already exists in the block list.`),
    );
    expect(ipAddressRepository.upsert).not.toHaveBeenCalled();
  });

  it('should call upsert with the IP and return the mapped IpAddressDto if the IP does not exist', async () => {
    const newIp = '10.0.0.1';
    (ipAddressRepository.findByIp as jest.Mock).mockResolvedValue(null);
    const upsertResult = {
      identifiers: [],
      generatedMaps: [{ id: 'new-id' }],
      raw: [],
    };
    (ipAddressRepository.upsert as jest.Mock).mockResolvedValue(upsertResult);
    const expectedIpAddressEntity = { id: 'new-id', ip: newIp };
    const expectedIpAddressDto: IpAddressDto = {
      id: 'new-id', ip: newIp,
      createdAt: mockDate,
      updatedAt: null,
      deletedAt: null
    };
    jest.spyOn(IpAddressMapper, 'toIpAddressDto').mockReturnValue(expectedIpAddressDto);

    const result = await useCase.execute(newIp);

    expect(ipAddressRepository.upsert).toHaveBeenCalledWith({ ip: newIp, deletedAt: null }, ['ip']);
    expect(IpAddressMapper.toIpAddressDto).toHaveBeenCalledWith(expectedIpAddressEntity as IpAddress);
    expect(result).toEqual(expectedIpAddressDto);
  });

  it('should handle the case where generatedMaps is empty', async () => {
    const newIp = '172.16.0.1';
    (ipAddressRepository.findByIp as jest.Mock).mockResolvedValue(null);
    const upsertResult = {
      identifiers: [],
      generatedMaps: [],
      raw: [],
    };
    (ipAddressRepository.upsert as jest.Mock).mockResolvedValue(upsertResult);
    const expectedIpAddressEntity = { ip: newIp };
    const expectedIpAddressDto: IpAddressDto = { id: 'uuid', ip: newIp, createdAt: mockDate, updatedAt: null, deletedAt: null };
    jest.spyOn(IpAddressMapper, 'toIpAddressDto').mockReturnValue(expectedIpAddressDto);

    const result = await useCase.execute(newIp);

    expect(ipAddressRepository.upsert).toHaveBeenCalledWith({ ip: newIp, deletedAt: null }, ['ip']);
    expect(IpAddressMapper.toIpAddressDto).toHaveBeenCalledWith(expectedIpAddressEntity as IpAddress);
    expect(result).toEqual(expectedIpAddressDto);
  });
});