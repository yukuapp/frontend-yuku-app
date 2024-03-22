import { useQuery } from '@tanstack/react-query';
import { readIcpUsdByDate, writeIcpUsdByDate } from '@/utils/app/storage';
import { getICPPriceOnDate } from '@/apis/yuku/api_data';

export function usePersistentQueryIcpPriceUsd(date: string) {
    const { data } = useQuery<number>({
        queryKey: ['icp_price_usd_', date],
        queryFn: () => getICPPriceOnDate(date),
        initialData: readIcpUsdByDate(date),
        staleTime: Infinity,
        cacheTime: Infinity,
        onSuccess: (price) => {
            writeIcpUsdByDate(date, price);
        },
    });

    return data;
}
