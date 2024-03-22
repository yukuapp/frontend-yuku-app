import { useEffect, useState } from 'react';
import { useIdentityStore } from '@/stores/identity';
import { NftListingData } from '@/types/listing';
import { NftMetadata } from '@/types/nft';

export const useShowBlindBoxButton = (
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
            if (listing?.listing.type !== 'holding') return false;

            const metadata_raw = card.metadata.raw.data;
            if (
                !metadata_raw ||
                typeof metadata_raw !== 'string' ||
                !metadata_raw.startsWith('{') ||
                !metadata_raw.endsWith('}')
            )
                return false;

            let json: any = {};
            try {
                json = JSON.parse(metadata_raw);
            } catch {
                console.error('can not parse metadata raw data', card, metadata_raw);
            }

            return json['isopen'] === false /* cspell: disable-line */;
        });
    }, [card, identity, self, listing]);

    return show;
};
