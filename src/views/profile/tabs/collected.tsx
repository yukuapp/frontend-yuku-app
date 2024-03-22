import { useCallback, useEffect, useMemo, useState } from 'react';
import _ from 'lodash';
import { useInterval } from 'usehooks-ts';
import ShowNumber from '@/components/data/number';
import BatchSalesList from '@/components/nft-card/components/batch';
import FilterButton from '@/components/nft-card/filter/button';
import FilterCollections, {
    FilterCollection,
    FilterCollectionOption,
} from '@/components/nft-card/filter/collections';
import FilterSearch from '@/components/nft-card/filter/search';
import FilterSelect from '@/components/nft-card/filter/select';
import { SlicedCardsByProfile } from '@/components/nft-card/sliced';
import Empty from '@/components/ui/empty';
import PaginatedItems from '@/components/ui/paginated';
import Refresh from '@/components/ui/refresh';
import { useReloadAllListingData } from '@/hooks/interval/nft/listing';
import { useTokenRate } from '@/hooks/interval/token_rate';
import { queryOwnerTokenMetadata } from '@/utils/canisters/nft/nft';
import { getTokenMetadata, getTokenOwners } from '@/utils/combined/collection';
import { loadNftCardsByStoredRemote } from '@/utils/nft/metadata';
import {
    collectionTokenMetadataStored,
    collectionTokenOwnersStored,
    collectionTokenScoresStored,
    getCccProxyNfts,
} from '@/utils/stores/collection.stored';
import { fetchMemoryNftListing } from '@/utils/stores/listing.stored';
import { principal2account } from '@/common/ic/account';
import { isSameNftByTokenId, parseTokenIndex, uniqueKey } from '@/common/nft/identifier';
import { FirstRenderByData } from '@/common/react/render';
import { Spend } from '@/common/react/spend';
import { unchanging } from '@/common/types/variant';
import { useDeviceStore } from '@/stores/device';
import { useIdentityStore } from '@/stores/identity';
import { NftMetadata, NftTokenMetadata, NftTokenOwner } from '@/types/nft';
import { UniqueCollectionData } from '@/types/yuku';
import {
    PROFILE_CARD_SIZE,
    PROFILE_SORT_OPTIONS,
    profileFilterList,
    ProfileSortOption,
    setCollectionOptionsByList,
} from '../common';
import BatchBar from '../components/batch-bar';

