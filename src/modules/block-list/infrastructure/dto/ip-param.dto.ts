import { ApiProperty } from "@nestjs/swagger";
import { IsIP } from "class-validator";

export class IpParamDto {
  @IsIP()
  @ApiProperty({ description: 'IP address to check' })
  ip: string;
}