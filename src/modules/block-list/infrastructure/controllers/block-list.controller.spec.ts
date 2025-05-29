import { Test, TestingModule } from '@nestjs/testing';
import { BlockListController } from './block-list.controller'; import { IpAddress } from '@modules/block-list/domain/entities/ip-address.entity';
import { AddIpUseCase, CheckIpUseCase, RemoveIpUseCase } from '@modules/block-list/application';
import { IpAddressDto } from '../dto';

describe('BlockListController', () => {
  let controller: BlockListController;
  let checkIpUseCase: CheckIpUseCase;
  let addIpUseCase: AddIpUseCase;
  let removeIpUseCase: RemoveIpUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlockListController],
      providers: [
        {
          provide: CheckIpUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: AddIpUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: RemoveIpUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<BlockListController>(BlockListController);
    checkIpUseCase = module.get<CheckIpUseCase>(CheckIpUseCase);
    addIpUseCase = module.get<AddIpUseCase>(AddIpUseCase);
    removeIpUseCase = module.get<RemoveIpUseCase>(RemoveIpUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('checkIp', () => {
    it('should call checkIpUseCase.execute with the provided IP', async () => {
      const ipToCheck = { ip: '192.168.1.1' };
      (checkIpUseCase.execute as jest.Mock).mockResolvedValue(true);

      await controller.checkIp(ipToCheck);

      expect(checkIpUseCase.execute).toHaveBeenCalledWith(ipToCheck.ip);
    });

    it('should return the result of checkIpUseCase.execute', async () => {
      const ipToCheck = { ip: '192.168.1.1' };

      (checkIpUseCase.execute as jest.Mock).mockResolvedValue(true);

      const result = await controller.checkIp(ipToCheck);

      expect(result).toBe(true);
    });
  });

  describe('addIp', () => {
    it('should call addIpUseCase.execute with the provided IP', async () => {
      const ipToAdd = { ip: '10.0.0.1' };
      const addedIpEntity = new IpAddress({ ip: ipToAdd.ip });
      (addIpUseCase.execute as jest.Mock).mockResolvedValue(addedIpEntity);

      await controller.addIp(ipToAdd);

      expect(addIpUseCase.execute).toHaveBeenCalledWith(ipToAdd.ip);
    });

    it('should return a success message with the added IP', async () => {
      const ipToAdd = { ip: '10.0.0.1' };

      const addedIpEntity = new IpAddress({ ip: ipToAdd.ip });
      (addIpUseCase.execute as jest.Mock).mockResolvedValue(addedIpEntity);

      const result = await controller.addIp(ipToAdd);
      const expectedResult = new IpAddressDto();
      expectedResult.ip = ipToAdd.ip;
      expect(result).toEqual(expectedResult);
    });
  });

  describe('removeIp', () => {
    it('should call removeIpUseCase.execute with the provided IP', async () => {
      const ipToRemove = { ip: '203.0.113.45' };
      const removeResult = { message: `IP address ${ipToRemove.ip} removed from the block list.` };
      (removeIpUseCase.execute as jest.Mock).mockResolvedValue(removeResult);

      await controller.removeIp(ipToRemove);

      expect(removeIpUseCase.execute).toHaveBeenCalledWith(ipToRemove.ip);
    });

    it('should return the message from removeIpUseCase.execute', async () => {
      const ipToRemove = { ip: '203.0.113.45' };
      const removeResult = { message: `IP address ${ipToRemove} removed from the block list.` };
      (removeIpUseCase.execute as jest.Mock).mockResolvedValue(removeResult);

      const result = await controller.removeIp(ipToRemove);

      expect(result).toEqual(removeResult);
    });
  });
});