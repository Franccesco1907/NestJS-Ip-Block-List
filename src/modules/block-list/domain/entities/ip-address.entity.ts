import { CustomBaseEntity } from '@database/typeorm/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'ip_addresses' })
export class IpAddress extends CustomBaseEntity {
  @Column({ type: 'varchar', unique: true, length: 45 })
  ip: string;

  constructor(data: Partial<IpAddress>) {
    super();
    Object.assign(this, data);
  }
}
