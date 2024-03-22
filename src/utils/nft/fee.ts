import { YukuPlatformFee } from '@/canisters/yuku-old/yuku_core';
import { NftMetadata } from '@/types/nft';

export const getServiceFee = (
    card: NftMetadata,
    YukuPlatformFee: YukuPlatformFee | undefined,
): number | undefined => {
    if (card.metadata.raw.standard === 'ogy') {
        if (card.data && YukuPlatformFee) {
            return (
                (100 * Number(card.data.info.standard.ogy!.fee)) /
                10 ** Number(YukuPlatformFee.precision)
            );
        }
        return undefined;
    }
    if (YukuPlatformFee) {
        return (100 * Number(YukuPlatformFee.fee)) / 10 ** Number(YukuPlatformFee.precision);
    }
    return undefined;
};

export const getYukuServiceFee = (
    YukuPlatformFee: YukuPlatformFee | undefined,
): number | undefined => {
    if (YukuPlatformFee) {
        return (100 * Number(YukuPlatformFee.fee)) / 10 ** Number(YukuPlatformFee.precision);
    }
    return undefined;
};
