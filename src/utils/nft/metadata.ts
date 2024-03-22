import { NFT_EXT_WITHOUT_APPROVE, NFT_ICNAMING } from '@/canisters/nft/special';
import { shrinkText } from '@/common/data/text';
import { isSameNft, parseTokenIndex, uniqueKey } from '@/common/nft/identifier';
import { Spend } from '@/common/react/spend';
import { unchanging } from '@/common/types/variant';
import { NftIdentifier, NftMetadata, NftTokenMetadata } from '@/types/nft';
import { UniqueCollectionData } from '@/types/yuku';
import { getTokenMetadata, getTokenOwners } from '../combined/collection';

const ENCODE_CHARS = [' '];

export const getThumbnailByNftTokenMetadata = (token_metadata: NftTokenMetadata): string => {
    let url =
        token_metadata.metadata.thumb ||
        token_metadata.metadata.url ||
        token_metadata.metadata.onChainUrl;
    url = url.replace('ic0.app', 'icp0.io');
    if (url.indexOf('%') >= 0) return url;
    for (const c of ENCODE_CHARS) if (url.indexOf(c) >= 0) return encodeURI(url);
    return url;
};

export const getThumbnailByNftMetadata = (card: NftMetadata): string => {
    return getThumbnailByNftTokenMetadata(card.metadata);
};

const MEDIA_THUMBNAIL_NFT_LIST: string[] = [];
const MEDIA_THUMBNAIL_COLLECTION_LIST: string[] = [
    'drbbg-zaaaa-aaaap-aannq-cai',
    'nkg3l-qaaaa-aaaah-adnqa-cai',
    'jouun-viaaa-aaaah-adnlq-cai',
    '3bag5-taaaa-aaaah-adoka-cai',
    'vnpdo-yqaaa-aaaah-adpla-cai',
];

export const getMediaUrlByNftMetadata = (card: NftMetadata | undefined): string | undefined => {
    if (card === undefined) return undefined;
    if (
        MEDIA_THUMBNAIL_COLLECTION_LIST.includes(card.owner.token_id.collection) ||
        MEDIA_THUMBNAIL_NFT_LIST.includes(uniqueKey(card.owner.token_id))
    ) {
        return getThumbnailByNftMetadata(card);
    }
    let url = card.metadata.metadata.url || card.metadata.metadata.onChainUrl;
    url = url.replace('ic0.app', 'icp0.io');
    if (url.indexOf('%') >= 0) return url;
    for (const c of ENCODE_CHARS) if (url.indexOf(c) >= 0) return encodeURI(url);
    return url;
};

const INCREMENT_INDEX_COLLECTIONS = ['ah2fs-fqaaa-aaaak-aalya-cai', ...NFT_EXT_WITHOUT_APPROVE];
const INCREMENT_NEEDLESS = [
    'bxdf4-baaaa-aaaah-qaruq-cai', // ICPunks
];

export const getNameByNftMetadata = (card: NftMetadata | undefined): string => {
    if (!card) {
        return 'unknown';
    }
    if (card.metadata.metadata.name) return card.metadata.metadata.name;
    if (card.data !== undefined) {
        const name = card.data.info.name;
        try {
            const token_index = parseTokenIndex(card.metadata.token_id);
            if (
                !INCREMENT_NEEDLESS.includes(card.owner.token_id.collection) &&
                INCREMENT_INDEX_COLLECTIONS.includes(card.owner.token_id.collection)
            ) {
                return `${name} #${token_index + 1}`;
            }
            return `${name} #${token_index}`;
        } catch (e) {
            console.error(`can not parse token index`, uniqueKey(card.metadata.token_id), e);
        }
    }

    if (NFT_ICNAMING.includes(card.metadata.token_id.collection)) {
        return card.metadata.raw.data as string;
    }
    return card.metadata.token_id.token_identifier;
};

