import { NFT_EXT_WITHOUT_APPROVE } from '@/canisters/nft/special';
import { uniqueKey } from '@/common/nft/identifier';
import { NftListingData } from '@/types/listing';
import { NftIdentifier, SupportedNftStandard, YukuListingNftStandard } from '@/types/nft';
import { Listings } from '@/types/yuku';
import { queryListings } from '../canisters/entrepot';
import { queryTokenListing } from '../canisters/yuku-old/core';
import { putMemoryNftListing } from '../stores/listing.stored';

const first = (list: NftListingData[]): NftListingData => {
    if (list.length) return list[0];
    else throw new Error(`wrong length of queryNftListingData result`);
};

export const queryNftListingData = async (token_id: NftIdentifier): Promise<NftListingData> => {
    const listing = await (async () => {
        if (NFT_EXT_WITHOUT_APPROVE.includes(token_id.collection)) {
            const r = await queryListings(token_id.collection);
            const find = r.find((l) => l.tokenIdentifier === token_id.token_identifier);
            if (find) {
                return {
                    token_id,
                    listing: {
                        type: 'listing',
                        token: {
                            symbol: 'ICP',
                            canister: 'ryjl3-tyaaa-aaaaa-aaaba-cai',
                            standard: {
                                type: 'Ledger',
                            },
                            decimals: '8',
                            fee: '10000',
                        },
                        price: find.price,
                        raw: {
                            type: 'entrepot', //
                            token_identifier: token_id.token_identifier, //
                        },
                    },
                    raw: '',
                } as NftListingData;
            }
        }
        const yuku_listing = await queryTokenListing([token_id]).then(first);
        return yuku_listing;
    })();
    putMemoryNftListing(token_id, listing);
    return listing;
};

type BatchOgy = {
    standard: 'ogy';
    collection: string;
    token_id_list: NftIdentifier[];
};

type BatchYuku = {
    standard: YukuListingNftStandard;
    token_id_list: NftIdentifier[];
};
const querySingleCollectionNftListingDataByList = async (
    args: BatchOgy | BatchYuku,
): Promise<NftListingData[]> => {
    const listing_list = await (async () => {
        return queryTokenListing(args.token_id_list);
    })();

    const entrepot_collection_listings_record: Record<string, Listings[]> = {};
    for (const token_id of args.token_id_list) {
        let collection_listings: Listings[] = [];
        if (entrepot_collection_listings_record[token_id.collection]) {
            collection_listings = entrepot_collection_listings_record[token_id.collection];
        } else {
            if (NFT_EXT_WITHOUT_APPROVE.includes(token_id.collection)) {
                const r = await queryListings(token_id.collection);
                collection_listings = r;
                entrepot_collection_listings_record[token_id.collection] = r;
            }
        }
        const find = collection_listings?.find(
            (r) => r.tokenIdentifier === token_id.token_identifier,
        );
        const old_find =
            find &&
            listing_list.findIndex((l) => l.token_id.token_identifier === find.tokenIdentifier);

        if (old_find) {
            listing_list[old_find] = {
                token_id,
                listing: {
                    type: 'listing',
                    token: {
                        symbol: 'ICP',
                        canister: 'ryjl3-tyaaa-aaaaa-aaaba-cai',
                        standard: {
                            type: 'Ledger',
                        },
                        decimals: '8',
                        fee: '10000',
                    },
                    price: find.price,
                    raw: {
                        type: 'entrepot', //
                        token_identifier: token_id.token_identifier, //
                    },
                },
                raw: '',
            };
        }
    }
    listing_list.forEach((listing) => putMemoryNftListing(listing.token_id, listing));
    return listing_list;
};

export const queryNftListingDataByList = async (
    list: {
        standard: SupportedNftStandard;
        token_id: NftIdentifier;
    }[],
): Promise<Record<string, NftListingData>> => {
    if (list.length === 0) return {};

    const chunks: Record<SupportedNftStandard, Record<string, NftIdentifier[]>> = {} as any;
    for (const item of list) {
        if (!chunks[item.standard]) chunks[item.standard] = {};
        chunks[item.standard][item.token_id.collection] = (
            chunks[item.standard][item.token_id.collection] || []
        ).concat(item.token_id);
    }
    const args_list_ogy: BatchOgy[] = [];
    const args_list_yuku: BatchYuku[] = [];
    for (const [standard, collection_map] of Object.entries(chunks)) {
        if (standard === 'ogy') {
            for (const [collection, token_id_list] of Object.entries(collection_map)) {
                args_list_ogy.push({
                    standard: 'ogy',
                    collection,
                    token_id_list,
                });
            }
        } else {
            for (const token_id_list of Object.values(collection_map)) {
                args_list_yuku.push({
                    standard: standard as YukuListingNftStandard,
                    token_id_list,
                });
            }
        }
    }

    const result: Record<string, NftListingData> = {};
    const results = await Promise.all(
        [...args_list_ogy, ...args_list_yuku].map(querySingleCollectionNftListingDataByList),
    );
    for (const r of results) {
        for (const item of r) {
            result[uniqueKey(item.token_id)] = item;
        }
    }
    return result;
};
