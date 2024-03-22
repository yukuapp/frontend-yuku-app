import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import message from '@/components/message';
import { queryArtistCollectionDataList } from '@/utils/canisters/yuku-old/artist_router';
import { queryCoreCollectionDataList } from '@/utils/canisters/yuku-old/core';
import { getTokenMetadata, getTokenOwners, getTokenScores } from '@/utils/combined/collection';
import { queryNftListingDataByList } from '@/utils/nft/listing';
import { fetchMemoryNftListing, putMemoryNftListing } from '@/utils/stores/listing.stored';
import { isSameNftByTokenId, uniqueKey } from '@/common/nft/identifier';
import { FirstRenderByData } from '@/common/react/render';
import { Spend } from '@/common/react/spend';
import { NftListingData } from '@/types/listing';
import { NftTokenMetadata, NftTokenOwner } from '@/types/nft';
import { NftTokenScore } from '@/types/nft';
import { NftMetadata } from '@/types/nft';
import { CoreCollectionData } from '@/types/yuku';
import { useNftCard } from '../interval/nft/card';
import { useNftListing } from '../interval/nft/listing';
import { useNftScoreByNftIdentifier } from '../interval/nft/score';
import { useCollectionDataList } from '../nft/collection';

export const useCollectionData = (
    collection: string | undefined,
): CoreCollectionData | undefined => {
    const navigate = useNavigate();

    const [data, setData] = useState<CoreCollectionData | undefined>(undefined);

    const collectionDataList = useCollectionDataList();

    const [once_check_collection_data] = useState(new FirstRenderByData());
    useEffect(() => {
        // if (collection === undefined) return setData(undefined);

        once_check_collection_data.once(
            [
                collection,
                (collectionDataList ?? []).find((d) => d.info.collection === collection)?.info
                    .collection ?? '',
            ],
            () => {
                const list = collectionDataList ?? [];
                const data = list.find((d) => d.info.collection === collection);
                if (data !== undefined) setData(data);
                else {
                    queryCoreCollectionDataList().then((list) => {
                        const data = list.find((d) => d.info.collection === collection);
                        if (data !== undefined) setData(data);
                        else {
                            queryArtistCollectionDataList().then((list) => {
                                const data = list.find((d) => d.info.collection === collection);
                                if (data === undefined) {
                                    message.error(`Can't find collection data: ${collection}`);
                                    return navigate('/', { replace: true });
                                }
                                setData(data);
                            });
                        }
                    });
                }
            },
        );
    }, [collection, collectionDataList]);

    return data;
};

export const useCollectionTokenOwners = (
    collection: string | undefined,
    data: CoreCollectionData | undefined,
): NftTokenOwner[] | undefined => {
    const [owners, setOwners] = useState<NftTokenOwner[] | undefined>(undefined);
    const [once_check_owners] = useState(new FirstRenderByData());
    useEffect(() => {
        once_check_owners.once(
            collection && data ? [collection, !!data] : undefined,
            () => getTokenOwners(collection!, 'stored_remote').then(setOwners),
            () => setOwners(undefined),
        );
    }, [collection, data]);

    return owners;
};

