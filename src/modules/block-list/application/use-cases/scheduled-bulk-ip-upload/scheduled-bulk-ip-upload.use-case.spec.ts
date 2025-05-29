import { EnvironmentService } from '@config/environment';
import { CACHE_INSTANCE } from '@database/cache/cache.module';
import { IpAddress } from '@modules/block-list/domain/entities';
import { IpAddressRepository } from '@modules/block-list/infrastructure/repositories/ip-address.repository';
import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { ScheduledBulkIpUseCase } from './scheduled-bulk-ip-upload.use-case';

const mockIpAddressRepository = () => ({
  findEntities: jest.fn(),
  save: jest.fn(),
  softDelete: jest.fn(),
});

const mockCacheManager = () => ({
  delete: jest.fn(),
  set: jest.fn(),
});

const mockHttpService = () => ({
  get: jest.fn(),
});

const mockEnvironmentService = () => ({
  blockedIpsUrl: 'http://example.com/blocklist.txt',
});

describe('ScheduledBulkIpUseCase', () => {
  let useCase: ScheduledBulkIpUseCase;
  let ipAddressRepository: ReturnType<typeof mockIpAddressRepository>;
  let cacheManager: ReturnType<typeof mockCacheManager>;
  let httpService: ReturnType<typeof mockHttpService>;
  let environmentService: ReturnType<typeof mockEnvironmentService>;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduledBulkIpUseCase,
        {
          provide: IpAddressRepository,
          useValue: mockIpAddressRepository(),
        },
        {
          provide: CACHE_INSTANCE,
          useValue: mockCacheManager(),
        },
        {
          provide: HttpService,
          useValue: mockHttpService(),
        },
        {
          provide: EnvironmentService,
          useValue: mockEnvironmentService(),
        },
      ],
    }).compile();

    useCase = module.get<ScheduledBulkIpUseCase>(ScheduledBulkIpUseCase);
    ipAddressRepository = module.get(IpAddressRepository);
    cacheManager = module.get(CACHE_INSTANCE);
    httpService = module.get(HttpService);
    environmentService = module.get(EnvironmentService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should fetch and process the blocklist, update cache and database', async () => {
    const mockRawData = `# comment\n192.168.1.1\t\n10.0.0.1\t2\n203.0.113.45\t`;
    const mockFilteredIps = ['192.168.1.1', '203.0.113.45'];
    const mockCurrentIps = [new IpAddress({ ip: '192.168.1.1', id: 'id1' }), new IpAddress({ ip: '50.50.50.50', id: 'id2' })];

    (httpService.get as jest.Mock).mockReturnValue(of({ data: mockRawData }));
    (ipAddressRepository.findEntities as jest.Mock).mockResolvedValue(mockCurrentIps);
    (cacheManager.delete as jest.Mock).mockResolvedValue(undefined);
    (cacheManager.set as jest.Mock).mockResolvedValue(undefined);
    (ipAddressRepository.save as jest.Mock).mockResolvedValue([{ ip: '203.0.113.45' }]);
    (ipAddressRepository.softDelete as jest.Mock).mockResolvedValue(undefined);

    const result = await useCase.execute();

    expect(httpService.get).toHaveBeenCalledWith(environmentService.blockedIpsUrl);
    expect(cacheManager.delete).toHaveBeenCalledWith('blocked_ips');
    expect(cacheManager.set).toHaveBeenCalledWith('blocked_ips', JSON.stringify(mockFilteredIps));
    expect(ipAddressRepository.findEntities).toHaveBeenCalled();
    expect(ipAddressRepository.save).toHaveBeenCalledWith([new IpAddress({ ip: '203.0.113.45' })]);
    expect(ipAddressRepository.softDelete).toHaveBeenCalledWith(['id2']);
    expect(result).toEqual({ message: 'Added 1 IPs and removed 1 IPs.' });
  });

  it('should handle an empty blocklist', async () => {
    (httpService.get as jest.Mock).mockReturnValue(of({ data: '' }));
    (ipAddressRepository.findEntities as jest.Mock).mockResolvedValue([]);
    (cacheManager.delete as jest.Mock).mockResolvedValue(undefined);
    (cacheManager.set as jest.Mock).mockResolvedValue('[]');
    expect(ipAddressRepository.save).not.toHaveBeenCalled();
    expect(ipAddressRepository.softDelete).not.toHaveBeenCalled();

    const result = await useCase.execute();

    expect(result).toEqual({ message: 'Added 0 IPs and removed 0 IPs.' });
  });

  it('should handle no changes needed', async () => {
    const mockRawData = '192.168.1.1\n10.0.0.1';
    const mockFilteredIps = ['192.168.1.1', '10.0.0.1'];
    const mockCurrentIps = [new IpAddress({ ip: '192.168.1.1', id: 'id1' }), new IpAddress({ ip: '10.0.0.1', id: 'id2' })];

    (httpService.get as jest.Mock).mockReturnValue(of({ data: mockRawData }));
    (ipAddressRepository.findEntities as jest.Mock).mockResolvedValue(mockCurrentIps);
    (cacheManager.delete as jest.Mock).mockResolvedValue(undefined);
    (cacheManager.set as jest.Mock).mockResolvedValue(JSON.stringify(mockFilteredIps));
    expect(ipAddressRepository.save).not.toHaveBeenCalled();
    expect(ipAddressRepository.softDelete).not.toHaveBeenCalled();
    const result = await useCase.execute();

    expect(result).toEqual({ message: 'Added 0 IPs and removed 0 IPs.' });
  });

  it('should handle errors during http request', async () => {
    const errorMessage = 'Failed to fetch blocklist';
    (httpService.get as jest.Mock).mockImplementation(() => {
      throw new Error(errorMessage);
    });
    expect(cacheManager.delete).not.toHaveBeenCalled();
    expect(cacheManager.set).not.toHaveBeenCalled();
    expect(ipAddressRepository.findEntities).not.toHaveBeenCalled();
    expect(ipAddressRepository.save).not.toHaveBeenCalled();
    expect(ipAddressRepository.softDelete).not.toHaveBeenCalled();

    await expect(useCase.execute()).rejects.toThrowError(errorMessage);
  });
});