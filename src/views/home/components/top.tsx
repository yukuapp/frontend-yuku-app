import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import TokenPrice from '@/components/data/price';
import { useCollectionDataList } from '@/hooks/nft/collection';
import { CollectibleCollection, useExploreCollectiblesDataList } from '@/hooks/views/explore';
import { getCollectionStatistics } from '@/utils/apis/yuku/api_data';
import { CollectionStatistics, HomeHotCollection } from '@/apis/yuku/api_data';
import { isYukuSpecialCollection } from '@/common/yuku';
import { UniqueCollectionData } from '@/types/yuku';

const HomeTopItem = ({
    collection,
    hot,
    statistic,
    data,
    index,
}: {
    index: number;
    collection: string;
    hot?: HomeHotCollection;
    statistic?: CollectionStatistics;
    data?: UniqueCollectionData;
}) => {
    const collectionDataList = useCollectionDataList();

    const [innerStatistic, setInnerStatistic] = useState<CollectionStatistics | undefined>(
        undefined,
    );
    useEffect(() => {
        if (statistic !== undefined) return;
        getCollectionStatistics(collection).then(setInnerStatistic);
    }, [collection, statistic]);

    const [innerData, setInnerData] = useState<UniqueCollectionData | undefined>(undefined);
    useEffect(() => {
        if (data !== undefined) return;
        setInnerData(collectionDataList.find((c) => c.info.collection === collection));
    }, [collection, data]);

    const logo = hot?.info.logo ?? data?.info.logo ?? innerData?.info.logo;
    const name = hot?.info.name ?? data?.info.name ?? innerData?.info.name;

    const floor = innerData?.metadata?.floorPrice ?? statistic?.floor ?? innerStatistic?.floor;
    // const owners = statistic?.owners ?? innerStatistic?.owners;
    const volume =
        data?.metadata?.volumeTrade ??
        innerData?.metadata?.volumeTrade ??
        statistic?.volume ??
        innerStatistic?.volume;
    const rate = 1;
    return (
        <Link
            data-aos="fade-up"
            data-aos-anchor-placement="bottom-bottom"
            className="flex w-full cursor-pointer items-center rounded-[16px] pb-[14px] pl-[10px] pr-[15px] pt-[14px] text-white duration-300 hover:bg-[#1c223599] hover:backdrop-blur-[10px] md:pl-[20px] md:pr-[44px]"
            to={`/market/${collection}`}
        >
            <p className="w-[30px] text-[16px] font-semibold text-white">{index + 1}</p>
            <img className="h-[64px] w-[64px] rounded-[8px]" src={logo} alt="" />
            <div className="ml-[13px] flex h-full flex-1 flex-col justify-between">
                <div className="mr-[10px] line-clamp-1 font-['Inter'] text-[14px] font-semibold leading-normal text-white md:mr-[20px] md:text-base">
                    {name}
                </div>
                <div className="font-['Inter'] text-[12px] font-normal leading-[10px] text-white text-opacity-80 md:text-sm">
                    Floor{' '}
                    <em className="not-italic text-white">
                        <TokenPrice
                            value={{
                                value: floor && Number(floor) > 0 ? floor : undefined,
                                decimals: { type: 'exponent', value: 8 },
                                scale: 2,
                                paddingEnd: 0,
                                thousand: { symbol: 'K' },
                            }}
                            className="leading-none"
                        />
                    </em>{' '}
                    ICP
                </div>
            </div>
            <div className="flex h-full flex-col items-end justify-between">
                <p className="text-[12px] font-semibold text-white md:text-[16px]">
                    <TokenPrice
                        value={{
                            value: volume,
                            decimals: { type: 'exponent', value: 8 },
                            scale: 1,
                            thousand: { symbol: 'K' },
                        }}
                        className="text-[14px] md:text-[16px]"
                    />
                    &nbsp;ICP
                </p>
                <p
                    className={`text-right font-['Inter'] text-sm font-semibold leading-none ${
                        rate < 0 ? 'text-orange-500' : 'text-green-600'
                    }`}
                >
                    {(rate < 0 ? '' : '+') + (rate.toFixed(2) + '%')}
                </p>
            </div>
        </Link>
    );
};

const getReverseVolumeValue = (c: CollectibleCollection): bigint | undefined =>
    c.data.metadata?.volumeTrade
        ? -BigInt(c.data.metadata?.volumeTrade)
        : c.statistic?.volume
        ? -BigInt(c.statistic.volume)
        : undefined;

export default function HomeTop() {
    const { list } = useExploreCollectiblesDataList();
    const count = 12;

    let sortList = _.sortBy(list, [getReverseVolumeValue]);
    sortList = _.sortBy(sortList, [
        (c) => (isYukuSpecialCollection(c.data.info.name, c.data.info.collection) ? 1 : 0),
    ]);
    const topList = sortList?.filter((_, i) => i < count) || [];
    return (
        <>
            <div>
                <div className="h-0.5 w-full bg-gradient-to-r from-blue-300 via-fuchsia-400 to-sky-200" />
                <div className="shadow-custom blur-20 h-4 w-full bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500"></div>
            </div>
            <div className="mx-auto w-full max-w-[1920px] px-[20px] lg:px-[40px]">
                <div className="mt-[30px] flex w-full items-center justify-between md:mt-[80px]">
                    <span
                        className={`relative mr-[50px] flex cursor-pointer items-center justify-center font-[Inter-Bold] text-[20px] text-white duration-300 md:text-[28px]`}
                    >
                        Top Collections
                    </span>
                    <span className="btnHover cursor-pointer rounded-[8px] border border-[#3B4E7F] px-[15px] py-[8px] font-inter-bold text-[16px]">
                        <Link to="/marketplace/explore">View More</Link>
                    </span>
                </div>
                <div
                    key="item-top-list"
                    className="mt-[18px] grid grid-cols-1 md:h-auto md:grid-flow-col md:grid-cols-2 md:grid-rows-6 md:gap-x-[30px] xl:grid-cols-3 xl:grid-rows-4 xl:gap-x-[56px]"
                >
                    {topList.map((item, index) => (
                        <HomeTopItem
                            key={item.data.info.collection}
                            collection={item.data.info.collection}
                            statistic={item.statistic}
                            data={item.data}
                            index={index}
                        />
                    ))}
                </div>
            </div>
        </>
    );
}
