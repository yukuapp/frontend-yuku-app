import { isSameNft, isSameNftByTokenId, uniqueKey } from '@/common/nft/identifier';
import { Spend } from '@/common/react/spend';
import { NftIdentifier, NftMetadata } from '@/types/nft';
import { UniqueCollectionData } from '@/types/yuku';
import { useCache } from '../cache';
import { getTokenMetadata, getTokenOwners } from '../combined/collection';

const getTokenMetadataByNftIdentifier = (
    token_id: NftIdentifier,
    collectionDataList: UniqueCollectionData[],
): Promise<NftMetadata | undefined> => {
    const fetchNft = async (): Promise<NftMetadata | undefined> => {
        const data = collectionDataList.find((d) => d.info.collection === token_id.collection);
        return new Promise((resolve) => {
            const spend = Spend.start(`getTokenMetadata ${token_id.collection}`, true);
            const byStoredRemote = async (): Promise<NftMetadata[]> => {
                const token_owners = await getTokenOwners(token_id.collection, 'stored_remote');
                if (token_owners === undefined)
                    throw new Error(`can not find token owners for ${token_id.collection}`);
                const owners = token_owners.filter((o) => isSameNft(o.token_id, token_id));
                if (owners.length === 0) {
                    console.warn('should not be empty', uniqueKey(token_id), token_owners);
                    return [];
                }
                const token_metadata = await getTokenMetadata(token_id.collection, {
                    from: 'stored_remote',
                    token_owners,
                    data,
                });
                if (token_metadata === undefined)
                    throw new Error(`can not find token metadata for ${token_id.collection}`);
                const cards: NftMetadata[] = [];
                for (const o of owners) {
                    const metadata = token_metadata.find((m) => isSameNftByTokenId(m, o));
                    if (metadata === undefined) {
                        console.error(`can not find token metadata for ${uniqueKey(o.token_id)}`);
                        continue;
                    }
                    cards.push({
                        data,
                        owner: o,
                        metadata,
                    });
                }
                return cards;
            };
            byStoredRemote()
                .then((cards) => {
                    spend.mark('load stored_remote success');
                    resolve(cards[0]);
                })
                .catch((e) => {
                    console.error(e.message);
                    spend.mark('load stored_remote failed');
                    resolve(undefined);
                });
        });
    };
    return fetchNft();
};

export const loadTokenMetadata = (
    token_id: NftIdentifier,
    collectionDataList: UniqueCollectionData[],
): NftMetadata | undefined => {
    return useCache({
        keys: [
            'only_token_metadata',
            uniqueKey(token_id),
            collectionDataList.map((d) => d.info.collection).join('|'),
        ],
        fetch: () => getTokenMetadataByNftIdentifier(token_id, collectionDataList),
        alive: Infinity,
    });
};