const parseCards = (
    owners: NftTokenOwner[],
    token_metadata: NftTokenMetadata[],
    data?: UniqueCollectionData,
): NftMetadata[] => {
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

const byStored = async (
    collection: string,
    owner: string,
    data?: UniqueCollectionData,
): Promise<NftMetadata[]> => {
    const token_owners = await getTokenOwners(collection, 'stored');
    if (token_owners === undefined) {
        throw new Error(`can not find token owners for ${collection}`);
    }
    const owners = token_owners.filter((o) => o.owner === owner);
    if (owners.length === 0) return [];
    const token_metadata = await getTokenMetadata(collection, {
        from: 'stored',
        token_owners,
    });
    if (token_metadata === undefined) {
        throw new Error(`can not find token metadata for ${collection}`);
    }
    return parseCards(owners, token_metadata, data);
};

const byExtTokensExt = async (
    collection: string,
    owner: string,
    data?: UniqueCollectionData,
): Promise<NftMetadata[]> =>
    queryOwnerTokenMetadata(collection, owner, data).then((token_metadata) => {
        const cards: NftMetadata[] = token_metadata.map((m) => ({
            data,
            owner: {
                token_id: m.token_id,
                owner,
                raw: {
                    standard: 'ext',
                    data: {
                        index: parseTokenIndex(m.token_id),
                        owner,
                    },
                },
            },
            metadata: m,
        }));
        return cards;
    });

const byStoredRemote = async (
    collection: string,
    owner: string,
    data?: UniqueCollectionData,
): Promise<NftMetadata[]> => {
    const token_owners = await getTokenOwners(collection, 'stored_remote');
    if (token_owners === undefined) {
        throw new Error(`can not find token owners for ${collection}`);
    }
    const owners = token_owners.filter((o) => o.owner === owner);
    if (owners.length === 0) return [];
    const token_metadata = await getTokenMetadata(collection, {
        from: 'stored_remote',
        token_owners,
        data,
    });
    if (token_metadata === undefined) {
        throw new Error(`can not find token metadata for ${collection}`);
    }
    return parseCards(owners, token_metadata, data);
};

const byRemote = async (
    collection: string,
    owner: string,
    data?: UniqueCollectionData,
): Promise<NftMetadata[]> => {
    const token_owners = await getTokenOwners(collection, 'remote');
    if (token_owners === undefined) {
        throw new Error(`can not find token owners for ${collection}`);
    }
    const owners = token_owners.filter((o) => o.owner === owner);
    if (owners.length === 0) return [];
    const token_metadata = await getTokenMetadata(collection, {
        from: 'remote',
        token_owners,
        data,
    });
    if (token_metadata === undefined) {
        throw new Error(`can not find token metadata for ${collection}`);
    }
    return parseCards(owners, token_metadata, data);
};

const getNftMetadataByOwner = async (
    collectionDataList: UniqueCollectionData[],
    collection: string,
    owner: string,
    type: 'stored_remote' | 'remote',
): Promise<NftMetadata[]> => {
    const data = collectionDataList.find((d) => d.info.collection === collection);
    return new Promise((resolve) => {
        const spend = Spend.start(`getNftMetadataByOwner ${collection}`, true);
        switch (type) {
            case 'stored_remote': {
                byStored(collection, owner, data)
                    .then((cards) => {
                        spend.mark('load local success');
                        resolve(cards);
                    })
                    .catch((_e) => {
                        byExtTokensExt(collection, owner, data)
                            .then((cards) => {
                                spend.mark('load tokens_ext success');
                                resolve(cards);
                            })
                            .catch((_e) => {
                                byStoredRemote(collection, owner, data)
                                    .then((cards) => {
                                        spend.mark('load stored_remote success');
                                        resolve(cards);
                                    })
                                    .catch((e) => {
                                        console.error(e.message);
                                        spend.mark('load stored_remote failed');
                                        resolve([]);
                                    });
                            });
                    });
                break;
            }
            case 'remote': {
                byExtTokensExt(collection, owner, data)
                    .then((cards) => {
                        spend.mark('load tokens_ext success');
                        resolve(cards);
                    })
                    .catch((_e) => {
                        byRemote(collection, owner, data)
                            .then((cards) => {
                                spend.mark('load remote success');
                                resolve(cards);
                            })
                            .catch((e) => {
                                console.error(e.message);
                                spend.mark('load remote failed');
                                resolve([]);
                            });
                    });
                break;
            }
            default:
                throw new Error(`what a option type: ${type}`);
        }
    });
};

const getProxyNft = async (
    collectionDataList: UniqueCollectionData[],
    account: string,
): Promise<NftMetadata[]> => {
    const spend_proxy = Spend.start(`profile token owners and metadata proxy`, false);
    return getCccProxyNfts().then((list) => {
        list = list.filter((item) => principal2account(item.owner) === account);
        spend_proxy.mark(`proxy success: ${list.length}`);
        return loadNftCardsByStoredRemote(
            collectionDataList,
            list.map((item) => item.token_id),
        );
    });
};

const getNftList = async (
    collectionDataList: UniqueCollectionData[],
    collectionIdList: string[],
    account: string,
): Promise<NftMetadata[]> => {
    const spend_owners = Spend.start(`profile token owners and metadata`, true);
    return Promise.all([
        ...collectionIdList.map((collection) =>
            getNftMetadataByOwner(collectionDataList, collection, account, 'remote'),
        ),
        getProxyNft(collectionDataList, account),
    ]).then((got_cards) => {
        spend_owners.mark(
            `metadata success:${got_cards.map((c) => c.length).reduce((a, b) => a + b, 0)}/${
                got_cards.length
            }`,
        );
        const cards = got_cards.flatMap(unchanging);
        // console.error('all cards', 'remote', cards);
        return cards;
    });
};

const loadNftList = async (
    collectionDataList: UniqueCollectionData[],
    collectionIdList: string[],
    account: string,
    setList: (list: NftMetadata[]) => void,
): Promise<NftMetadata[]> => {
    const all_cards: NftMetadata[] = [];
    const push_card = (cards: NftMetadata[]) => {
        all_cards.push(...cards);
        if (all_cards.length) setList(all_cards);
    };
    const spend_owners = Spend.start(`profile token owners and metadata`, true);
    return Promise.all([
        ...collectionIdList.map(
            (collection) =>
                new Promise<NftMetadata[]>((resolve) => {
                    getNftMetadataByOwner(
                        collectionDataList,
                        collection,
                        account,
                        'stored_remote',
                    ).then((cards) => {
                        push_card(cards);
                        resolve(cards);
                    });
                }),
        ),
        getProxyNft(collectionDataList, account),
    ]).then((got_cards) => {
        spend_owners.mark(
            `metadata success:${got_cards.map((c) => c.length).reduce((a, b) => a + b, 0)}/${
                got_cards.length
            }`,
        );
        const cards = got_cards.flatMap(unchanging);
        console.error('all cards', 'stored_remote', cards);
        setList(cards);
        return cards;
    });
};

function ProfileCollected({
    showed,
    account,
    idList,
    collectionDataList,
}: {
    showed: boolean;
    principal: string | undefined;
    account: string;
    idList: string[];
    collectionDataList: UniqueCollectionData[];
}) {
    const { isMobile } = useDeviceStore((s) => s.deviceInfo);

    // console.console.debug('profile collected', principal);
    // const [start] = useState(Date.now());

    const [resort, setResort] = useState(0);
    const doResort = useCallback(() => {
        setResort((resort) => resort + 1);
    }, [resort]);

    const [yukuLoading, setYukuLoading] = useState(false);
    const [yukuList, setYukuList] = useState<NftMetadata[] | undefined>(undefined);
    const wrappedSetYukuList = (list: NftMetadata[]) => {
        list.forEach((l) => (l.listing = fetchMemoryNftListing(l.metadata.token_id)));
        setYukuList(list);
    };

    const loadYuku = () => {
        setYukuList(undefined);
        setYukuLoading(true);
        loadNftList(collectionDataList, idList, account, wrappedSetYukuList).finally(() => {
            setYukuLoading(false);
            getNftList(collectionDataList, idList, account).then(wrappedSetYukuList);
        });
    };
    const [once_load_yuku] = useState(new FirstRenderByData());
    useEffect(() => once_load_yuku.once([account, idList], loadYuku), [account, idList]);

    const silenceRefreshYukuList = useCallback(() => {
        if (!showed) return;
        getNftList(collectionDataList, idList, account).then(wrappedSetYukuList);
    }, [showed, account, idList, collectionDataList]);

    useInterval(silenceRefreshYukuList, 15000);

    const silenceRefreshList = useCallback(() => {
        silenceRefreshYukuList();
    }, [silenceRefreshYukuList]);

    const shoppingCartFlag = useIdentityStore((s) => s.shoppingCartFlag);
    useEffect(silenceRefreshList, [shoppingCartFlag]);

    const [wrappedLoading, setWrappedLoading] = useState(false);
    useEffect(() => {
        const wrappedLoading = yukuList === undefined || (yukuList.length === 0 && yukuLoading);
        setWrappedLoading(wrappedLoading);
    }, [yukuList, yukuLoading]);

    const [wrappedList, setWrappedList] = useState<NftMetadata[] | undefined>(undefined);
    useEffect(() => {
        if (yukuList === undefined) return setWrappedList(undefined);
        let list = [...(yukuList ?? [])];
        list = _.uniqBy(list, (card) => uniqueKey(card.owner.token_id));
        setWrappedList(list);
    }, [yukuList]);

    if (!wrappedLoading) {
        // console.debug('Profile Collected spend', `${Date.now() - start}ms`);
    }

    useReloadAllListingData(showed, doResort, wrappedList, [showed, yukuLoading]);

    const onCollectedRefresh = () => {
        if (wrappedLoading) return;

        collectionTokenOwnersStored.clean();
        collectionTokenMetadataStored.clean();
        collectionTokenScoresStored.clean();

        loadYuku();
    };

    const [openCollectionFilter, setOpenCollectionFilter] = useState(false);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState<ProfileSortOption>('price_low_to_high');

    const [collectionOptions, setCollectionOptions] = useState<FilterCollectionOption[]>([]);
    useEffect(() => {
        setCollectionOptionsByList(wrappedList, collectionDataList, setCollectionOptions);
    }, [wrappedList, collectionDataList]);
    const [collections, setCollections] = useState<FilterCollection[]>([]);

    useEffect(() => {
        if (isMobile) {
            if (openCollectionFilter) {
                document.body.style.setProperty('overflow', 'hidden');
            } else {
                document.body.style.removeProperty('overflow');
            }

            return () => {
                document.body.style.removeProperty('overflow');
            };
        }
    }, [openCollectionFilter]);

    const { icp_usd, ogy_usd } = useTokenRate();

    const wrappedFilteredList = useMemo(
        () =>
            profileFilterList(
                wrappedList,
                openCollectionFilter,
                collectionOptions.filter((o) => collections.includes(o.collection)),
                search,
                sort,
                icp_usd,
                ogy_usd,
            ),
        [wrappedList, openCollectionFilter, collections, search, sort],
    );
    const batchSales = useIdentityStore((s) => s.batchSales);

    if (!showed) return <></>;
    return (
        <div className="">
            <div className="mb-[20px] mt-[20px] hidden md:flex">
                <FilterButton open={openCollectionFilter} setOpen={setOpenCollectionFilter} />
                <FilterSearch
                    className={'ml-[25px] mr-[25px] flex-1'}
                    search={search}
                    setSearch={setSearch}
                />
                <FilterSelect
                    className="mt-3 h-12"
                    defaultValue={sort}
                    options={PROFILE_SORT_OPTIONS}
                    setOption={setSort}
                />
            </div>
            <div className="mb-[14px] mt-[15px] block md:hidden">
                <FilterSearch
                    className={'h-[30px] w-full rounded-[6px]'}
                    search={search}
                    setSearch={setSearch}
                    placeholder={'Collection name'}
                />
                <div className="mt-[15px] flex items-center justify-between">
                    <FilterButton
                        className="h-[30px] w-[115px]"
                        open={openCollectionFilter}
                        setOpen={setOpenCollectionFilter}
                    />
                    <FilterSelect
                        className="h-[30px] w-[216px]"
                        defaultValue={sort}
                        options={PROFILE_SORT_OPTIONS}
                        setOption={setSort}
                    />
                </div>
            </div>
            <div className="mb-[15px] hidden items-center md:flex">
                {wrappedLoading && (
                    <div className="flex items-center font-inter-medium text-[16px] leading-none text-[#999]">
                        Loading Items
                        <div className="flex h-[15px] items-end">
                            <div className="ml-[3px] h-[3px] w-[3px] animate-bounce rounded-full bg-[#999]"></div>
                            <div className="ml-[3px] h-[3px] w-[3px] animate-bounce rounded-full bg-[#999]"></div>
                            <div className="ml-[3px] h-[3px] w-[3px] animate-bounce rounded-full bg-[#999]"></div>
                        </div>
                    </div>
                )}
                {!wrappedLoading && (
                    <>
                        <div className="font-inter-medium text-[16px] text-white">
                            <div className="flex items-center leading-none">
                                <ShowNumber
                                    value={{
                                        value: wrappedFilteredList?.length.toString(),
                                        thousand: { symbol: ['M', 'K'] },
                                    }}
                                    className="text-base"
                                />
                                &nbsp;items&nbsp;
                                {yukuLoading ? (
                                    <div className="flex items-end leading-none">
                                        loading
                                        <div className="flex items-end">
                                            <div className="ml-[3px] h-[3px] w-[3px] animate-bounce rounded-full bg-[#999]"></div>
                                            <div className="ml-[3px] h-[3px] w-[3px] animate-bounce rounded-full bg-[#999]"></div>
                                            <div className="ml-[3px] h-[3px] w-[3px] animate-bounce rounded-full bg-[#999]"></div>
                                        </div>
                                    </div>
                                ) : (
                                    <Refresh
                                        onClick={onCollectedRefresh}
                                        className={' ml-[10px] h-[15px] w-[15px]  cursor-pointer'}
                                        control={wrappedLoading}
                                    />
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
            {wrappedLoading && (
                <PaginatedItems
                    className="mt-[65px]"
                    size={PROFILE_CARD_SIZE}
                    list={undefined}
                    Items={SlicedCardsByProfile}
                />
            )}
            {!wrappedLoading && wrappedList === undefined && <></>}
            {!wrappedLoading && wrappedList !== undefined && wrappedList.length === 0 && <Empty />}
            {!wrappedLoading && wrappedList !== undefined && wrappedList.length !== 0 && (
                <>
                    <div className="md:flex md:flex-row">
                        {openCollectionFilter && (
                            <div className="fixed left-0 top-[405px] z-40 w-full bg-[#191e2e] px-[15px] md:static md:mr-[12px]  md:w-[327px] md:px-0">
                                <FilterCollections
                                    value={collections}
                                    options={collectionOptions}
                                    setOptions={setCollections}
                                    setOpen={setOpenCollectionFilter}
                                    loaded={!yukuLoading}
                                />
                            </div>
                        )}

                        <div className="w-full md:flex-1">
                            <PaginatedItems
                                className="mt-[65px]"
                                size={PROFILE_CARD_SIZE}
                                list={wrappedFilteredList}
                                Items={SlicedCardsByProfile}
                                refreshList={silenceRefreshList}
                                updateItem={doResort}
                            />
                        </div>
                    </div>
                </>
            )}
            <BatchSalesList />
            {batchSales.length > 0 && <BatchBar list={wrappedFilteredList} />}
        </div>
    );
}

export default ProfileCollected;
