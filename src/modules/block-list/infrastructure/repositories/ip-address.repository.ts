import { TypeOrmBaseRepository } from "@database/typeorm/repositories";
import { IpAddress } from "@modules/block-list/domain/entities";
import { IpAddressRepositoryInterface } from "@modules/block-list/domain/repositories";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, IsNull, Repository } from "typeorm";

/**
 * Repository for managing IP addresses in the database.
 */
@Injectable()
export class IpAddressRepository extends TypeOrmBaseRepository<IpAddress> implements IpAddressRepositoryInterface {
  constructor(
    @InjectRepository(IpAddress) private readonly ipAddressRepository: Repository<IpAddress>,
    private dataSource: DataSource,
  ) {
    super(ipAddressRepository.target, dataSource);
  }

  async findByIp(ip: string): Promise<IpAddress | null> {
    return await this.ipAddressRepository.findOneBy({ ip, deletedAt: IsNull() });
  }
}
