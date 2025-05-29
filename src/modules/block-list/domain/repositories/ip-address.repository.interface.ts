import { IpAddress } from "../entities";

export interface IpAddressRepositoryInterface {
  findByIp(ip: string): Promise<IpAddress | null>;
}
