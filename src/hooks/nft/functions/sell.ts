import { useEffect, useState } from 'react';
import { string2bigint } from '@/common/types/bigint';
import { useIdentityStore } from '@/stores/identity';
import { HoldingAction } from '@/types/exchange/single-hold';
import { NftListingData } from '@/types/listing';
import { NftMetadata } from '@/types/nft';

export const useShowSellButton = (
    card: NftMetadata | undefined,
    listing: NftListingData | undefined,
): boolean => {
    const [show, setShow] = useState(false);

    // self
    const identity = useIdentityStore((s) => s.connectedIdentity);
    const self = !!identity && !!card && card.owner.owner === identity.account;

    useEffect(() => {
        setShow(() => {
            if (card === undefined) return false;
            if (identity === undefined) return false;
            if (!self) return false;
            if (listing === undefined) return false;

            if (
                card.data?.info.releaseTime &&
                string2bigint(card.data?.info.releaseTime) / BigInt(1e6) > BigInt(Date.now())
            )
                return false;

            return listing?.listing.type === 'holding';
        });
    }, [card, identity, self, listing]);

    return show;
};

export const useShowChangePriceButton = (
    card: NftMetadata | undefined,
    listing: NftListingData | undefined,
    holdingAction: HoldingAction,
): boolean => {
    const [show, setShow] = useState(false);

    // self
    const identity = useIdentityStore((s) => s.connectedIdentity);
    const self = !!identity && !!card && card.owner.owner === identity.account;

    useEffect(() => {
        setShow(() => {
            if (card === undefined) return false;
            if (identity === undefined) return false;
            if (holdingAction !== undefined) return false;
            if (!self) return false;
            if (listing === undefined) return false;
            return listing?.listing.type === 'listing';
            return true;
        });
    }, [card, identity, holdingAction, self, listing]);

    return show;
};
