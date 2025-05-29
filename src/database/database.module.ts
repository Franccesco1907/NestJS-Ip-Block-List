import { Global, Module } from '@nestjs/common';
import { CustomCacheModule } from './cache/cache.module';
import { TypeOrmDatabaseModule } from './typeorm';

@Global()
@Module({
  imports: [
    TypeOrmDatabaseModule,
    CustomCacheModule,
  ],
  exports: [
    TypeOrmDatabaseModule,
    CustomCacheModule,
  ],
})
export class DatabaseModule { }
