import { Test, TestingModule } from '@nestjs/testing';
import { RemoveIpUseCase } from './remove-ip.use-case';
import { IpAddressRepository } from '@modules/block-list/infrastructure/repositories/ip-address.repository';
import { BadRequestException } from '@nestjs/common';
import { IpAddress } from '@modules/block-list/domain/entities';

const mockIpAddressRepository = () => ({
  findByIp: jest.fn(),
  softDelete: jest.fn(),
});

describe('RemoveIpUseCase', () => {
  let useCase: RemoveIpUseCase;
  let ipAddressRepository: ReturnType<typeof mockIpAddressRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemoveIpUseCase,
        {
          provide: IpAddressRepository,
          useValue: mockIpAddressRepository(),
        },
      ],
    }).compile();

    useCase = module.get<RemoveIpUseCase>(RemoveIpUseCase);
    ipAddressRepository = module.get(IpAddressRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw BadRequestException if the IP address does not exist', async () => {
    const nonExistingIp = '192.168.1.1';
    (ipAddressRepository.findByIp as jest.Mock).mockResolvedValue(null);

    await expect(useCase.execute(nonExistingIp)).rejects.toThrowError(
      new BadRequestException(`IP address ${nonExistingIp} does not exist in the block list.`),
    );
    expect(ipAddressRepository.softDelete).not.toHaveBeenCalled();
  });

  it('should call softDelete with the ID of the existing IP and return a success message', async () => {
    const existingIp = '10.0.0.1';
    const existingIpEntity = new IpAddress({ id: 'some-id', ip: existingIp });
    (ipAddressRepository.findByIp as jest.Mock).mockResolvedValue(existingIpEntity);
    (ipAddressRepository.softDelete as jest.Mock).mockResolvedValue(undefined); // softDelete usually returns void

    const result = await useCase.execute(existingIp);

    expect(ipAddressRepository.findByIp).toHaveBeenCalledWith(existingIp);
    expect(ipAddressRepository.softDelete).toHaveBeenCalledWith(existingIpEntity.id);
    expect(result).toEqual({ message: `IP address ${existingIp} removed from the block list.` });
  });
});