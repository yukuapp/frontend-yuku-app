import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useIdentityStore } from '@/stores/identity';
import { NftListingData } from '@/types/listing';
import { NftMetadata } from '@/types/nft';

export const useShowBatchListingButton = (
    card: NftMetadata | undefined,
    listing: NftListingData | undefined,
): boolean => {
    const { pathname } = useLocation();
    const isProfile = pathname.startsWith('/profile');

    const [show, setShow] = useState(false);

    // self
    const identity = useIdentityStore((s) => s.connectedIdentity);
    const self = !!identity && !!card && card.owner.owner === identity.account;

    useEffect(() => {
        setShow(() => {
            if (card === undefined) return false;
            if (!isProfile) return false;
            if (identity === undefined) return false;
            if (!self) return false;
            if (listing === undefined) return false;
            return listing?.listing.type === 'holding';
        });
    }, [card, isProfile, identity, self, listing]);

    return show;
};
