import { AddIpUseCase, CheckIpUseCase, RemoveIpUseCase } from "@modules/block-list/application";
import { ScheduledBulkIpUseCase } from "@modules/block-list/application/use-cases/scheduled-bulk-ip-upload";
import { IpAddress } from "@modules/block-list/domain/entities";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";
import { IpAddressRepository } from "../repositories/ip-address.repository";
import { BlockListController } from "./block-list.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([IpAddress]),
    HttpModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [BlockListController],
  providers: [IpAddressRepository, CheckIpUseCase, AddIpUseCase, RemoveIpUseCase, ScheduledBulkIpUseCase],
  exports: [TypeOrmModule]
})
export class BlockListModule { }