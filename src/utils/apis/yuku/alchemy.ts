import * as alchemy from '@/apis/yuku/alchemy';
import { getYukuAlchemyHost } from './special';

export const queryIcpPriceInUsd = async (): Promise<string> => {
    const backend_host = getYukuAlchemyHost();
    return alchemy.queryIcpPriceInUsd(backend_host);
};

export const estimateIcpAmount = async (usd_amount: number): Promise<number> => {
    const backend_host = getYukuAlchemyHost();
    return alchemy.estimateIcpAmount(backend_host, usd_amount);
};
