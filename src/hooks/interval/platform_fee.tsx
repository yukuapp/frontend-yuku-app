import { useEffect } from 'react';
import { useInterval } from 'usehooks-ts';
import { queryYukuPlatformFee } from '@/utils/canisters/yuku-old/core';
import { YukuPlatformFee } from '@/canisters/yuku-old/yuku_core';
import { useAppStore } from '@/stores/app';

let used = 0;
let reloading = false;
export const useYukuPlatformFee = (): YukuPlatformFee | undefined => {
    const YukuPlatformFee = useAppStore((s) => s.yuku_platform_fee);

    const setYukuPlatformFee = useAppStore((s) => s.setYukuPlatformFee);

    const fetchYukuPlatformFee = () => queryYukuPlatformFee().then((v) => setYukuPlatformFee(v));

    useInterval(() => {
        if (used <= 0) return;
        if (reloading) return;
        reloading = true;
        try {
            fetchYukuPlatformFee()
                .catch(() => fetchYukuPlatformFee())
                .catch(() => fetchYukuPlatformFee());
        } finally {
            reloading = false;
        }
    }, 1000 * 3600);

    useEffect(() => {
        used++;
        return () => {
            used--;
        };
    }, []);

    return YukuPlatformFee;
};
