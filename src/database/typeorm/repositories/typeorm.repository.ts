import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DataSource, DeepPartial, EntityTarget, FindOptionsWhere, Repository } from 'typeorm';
import { CustomBaseEntity } from '../entities/base.entity';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export abstract class TypeOrmBaseRepository<T extends CustomBaseEntity> extends Repository<T> {
  constructor(
    target: EntityTarget<T>,
    @InjectDataSource() dataSource: DataSource,
  ) {
    super(target, dataSource.createEntityManager());
  }

  async findOneByOrFail(where: FindOptionsWhere<T>): Promise<T> {
    const entity = await this.findOneBy(where);
    if (!entity || entity.deletedAt !== null) {
      const conditions = Object.entries(where)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
      throw new NotFoundException(`Entity with conditions ${conditions} not found`);
    }
    return entity;
  }

  async findOneByIdOrFail(id: string): Promise<T> {
    return this.findOneByOrFail({ id } as FindOptionsWhere<T>);
  }

  async findOneById(id: string): Promise<T | null> {
    return this.findOneBy({ id } as FindOptionsWhere<T>);
  }

  async findEntities(where: FindOptionsWhere<T> = {}): Promise<T[]> {
    return this.findBy({ ...where, deletedAt: null } as FindOptionsWhere<T>);
  }

  async createEntity(partial: Partial<T>): Promise<T> {
    const entity = this.create({
      id: randomUUID(),
      ...partial,
    } as T);
    return this.save(entity);
  }

  async updateEntity(id: string, partial: Partial<T>): Promise<T> {
    const entity = await this.findOneByIdOrFail(id);
    this.merge(entity, partial as DeepPartial<T>);
    return this.save(entity);
  }

  async softDeleteEntity(id: string): Promise<void> {
    const entity = await this.findOneByIdOrFail(id);
    if (entity.deletedAt !== null) {
      throw new BadRequestException(`Entity with id ${id} is already deleted`);
    }
    await this.softRemove(entity);
  }

  async findOneByCustom(filter: Partial<T>): Promise<T | null> {
    return this.findOne({ where: { ...filter, deletedAt: null } as FindOptionsWhere<T> });
  }
}
