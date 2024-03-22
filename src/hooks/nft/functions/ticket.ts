import { useEffect, useState } from 'react';
import { useIdentityStore } from '@/stores/identity';
import { NftMetadata } from '@/types/nft';
import {
    NftTicketMetadata,
    NftTicketProject,
    NftTicketType,
    SUPPORTED_NFT_TICKET_TYPES,
} from '@/types/yuku-standard/ticket';

export const useShowTicketButton = (
    card: NftMetadata | undefined,
): NftTicketMetadata | undefined => {
    const [data, setData] = useState<NftTicketMetadata | undefined>(undefined);

    // self
    const identity = useIdentityStore((s) => s.connectedIdentity);
    const self = !!identity && !!card && card.owner.owner === identity.account;

    useEffect(() => {
        setData(() => {
            if (card === undefined) return undefined;
            if (identity === undefined) return undefined;
            if (!self) return undefined;

            const metadata_raw = card.metadata.raw.data;
            if (
                !metadata_raw ||
                typeof metadata_raw !== 'string' ||
                !metadata_raw.startsWith('{') ||
                !metadata_raw.endsWith('}')
            )
                return undefined;

            let json: { yuku_traits?: { name: string; value: string }[] } = {};
            try {
                json = JSON.parse(metadata_raw);
            } catch {
                console.error('can not parse metadata raw data', card, metadata_raw);
            }
            if (!json.yuku_traits) return undefined;
            const type = json.yuku_traits.find((c) => c.name === 'ticket')?.value;
            const project = json.yuku_traits.find((c) => c.name === 'project')?.value;
            if (!type || !project) return undefined;
            if (!SUPPORTED_NFT_TICKET_TYPES.includes(type)) return undefined;

            return {
                type: type as NftTicketType,
                project: project as NftTicketProject,
            };
        });
    }, [card, identity, self]);

    return data;
};
