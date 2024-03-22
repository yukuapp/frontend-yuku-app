import { useEffect, useState } from 'react';
import { useInterval } from 'usehooks-ts';
import { queryIcpPriceInUsd } from '@/utils/apis/yuku/alchemy';
import { queryTokenUsdRate } from '@/utils/apis/yuku/api_data';
import { useAppStore } from '@/stores/app';

const DELAY = 17000;
let used = 0;
let reloading = 0;
export const useTokenRate = (): { icp_usd: string | undefined; ogy_usd: string | undefined } => {
    const icp_usd = useAppStore((s) => s.icp_usd);
    const ogy_usd = useAppStore((s) => s.ogy_usd);

    const setIcpUsd = useAppStore((s) => s.setIcpUsd);
    const setOgyUsd = useAppStore((s) => s.setOgyUsd);

    const fetchIcpUsd = () => queryTokenUsdRate('ICP').then((v) => setIcpUsd(v));
    const fetchOgyUsd = () => queryTokenUsdRate('OGY').then((v) => setOgyUsd(v));

    useInterval(() => {
        if (used <= 0) return;
        const now = Date.now();
        if (now < reloading + DELAY) return;
        reloading = now;
        fetchIcpUsd();
        fetchOgyUsd();
    }, DELAY);

    useEffect(() => {
        used++;
        return () => {
            used--;
        };
    }, []);

    return {
        icp_usd,
        ogy_usd,
    };
};

let reloading_alchemy = 0;
export const useIcpPriceInAlchemy = () => {
    const [icpUsd, setIcpUsd] = useState<string>();
    useEffect(() => {
        queryIcpPriceInUsd().then(setIcpUsd);
    }, []);

    useInterval(async () => {
        const now = Date.now();
        if (now < reloading_alchemy + DELAY) return;
        reloading_alchemy = now;
        setIcpUsd(await queryIcpPriceInUsd());
    }, DELAY);
    return icpUsd;
};