export const getNameByNftMetadataForCart = (card: NftMetadata): string => {
    if (card.metadata.metadata.name) return shrinkText(card.metadata.metadata.name, 14)!;
    if (card.data !== undefined) {
        const name = shrinkText(card.data.info.name, 14, 0);
        try {
            const token_index = parseTokenIndex(card.metadata.token_id);
            if (INCREMENT_INDEX_COLLECTIONS.includes(card.owner.token_id.collection)) {
                return `${name} #${token_index + 1}`;
            }
            return `${name} #${token_index}`;
        } catch (e) {
            console.error(`can not parse token index`, uniqueKey(card.metadata.token_id), e);
        }
    }

    if (NFT_ICNAMING.includes(card.metadata.token_id.collection)) {
        return card.metadata.raw.data as string;
    }
    return card.metadata.token_id.token_identifier;
};

export const getCollectionNameByNftMetadata = (card: NftMetadata | undefined): string => {
    if (card === undefined) return '';
    return card.data?.info.name ?? '';
};

export const getNftPathByNftMetadata = (
    card: NftMetadata,
    artistCollectionIdList: string[],
): string => {
    if (artistCollectionIdList.includes(card.metadata.token_id.collection)) {
        return `/art/${uniqueKey(card.metadata.token_id)}`;
    }
    return `/market/${uniqueKey(card.metadata.token_id)}`;
};

const byStoredRemote = async (
    token_id: NftIdentifier,
    data?: UniqueCollectionData,
): Promise<NftMetadata> => {
    const token_owners = await getTokenOwners(token_id.collection, 'stored_remote');
    if (token_owners === undefined) {
        throw new Error(`can not find token owners for ${token_id.collection}`);
    }
    const owners = token_owners.filter((o) => isSameNft(o.token_id, token_id));
    if (owners.length === 0) {
        console.error('should not be empty', uniqueKey(token_id), token_owners);
        throw new Error(
            `can not find token ${token_id.token_identifier} in ${token_id.collection}`,
        );
    }
    if (owners.length !== 1) {
        console.error('should be only one', uniqueKey(token_id), token_owners);
        throw new Error(
            `find too many tokens ${token_id.token_identifier} in ${token_id.collection}`,
        );
    }
    const owner = owners[0];
    const token_metadata = await getTokenMetadata(token_id.collection, {
        from: 'stored_remote',
        token_owners,
        data,
    });
    if (token_metadata === undefined) {
        throw new Error(`can not find token metadata for ${token_id.collection}`);
    }
    const metadata = token_metadata.find((m) => isSameNft(m.token_id, token_id));
    if (metadata === undefined) {
        console.error(`can not find token metadata for ${uniqueKey(token_id)}`);
        throw new Error(
            `can not find token metadata ${token_id.token_identifier} in ${token_id.collection}`,
        );
    }

    return { data, owner, metadata };
};

const byRemote = async (
    token_id: NftIdentifier,
    data?: UniqueCollectionData,
): Promise<NftMetadata> => {
    const token_owners = await getTokenOwners(token_id.collection, 'remote');
    if (token_owners === undefined) {
        throw new Error(`can not find token owners for ${token_id.collection}`);
    }
    const owners = token_owners.filter((o) => isSameNft(o.token_id, token_id));
    if (owners.length === 0) {
        console.warn('should not be empty', uniqueKey(token_id), token_owners);
        throw new Error(
            `can not find token ${token_id.token_identifier} in ${token_id.collection}`,
        );
    }
    if (owners.length !== 1) {
        console.error('should be only one', uniqueKey(token_id), token_owners);
        throw new Error(
            `find too many tokens ${token_id.token_identifier} in ${token_id.collection}`,
        );
    }
    const owner = owners[0];
    const token_metadata = await getTokenMetadata(token_id.collection, {
        from: 'remote',
        token_owners,
        data,
    });
    if (token_metadata === undefined) {
        throw new Error(`can not find token metadata for ${token_id.collection}`);
    }
    const metadata = token_metadata.find((m) => isSameNft(m.token_id, token_id));
    if (metadata === undefined) {
        console.error(`can not find token metadata for ${uniqueKey(token_id)}`);
        throw new Error(
            `can not find token metadata ${token_id.token_identifier} in ${token_id.collection}`,
        );
    }

    return { data, owner, metadata };
};

