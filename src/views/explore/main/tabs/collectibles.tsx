import { useState } from 'react';
import { useMemo } from 'react';
import Fuse from 'fuse.js';
import _ from 'lodash';
import FilterSearch from '@/components/nft-card/filter/search';
import FilterSelect from '@/components/nft-card/filter/select';
import { ROWS } from '@/components/nft-card/sliced';
import { CollectionCardNew, CollectionCardSkeletonNew } from '@/components/nft/collection-card';
import PaginatedItems from '@/components/ui/paginated';
import Refresh from '@/components/ui/refresh';
import { CollectibleCollection, useExploreCollectiblesDataList } from '@/hooks/views/explore';
import { isYukuSpecialCollection } from '@/common/yuku';

type SortOption =
    | 'recently'
    | 'listing_low_to_high'
    | 'listing_high_to_low'
    | 'volume_low_to_high'
    | 'volume_high_to_low'
    | 'floor_low_to_high'
    | 'floor_high_to_low'
    | 'alphabetical_a_z'
    | 'alphabetical_z_a';
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: 'recently', label: 'Recently listed' },
    { value: 'listing_low_to_high', label: 'Listings: Low to High' },
    { value: 'listing_high_to_low', label: 'Listings: High to Low' },
    { value: 'volume_low_to_high', label: 'Total Volume: Low to High' },
    { value: 'volume_high_to_low', label: 'Total Volume: High to Low' },
    { value: 'floor_low_to_high', label: 'Floor Price: Low to High' },
    { value: 'floor_high_to_low', label: 'Floor Price: High to Low' },
    { value: 'alphabetical_a_z', label: 'Alphabetically: A-Z' },
    { value: 'alphabetical_z_a', label: 'Alphabetically: Z-A' },
];

const getRecentlyValue = (c: CollectibleCollection): bigint | undefined =>
    c.data.metadata?.createTime ? -BigInt(c.data.metadata?.createTime) : undefined;
const getListingValue = (c: CollectibleCollection): bigint | undefined =>
    c.data.metadata?.listings ? BigInt(c.data.metadata.listings.length) : undefined;
const getReverseListingValue = (c: CollectibleCollection): bigint | undefined =>
    c.data.metadata?.listings ? -BigInt(c.data.metadata.listings.length) : undefined;
const getVolumeValue = (c: CollectibleCollection): bigint | undefined =>
    c.data.metadata?.volumeTrade
        ? BigInt(c.data.metadata.volumeTrade)
        : c.statistic?.volume
        ? BigInt(c.statistic.volume)
        : undefined;
const getReverseVolumeValue = (c: CollectibleCollection): bigint | undefined =>
    c.data.metadata?.volumeTrade
        ? -BigInt(c.data.metadata?.volumeTrade)
        : c.statistic?.volume
        ? -BigInt(c.statistic.volume)
        : undefined;
const getFloorValue = (c: CollectibleCollection): bigint | undefined =>
    c.data.metadata?.floorPrice
        ? BigInt(c.data.metadata?.floorPrice)
        : c.statistic?.floor
        ? BigInt(c.statistic.floor)
        : undefined;
const getReverseFloorValue = (c: CollectibleCollection): bigint | undefined =>
    c.data.metadata?.floorPrice
        ? -BigInt(c.data.metadata?.floorPrice)
        : c.statistic?.floor
        ? -BigInt(c.statistic.floor)
        : undefined;

export const collectiblesFilterList = (
    list: CollectibleCollection[] | undefined,
    search: string,
    sort: SortOption,
) => {
    if (list === undefined) return list;

    const options = {
        keys: ['data.info.name'],
        threshold: 0.2,
    };
    list = [...list];
    if (search !== '') {
        const fuse = new Fuse(list, options);
        list = [...list];
        list = fuse.search(search).map((f) => f.item);
        return list;
    }

    if (list.length > 1) {
        switch (sort) {
            case 'recently':
                list = _.sortBy(list, [getRecentlyValue]);
                break;
            case 'listing_low_to_high':
                list = _.sortBy(list, [getListingValue]);
                break;
            case 'listing_high_to_low':
                list = _.sortBy(list, [getReverseListingValue]);
                break;
            case 'volume_low_to_high':
                list = _.sortBy(list, [getVolumeValue]);
                break;
            case 'volume_high_to_low':
                list = _.sortBy(list, [getReverseVolumeValue]);
                break;
            case 'floor_low_to_high':
                list = _.sortBy(list, [getFloorValue]);
                break;
            case 'floor_high_to_low':
                list = _.sortBy(list, [getReverseFloorValue]);
                break;
            case 'alphabetical_a_z':
                list = _.sortBy(list, [(s) => s.data.info.name]);
                break;
            case 'alphabetical_z_a':
                list = _.sortBy(list, [(s) => s.data.info.name]);
                _.reverse(list);
                break;
            default:
                break;
        }
    }

    list = _.sortBy(list, [
        (s) => (isYukuSpecialCollection(s.data.info.name, s.data.info.collection) ? 1 : 0),
    ]);
    return list;
};

