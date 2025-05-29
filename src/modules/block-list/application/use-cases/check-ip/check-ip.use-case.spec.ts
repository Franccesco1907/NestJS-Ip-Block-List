import { CACHE_INSTANCE } from '@database/cache/cache.module';
import { IpAddress } from '@modules/block-list/domain/entities';
import { IpAddressRepository } from '@modules/block-list/infrastructure/repositories/ip-address.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { CheckIpUseCase } from './check-ip.use-case';

const mockIpAddressRepository = () => ({
  findByIp: jest.fn(),
});

const mockCacheManager = () => ({
  get: jest.fn(),
});

describe('CheckIpUseCase', () => {
  let useCase: CheckIpUseCase;
  let ipAddressRepository: ReturnType<typeof mockIpAddressRepository>;
  let cacheManager: ReturnType<typeof mockCacheManager>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckIpUseCase,
        {
          provide: IpAddressRepository,
          useValue: mockIpAddressRepository(),
        },
        {
          provide: CACHE_INSTANCE,
          useValue: mockCacheManager(),
        },
      ],
    }).compile();

    useCase = module.get<CheckIpUseCase>(CheckIpUseCase);
    ipAddressRepository = module.get(IpAddressRepository);
    cacheManager = module.get(CACHE_INSTANCE);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const ipToCheck = '192.168.1.1';
    const redisKey = 'blocked_ips';

    it('should return true if the IP is found in the cache', async () => {
      const cachedIps = JSON.stringify(['10.0.0.1', ipToCheck, '172.16.0.1']);
      (cacheManager.get as jest.Mock).mockResolvedValue(cachedIps);

      const result = await useCase.execute(ipToCheck);

      expect(cacheManager.get).toHaveBeenCalledWith(redisKey);
      expect(ipAddressRepository.findByIp).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false if the IP is not found in the cache and not in the repository', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue(JSON.stringify(['10.0.0.1', '172.16.0.1']));
      (ipAddressRepository.findByIp as jest.Mock).mockResolvedValue(null);

      const result = await useCase.execute(ipToCheck);

      expect(cacheManager.get).toHaveBeenCalledWith(redisKey);
      expect(ipAddressRepository.findByIp).toHaveBeenCalledWith(ipToCheck);
      expect(result).toBe(false);
    });

    it('should return true if the IP is not found in the cache but found in the repository', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue(JSON.stringify(['10.0.0.1', '172.16.0.1']));
      (ipAddressRepository.findByIp as jest.Mock).mockResolvedValue(new IpAddress({ ip: ipToCheck }));

      const result = await useCase.execute(ipToCheck);

      expect(cacheManager.get).toHaveBeenCalledWith(redisKey);
      expect(ipAddressRepository.findByIp).toHaveBeenCalledWith(ipToCheck);
      expect(result).toBe(true);
    });

    it('should return false if the cache is empty and the IP is not in the repository', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue(null);
      (ipAddressRepository.findByIp as jest.Mock).mockResolvedValue(null);

      const result = await useCase.execute(ipToCheck);

      expect(cacheManager.get).toHaveBeenCalledWith(redisKey);
      expect(ipAddressRepository.findByIp).toHaveBeenCalledWith(ipToCheck);
      expect(result).toBe(false);
    });

    it('should handle an empty array in the cache', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue(JSON.stringify([]));
      (ipAddressRepository.findByIp as jest.Mock).mockResolvedValue(null);

      const result = await useCase.execute(ipToCheck);

      expect(cacheManager.get).toHaveBeenCalledWith(redisKey);
      expect(ipAddressRepository.findByIp).toHaveBeenCalledWith(ipToCheck);
      expect(result).toBe(false);
    });

    it('should handle undefined cache value', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue(undefined);
      (ipAddressRepository.findByIp as jest.Mock).mockResolvedValue(null);

      const result = await useCase.execute(ipToCheck);

      expect(cacheManager.get).toHaveBeenCalledWith(redisKey);
      expect(ipAddressRepository.findByIp).toHaveBeenCalledWith(ipToCheck);
      expect(result).toBe(false);
    });
  });
});