export const getNftMetadata = async (
    collectionDataList: UniqueCollectionData[],
    token_id: NftIdentifier,
    from: 'stored_remote' | 'remote',
): Promise<NftMetadata> => {
    const data = collectionDataList.find((d) => d.info.collection === token_id.collection);
    return new Promise((resolve) => {
        const spend = Spend.start(`loadNftList ${token_id.collection}`, true);
        switch (from) {
            case 'stored_remote': {
                byStoredRemote(token_id, data)
                    .then((card) => {
                        spend.mark('load stored_remote success');
                        resolve(card);
                    })
                    .catch((e) => {
                        console.error(e.message);
                        spend.mark('load stored_remote failed');
                        throw e;
                    });
                break;
            }
            case 'remote': {
                byRemote(token_id, data)
                    .then((card) => {
                        spend.mark('load remote success');
                        resolve(card);
                    })
                    .catch((e) => {
                        console.error(e.message);
                        spend.mark('load remote failed');
                        throw e;
                    });
                break;
            }
            default:
                throw new Error(`what a option from: ${from}`);
        }
    });
};

const innerFetchNftCards = async (
    collectionDataList: UniqueCollectionData[],
    token_list: NftIdentifier[],
    from: 'stored_remote' | 'remote',
): Promise<NftMetadata[]> => {
    const spend_owners = Spend.start(`nft token owners and metadata`, true);
    return Promise.all(
        token_list.map(
            (token_id) =>
                new Promise<NftMetadata[]>((resolve) => {
                    getNftMetadata(collectionDataList, token_id, from)
                        .then((card) => resolve([card]))
                        .catch(() => resolve([]));
                }),
        ),
    ).then((got_cards) => {
        spend_owners.mark(
            `metadata success:${got_cards.map((c) => c.length).reduce((a, b) => a + b, 0)}/${
                got_cards.length
            }`,
        );
        const cards = got_cards.flatMap(unchanging);
        console.debug('all cards', from, token_list.length, '->', cards.length);
        return cards;
    });
};

export const getNftCardsByRemote = async (
    collectionDataList: UniqueCollectionData[],
    token_list: NftIdentifier[],
): Promise<NftMetadata[]> => {
    return innerFetchNftCards(collectionDataList, token_list, 'remote');
};

export const getNftCardsByStoredRemote = async (
    collectionDataList: UniqueCollectionData[],
    token_list: NftIdentifier[],
): Promise<NftMetadata[]> => {
    return innerFetchNftCards(collectionDataList, token_list, 'stored_remote');
};

export const loadNftCardsByStoredRemote = async (
    collectionDataList: UniqueCollectionData[],
    token_id_list: NftIdentifier[],
    setList?: (list: NftMetadata[]) => void,
): Promise<NftMetadata[]> => {
    // console.error('nfts', nfts);

    const all_cards: NftMetadata[] = [];
    const push_card = (cards: NftMetadata[]) => {
        all_cards.push(...cards);
        if (all_cards.length) setList && setList(all_cards);
    };
    const spend_owners = Spend.start(`profile token owners and metadata`, true);
    return Promise.all(
        token_id_list.map(
            (token_id) =>
                new Promise<NftMetadata[]>((resolve) => {
                    getNftMetadata(collectionDataList, token_id, 'stored_remote')
                        .then((card) => {
                            push_card([card]);
                            resolve([card]);
                        })
                        .catch(() => resolve([]));
                }),
        ),
    ).then((got_cards) => {
        spend_owners.mark(
            `metadata success:${got_cards.map((c) => c.length).reduce((a, b) => a + b, 0)}/${
                got_cards.length
            }`,
        );
        const cards = got_cards.flatMap(unchanging);
        console.debug('all cards', 'stored_remote', token_id_list.length, '->', cards.length);
        setList && setList(cards);
        return cards;
    });
};
