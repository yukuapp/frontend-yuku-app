import { useQuery } from '@tanstack/react-query';

export const useCache = <T>({
    keys,
    fetch,
    alive,
    enable,
}: {
    keys: string[];
    fetch: () => Promise<T>;
    alive?: number;
    enable?: boolean;
}): T | undefined => {
    const { data } = useQuery({
        queryKey: keys,
        queryFn: fetch,
        staleTime: alive,
        enabled: enable,
    });
    return data;
};
