import { IpAddressRepository } from "@modules/block-list/infrastructure/repositories/ip-address.repository";
import { BadRequestException, Inject } from "@nestjs/common";

export class RemoveIpUseCase {
  constructor(
    @Inject(IpAddressRepository) private readonly ipAddressRepository: IpAddressRepository,
  ) { }

  async execute(ip: string): Promise<{ message: string }> {
    const existingIp = await this.ipAddressRepository.findByIp(ip);
    if (!existingIp) {
      throw new BadRequestException(`IP address ${ip} does not exist in the block list.`);
    }

    await this.ipAddressRepository.softDelete(existingIp.id);
    return { message: `IP address ${ip} removed from the block list.` };
  }
}