import { ApiProperty } from "@nestjs/swagger";

export class IpAddressDto {
  @ApiProperty({
    description: 'Unique identifier for the IP address',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'IP Address',
    example: '127.0.0.1',
  })
  ip: string;

  @ApiProperty({
    description: 'Creation date of the IP address',
    example: '2024-04-01T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date of the IP address',
    example: '2024-04-01T10:00:00.000Z',
    nullable: true,
  })
  updatedAt: Date | null;

  @ApiProperty({
    description: 'Delete date of the IP address',
    example: '2024-04-01T10:00:00.000Z',
    nullable: true,
  })
  deletedAt: Date | null;
}