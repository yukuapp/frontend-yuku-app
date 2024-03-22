import { useCallback, useEffect, useMemo, useState } from 'react';
import { useInterval } from 'usehooks-ts';
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
import { useReloadAllListingData } from '@/hooks/interval/nft/listing';
import { useTokenRate } from '@/hooks/interval/token_rate';
import { getNftCardsByRemote, loadNftCardsByStoredRemote } from '@/utils/nft/metadata';
import { fetchMemoryNftListing } from '@/utils/stores/listing.stored';
import { FirstRenderByData } from '@/common/react/render';
import { useIdentityStore } from '@/stores/identity';
import { NftIdentifier, NftMetadata } from '@/types/nft';
import { UniqueCollectionData } from '@/types/yuku';
import {
    PROFILE_CARD_SIZE,
    PROFILE_SORT_OPTIONS,
    profileFilterList,
    ProfileSortOption,
    setCollectionOptionsByList,
} from '../common';

function ProfileFavorite({
    showed,
    account,
    collectionDataList,
    favorited,
}: {
    showed: boolean;
    account: string;
    collectionDataList: UniqueCollectionData[];
    favorited: NftIdentifier[];
}) {
    // console.debug('profile favorite', principal, favorited.length, favorited);

    const identity = useIdentityStore((s) => s.connectedIdentity);
    const self = account === identity?.account;
    const selfFavorited = useIdentityStore((s) => s.favorited);

    const wrappedFavorited = self ? selfFavorited ?? favorited : favorited;

    // const [start] = useState(Date.now());

    const [resort, setResort] = useState(0);
    const doResort = useCallback(() => {
        setResort((resort) => resort + 1);
    }, [resort]);

    const [loading, setLoading] = useState(false);
    const [list, setList] = useState<NftMetadata[] | undefined>(undefined);
    const wrappedSetList = (list: NftMetadata[]) => {
        list.forEach((l) => (l.listing = fetchMemoryNftListing(l.metadata.token_id)));
        setList(list);
    };

    const [once_load] = useState(new FirstRenderByData());
    useEffect(() => {
        once_load.once([wrappedFavorited], () => {
            setList(undefined);
            setLoading(true);
            loadNftCardsByStoredRemote(collectionDataList, wrappedFavorited, wrappedSetList).then(
                () => {
                    setLoading(false);
                    getNftCardsByRemote(collectionDataList, wrappedFavorited).then(wrappedSetList);
                },
            );
        });
    }, [wrappedFavorited]);

    const silenceRefreshList = useCallback(() => {
        if (!showed) return;
        getNftCardsByRemote(collectionDataList, wrappedFavorited).then(wrappedSetList);
    }, [showed, wrappedFavorited, collectionDataList]);

    useInterval(silenceRefreshList, 15000);

    useReloadAllListingData(showed, doResort, list, [showed, loading]);

    const shoppingCartFlag = useIdentityStore((s) => s.shoppingCartFlag);
    useEffect(silenceRefreshList, [shoppingCartFlag]);

    const wrappedLoading = list === undefined || (list.length === 0 && loading);

    if (!wrappedLoading) {
        // const end = Date.now();
        // console.debug('Profile Created spend', `${end - start}ms`);
    }

    const [openCollectionFilter, setOpenCollectionFilter] = useState(false);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState<ProfileSortOption>('price_low_to_high');

    const [collectionOptions, setCollectionOptions] = useState<FilterCollectionOption[]>([]);
    useEffect(
        () => setCollectionOptionsByList(list, collectionDataList, setCollectionOptions),
        [list, collectionDataList],
    );
    const [collections, setCollections] = useState<FilterCollection[]>([]);

    const { icp_usd, ogy_usd } = useTokenRate();

    const wrappedFilteredList = useMemo(
        () =>
            profileFilterList(
                list,
                openCollectionFilter,
                collectionOptions.filter((o) => collections.includes(o.collection)),
                search,
                sort,
                icp_usd,
                ogy_usd,
            ),
        [list, openCollectionFilter, collections, search, sort],
    );

    if (!showed) return <></>;
    return (
        <div className="profile-favorite">
            {wrappedLoading && (
                <PaginatedItems
                    className="mt-[65px]"
                    size={PROFILE_CARD_SIZE}
                    list={undefined}
                    Items={SlicedCardsByProfile}
                />
            )}
            {!wrappedLoading && list === undefined && <></>}
            {!wrappedLoading && list !== undefined && list.length === 0 && <Empty />}
            {!wrappedLoading && list !== undefined && list.length !== 0 && (
                <>
                    <div className="mb-[20px] mt-[20px] hidden md:flex">
                        <FilterButton
                            open={openCollectionFilter}
                            setOpen={setOpenCollectionFilter}
                        />
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
                    <div className="md:flex md:flex-row">
                        {openCollectionFilter && (
                            <FilterCollections
                                value={collections}
                                options={collectionOptions}
                                setOptions={setCollections}
                                loaded={!loading}
                            />
                        )}

                        <div className="w-full md:flex-1">
                            <div className="mb-[15px] hidden items-center md:flex">
                                {wrappedLoading && (
                                    <div className="flex items-center font-inter-medium text-[16px] text-[#999]">
                                        Loading items
                                        <div className="flex items-center">
                                            <div className="ml-[3px] h-[3px] w-[3px] animate-bounce rounded-full bg-[#999]"></div>
                                            <div className="ml-[3px] h-[3px] w-[3px] animate-bounce rounded-full bg-[#999]"></div>
                                            <div className="ml-[3px] h-[3px] w-[3px] animate-bounce rounded-full bg-[#999]"></div>
                                        </div>
                                    </div>
                                )}
                                {!wrappedLoading && (
                                    <div className="mb-[15px] font-inter-medium text-[16px] text-white">
                                        {wrappedFilteredList!.length} items{' '}
                                        {loading && 'loading...'}
                                    </div>
                                )}
                            </div>
                            <PaginatedItems
                                className="mt-[65px]"
                                size={PROFILE_CARD_SIZE}
                                list={wrappedFilteredList!}
                                Items={SlicedCardsByProfile}
                                refreshList={silenceRefreshList}
                                updateItem={doResort}
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default ProfileFavorite;
