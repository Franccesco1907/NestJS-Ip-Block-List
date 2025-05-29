import { IpAddress } from '@modules/block-list/domain/entities';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, EntityManager, IsNull } from 'typeorm'; // Import EntityManager
import { IpAddressRepository } from './ip-address.repository';

const mockIpAddressRepository = () => ({
  findOneBy: jest.fn(),
  // ... otros métodos del repositorio que puedas usar
});

const mockEntityManager = () => ({
  // Mock de los métodos del EntityManager que tu repositorio podría usar
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  // ... otros métodos
});

const mockDataSource = () => ({
  createEntityManager: jest.fn().mockReturnValue(mockEntityManager()), // Implementa createEntityManager
});

describe('IpAddressRepository', () => {
  let repository: IpAddressRepository;
  let ipAddressRepositoryMock: ReturnType<typeof mockIpAddressRepository>; // Renombrado para claridad
  let dataSourceMock: ReturnType<typeof mockDataSource>; // Renombrado para claridad
  let entityManagerMock: ReturnType<typeof mockEntityManager>; // Añadido

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IpAddressRepository,
        {
          provide: getRepositoryToken(IpAddress),
          useValue: mockIpAddressRepository(),
        },
        {
          provide: DataSource,
          useValue: mockDataSource(),
        },
      ],
    }).compile();

    repository = module.get<IpAddressRepository>(IpAddressRepository);
    ipAddressRepositoryMock = module.get(getRepositoryToken(IpAddress));
    dataSourceMock = module.get(DataSource);
    entityManagerMock = mockEntityManager(); // Obtén la instancia del mock del EntityManager
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findByIp', () => {
    it('should call findOneBy with the provided IP and deletedAt is null', async () => {
      const ipToFind = '192.168.1.1';
      const expectedCondition = { ip: ipToFind, deletedAt: IsNull() };

      await repository.findByIp(ipToFind);

      expect(ipAddressRepositoryMock.findOneBy).toHaveBeenCalledWith(expectedCondition);
    });

    it('should return the IpAddress entity if found', async () => {
      const ipToFind = '192.168.1.1';
      const foundIpAddress = new IpAddress({ ip: ipToFind });
      (ipAddressRepositoryMock.findOneBy as jest.Mock).mockResolvedValue(foundIpAddress);

      const result = await repository.findByIp(ipToFind);

      expect(result).toEqual(foundIpAddress);
    });

    it('should return null if no IpAddress entity is found', async () => {
      const ipToFind = '10.0.0.1';
      (ipAddressRepositoryMock.findOneBy as jest.Mock).mockResolvedValue(null);

      const result = await repository.findByIp(ipToFind);

      expect(result).toBeNull();
    });
  });
});