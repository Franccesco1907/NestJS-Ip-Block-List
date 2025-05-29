import { ResponseDto } from "@common/utils";
import { ApiProperty } from "@nestjs/swagger";
import { IpAddressDto } from "./ip-address.dto";

export class MessageResponseDto {
  @ApiProperty({ type: String, description: 'Message' })
  message: string;
}

export class CheckIpApiResponseDto extends ResponseDto<boolean> {
  @ApiProperty({ type: Boolean })
  declare data: boolean;
}

export class AddIpApiResponseDto extends ResponseDto<IpAddressDto> {
  @ApiProperty({ type: IpAddressDto })
  declare data: IpAddressDto;
}

export class RemoveIpApiResponseDto extends ResponseDto<MessageResponseDto> {
  @ApiProperty({ type: MessageResponseDto })
  declare data: MessageResponseDto;
}