function ExploreCollectibles({ show }: { show: boolean }) {
    const { list, reload } = useExploreCollectiblesDataList();

    const [search, setSearch] = useState('');

    const [sort, setSort] = useState<SortOption>('volume_high_to_low');

    const filteredList = useMemo(
        () => collectiblesFilterList(list, search, sort),
        [list, search, sort],
    );

    if (!show) return <></>;
    return (
        <div className="flex flex-col">
            <div className="flex h-12 flex-1 flex-shrink-0 flex-col md:flex-row">
                <div className="flex w-full">
                    <div className="mr-5 flex h-12 w-12 cursor-pointer items-center justify-center rounded-[8px] bg-[#191e2e]">
                        <Refresh onClick={reload} control={!list} />
                    </div>
                    <FilterSearch
                        className={'ml-[0px] mr-[0px] hidden flex-1 md:mr-[27px] md:flex'}
                        search={search}
                        setSearch={setSearch}
                    />
                    <FilterSelect
                        defaultValue={sort}
                        className="ml-[0px] mr-[0px] w-full flex-1 md:mr-[27px] md:hidden md:w-auto"
                        options={SORT_OPTIONS}
                        setOption={setSort}
                    />
                </div>

                <FilterSelect
                    defaultValue={sort}
                    className="mt-[10px] hidden h-12 md:mt-0 md:block"
                    options={SORT_OPTIONS}
                    setOption={setSort}
                />
                <FilterSearch
                    className={'mt-[10px] h-12 w-full md:mt-0 md:hidden'}
                    search={search}
                    setSearch={setSearch}
                />
            </div>

            <div className="sticky top-[44px] z-[10] mt-[22px] flex bg-[#101522] py-2 md:top-[75px]">
                <p className="mr-[15px] flex w-[80px] flex-none text-[14px] font-semibold text-white/70 md:mr-0 md:w-auto md:flex-[0.5] xl:w-[72px] xl:flex-none">
                    #
                </p>
                <p className="flex flex-1 text-[14px] font-semibold text-white/70">Collection</p>
                <p
                    onClick={() => {
                        sort === 'floor_low_to_high'
                            ? setSort('floor_high_to_low')
                            : setSort('floor_low_to_high');
                    }}
                    className="hidden w-[180px] cursor-pointer items-center text-[14px] font-semibold text-white/70 xl:flex xl:w-[10%]"
                >
                    Floor Price
                    {sort === 'floor_high_to_low' ? (
                        <i className={`ml-[6px]`}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="8"
                                height="5"
                                viewBox="0 0 8 5"
                                fill="none"
                            >
                                <path
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    d="M4 1.9616L1.06469 4.6656L0 3.68481L3.46765 0.49043C3.76166 0.219595 4.23833 0.219595 4.53234 0.49043L8 3.68482L6.93532 4.6656L4 1.9616Z"
                                    fill="white"
                                />
                            </svg>
                        </i>
                    ) : sort === 'floor_low_to_high' ? (
                        <i className={`ml-[6px] rotate-180`}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="8"
                                height="5"
                                viewBox="0 0 8 5"
                                fill="none"
                            >
                                <path
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    d="M4 1.9616L1.06469 4.6656L0 3.68481L3.46765 0.49043C3.76166 0.219595 4.23833 0.219595 4.53234 0.49043L8 3.68482L6.93532 4.6656L4 1.9616Z"
                                    fill="white"
                                />
                            </svg>
                        </i>
                    ) : (
                        <i className={`ml-[6px]`}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="8"
                                height="11"
                                viewBox="0 0 8 11"
                                fill="none"
                            >
                                <path
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    d="M4 9.03852L1.06469 6.33453L0 7.31531L3.46765 10.5097C3.76166 10.7805 4.23833 10.7805 4.53234 10.5097L8 7.3153L6.93532 6.33452L4 9.03852Z"
                                    fill="white"
                                    fill-opacity="0.6"
                                />
                                <path
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    d="M4 1.96148L1.06469 4.66547L0 3.68469L3.46765 0.490308C3.76166 0.219473 4.23833 0.219473 4.53234 0.490308L8 3.6847L6.93532 4.66548L4 1.96148Z"
                                    fill="white"
                                    fill-opacity="0.6"
                                />
                            </svg>
                        </i>
                    )}
                </p>
                <p
                    onClick={() => {
                        sort === 'volume_low_to_high'
                            ? setSort('volume_high_to_low')
                            : setSort('volume_low_to_high');
                    }}
                    className="flex flex-none cursor-pointer items-center  text-[14px] font-semibold text-white/70 md:flex-1 xl:w-[10%] xl:flex-none"
                >
                    Volume
                    {sort === 'volume_high_to_low' ? (
                        <i className={`ml-[6px]`}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="8"
                                height="5"
                                viewBox="0 0 8 5"
                                fill="none"
                            >
                                <path
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    d="M4 1.9616L1.06469 4.6656L0 3.68481L3.46765 0.49043C3.76166 0.219595 4.23833 0.219595 4.53234 0.49043L8 3.68482L6.93532 4.6656L4 1.9616Z"
                                    fill="white"
                                />
                            </svg>
                        </i>
                    ) : sort === 'volume_low_to_high' ? (
                        <i className={`ml-[6px] rotate-180`}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="8"
                                height="5"
                                viewBox="0 0 8 5"
                                fill="none"
                            >
                                <path
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    d="M4 1.9616L1.06469 4.6656L0 3.68481L3.46765 0.49043C3.76166 0.219595 4.23833 0.219595 4.53234 0.49043L8 3.68482L6.93532 4.6656L4 1.9616Z"
                                    fill="white"
                                />
                            </svg>
                        </i>
                    ) : (
                        <i className={`ml-[6px]`}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="8"
                                height="11"
                                viewBox="0 0 8 11"
                                fill="none"
                            >
                                <path
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    d="M4 9.03852L1.06469 6.33453L0 7.31531L3.46765 10.5097C3.76166 10.7805 4.23833 10.7805 4.53234 10.5097L8 7.3153L6.93532 6.33452L4 9.03852Z"
                                    fill="white"
                                    fill-opacity="0.6"
                                />
                                <path
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    d="M4 1.96148L1.06469 4.66547L0 3.68469L3.46765 0.490308C3.76166 0.219473 4.23833 0.219473 4.53234 0.490308L8 3.6847L6.93532 4.66548L4 1.96148Z"
                                    fill="white"
                                    fill-opacity="0.6"
                                />
                            </svg>
                        </i>
                    )}
                </p>
                <p className="hidden w-[180px] text-[14px] font-semibold text-white/70 xl:flex xl:w-[10%]">
                    Owners
                </p>
                <p className="relative hidden w-[180px] items-center text-[14px] font-semibold text-white/70 xl:flex xl:w-[10%]">
                    7D%
                    <span className="yuku-icon icon-action-question ml-[4px] w-[20px] cursor-pointer text-[20px] text-white opacity-100 shadow-lg hover:opacity-100"></span>
                </p>
                <p className="hidden w-[50px] justify-end text-[14px] font-semibold text-white/70 xl:flex xl:w-[10%]">
                    Items
                </p>
            </div>

            <PaginatedItems
                size={[
                    [2000, 8 * ROWS],
                    [1440, 6 * ROWS],
                    [1105, 6 * ROWS],
                    [848, 4 * ROWS],
                    [0, 2 * ROWS],
                ]}
                list={filteredList}
                Items={Items}
            />
        </div>
    );
}

export default ExploreCollectibles;

const Items = ({
    current,
    size,
    curPage,
}: {
    current: CollectibleCollection[] | undefined;
    size?: number;
    curPage?: number;
}) => {
    return (
        <div className="w-full @container">
            {/* <div className="mb-8 grid w-full grid-cols-2 gap-x-[15px] gap-y-[15px] pt-6 md:mx-auto md:grid-cols-3 md:gap-x-[28px]  md:gap-y-[25px] lg:grid-cols-4 xl:grid-cols-5  2xl:grid-cols-7 3xl:grid-cols-8"> */}
            <div className="mb-8 flex w-full flex-col pt-6 md:mx-auto">
                {!current &&
                    size &&
                    new Array(size)
                        .fill('')
                        .map((_, index) => <CollectionCardSkeletonNew key={index} />)}
                {current &&
                    current.map((item, index) => (
                        <CollectionCardNew
                            key={item.data.info.collection}
                            collection={item.data.info.collection}
                            statistic={item.statistic}
                            data={item.data}
                            index={index}
                            size={size}
                            curPage={curPage}
                        />
                    ))}
            </div>
        </div>
    );
};
