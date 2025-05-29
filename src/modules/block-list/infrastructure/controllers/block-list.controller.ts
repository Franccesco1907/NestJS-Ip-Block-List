import { AddIpUseCase, CheckIpUseCase, RemoveIpUseCase } from "@modules/block-list/application";
import { Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, ValidationPipe } from "@nestjs/common";
import { ApiBadRequestResponse, ApiInternalServerErrorResponse, ApiOkResponse } from "@nestjs/swagger";
import { AddIpApiResponseDto, CheckIpApiResponseDto, IpAddressDto, IpParamDto, MessageResponseDto, RemoveIpApiResponseDto } from "../dto";

@ApiInternalServerErrorResponse({ description: 'Block List\'s Server Error' })
@ApiBadRequestResponse({ description: 'Bad Request' })
@Controller("block-list")
export class BlockListController {
  constructor(
    private readonly checkIpUseCase: CheckIpUseCase,
    private readonly addIpUseCase: AddIpUseCase,
    private readonly removeIpUseCase: RemoveIpUseCase,
  ) { }

  @Get(":ip")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: CheckIpApiResponseDto, description: 'Check Ip address' })
  async checkIp(@Param(new ValidationPipe({ transform: true })) params: IpParamDto): Promise<boolean> {
    const isBlocked = await this.checkIpUseCase.execute(params.ip);
    return isBlocked;
  }

  @Post(":ip")
  @HttpCode(HttpStatus.CREATED)
  @ApiOkResponse({ type: AddIpApiResponseDto, description: 'Add Ip address' })
  async addIp(@Param(new ValidationPipe({ transform: true })) params: IpParamDto): Promise<IpAddressDto> {
    return await this.addIpUseCase.execute(params.ip);
  }

  @Delete(":ip")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: RemoveIpApiResponseDto, description: 'Remove Ip address' })
  async removeIp(@Param(new ValidationPipe({ transform: true })) params: IpParamDto): Promise<MessageResponseDto> {
    const { message } = await this.removeIpUseCase.execute(params.ip);
    return { message };
  }
}