export const useCollectionCards = (
    collection: string,
    data: CoreCollectionData,
    owners: NftTokenOwner[],
): {
    metadata: NftTokenMetadata[] | undefined;
    cards: NftMetadata[] | undefined;
    refreshListings: () => Promise<void>;
} => {
    const [metadata, setMetadata] = useState<NftTokenMetadata[] | undefined>(undefined);

    const [cards, setCards] = useState<NftMetadata[] | undefined>(undefined);
    const [once_check_cards_spend] = useState(new FirstRenderByData());
    const [spend_cards] = useState(Spend.start(`market collection metadata ${'$$$$$$$$$$$$$$$'}`));
    useEffect(() => {
        once_check_cards_spend.once([!!cards], () => {
            spend_cards.mark(`cards is ${cards ? 'exist' : 'not exist'}`);
        });
    }, [cards]);
    const [once_check_cards] = useState(new FirstRenderByData());
    useEffect(() => {
        once_check_cards.once(
            collection && data && owners ? [owners.map((m) => uniqueKey(m.token_id))] : undefined,
            () => {
                const needs = owners.filter((owner) => !fetchMemoryNftListing(owner.token_id));
                console.debug('needs listing', needs.length);
                const spend_metadata_listings_scores = Spend.start(
                    `market collection metadata and listings:${needs.length} and scores ###############`,
                );

                Promise.all([
                    getTokenMetadata(collection, {
                        from: 'stored_remote',
                        token_owners: owners,
                        data,
                    }),
                    queryNftListingDataByList(
                        needs.map((owner) => ({
                            standard: owner.raw.standard,
                            token_id: owner.token_id,
                        })),
                    ),
                    getTokenScores(collection, { from: 'stored_remote', token_owners: owners }),
                ])
                    .then((d) => {
                        spend_metadata_listings_scores.mark('over');
                        const [metadata, listings, scores] = d;
                        if (metadata) {
                            const cards: NftMetadata[] = [];
                            for (const owner of owners) {
                                const listing = listings[uniqueKey(owner.token_id)];
                                if (listing) putMemoryNftListing(owner.token_id, listing);

                                const m = metadata.find((m) => isSameNftByTokenId(m, owner));
                                if (m === undefined) {
                                    console.error('metadata not found');
                                    continue;
                                }
                                const card: NftMetadata = {
                                    data,
                                    owner,
                                    metadata: m,
                                    listing: listing ?? fetchMemoryNftListing(owner.token_id),
                                    score:
                                        scores && scores.find((s) => isSameNftByTokenId(s, owner)),
                                };
                                cards.push(card);
                            }
                            setMetadata(metadata);
                            setCards(cards);
                        } else throw new Error('find metadata failed');
                    })
                    .catch((e) => {
                        console.error('fetch metadata and listings and scores failed', e);
                        message.error(`${e.message}`);
                    });
            },
        );
    }, [collection, data, owners]);

    const refreshListings = async (): Promise<void> => {
        if (cards === undefined) return;
        if (cards.length === 0) return;
        const listings = await queryNftListingDataByList(
            cards.map((card) => ({
                standard: card.owner.raw.standard,
                token_id: card.owner.token_id,
            })),
        );
        for (const card of cards) card.listing = listings[uniqueKey(card.owner.token_id)];
        setCards([...cards]);
    };

    return { metadata, cards, refreshListings };
};

export const useCollectionNftMetadata = (
    collection: string | undefined,
    data: CoreCollectionData | undefined,
    token_identifier: string | undefined,
): {
    card: NftMetadata | undefined;
    refreshCard: () => void;
    score: NftTokenScore | undefined;
    scores: NftTokenScore[] | undefined;
    listing: NftListingData | undefined;
    refreshListing: () => void;
    metadata: NftTokenMetadata[] | undefined;
} => {
    const { card, refresh: refreshCard } = useNftCard(
        data,
        collection && token_identifier ? { collection, token_identifier } : undefined,
        15000,
    );
    const [once_check_card_spend] = useState(new FirstRenderByData());
    const [spend_card] = useState(Spend.start(`market nft card @@@@@@@@@@@@@@@`));
    useEffect(() => {
        if (collection === undefined || token_identifier === undefined) return;
        once_check_card_spend.once([!!card], () => {
            spend_card.mark(`card is ${card ? 'exist' : 'not exist'}`);
        });
    }, [data, collection, token_identifier, card]);

    const { score, scores } = useNftScoreByNftIdentifier(
        collection && token_identifier ? { collection, token_identifier } : undefined,
    );

    const { listing, refresh: refreshListing } = useNftListing(card, 30000);

    const [metadata, setMetadata] = useState<NftTokenMetadata[] | undefined>(undefined);
    useEffect(() => {
        if (collection === undefined || data === undefined) return;
        getTokenOwners(collection, 'stored_remote').then((token_owners) => {
            if (token_owners !== undefined) {
                getTokenMetadata(collection, { from: 'stored_remote', token_owners, data }).then(
                    setMetadata,
                );
            }
        });
    }, [collection, data]);

    return { card, refreshCard, score, scores, listing, refreshListing, metadata };
};
