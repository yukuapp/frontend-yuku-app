import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Skeleton } from 'antd';
import { motion } from 'framer-motion';
import _ from 'lodash';
import { useCollectionDataList } from '@/hooks/nft/collection';
import { useEntrepotFloor } from '@/hooks/nft/listing';
import { useCollectionData, useCollectionTokenOwners } from '@/hooks/views/market';
import { getCollectionStatistics } from '@/utils/apis/yuku/api_data';
import { CollectionStatistics, HomeHotCollection } from '@/apis/yuku/api_data';
import { cdn } from '@/common/cdn';
import { cn } from '@/common/cn';
import { string2bigint } from '@/common/types/bigint';
import { useDeviceStore } from '@/stores/device';
import { UniqueCollectionData } from '@/types/yuku';
import ShowNumber from '../data/number';
import TokenPrice from '../data/price';
import NftMedia from './media';

export function CollectionCard({
    collection,
    hot,
    statistic,
    data,
}: {
    collection: string;
    hot?: HomeHotCollection;
    statistic?: CollectionStatistics;
    data?: UniqueCollectionData;
}) {
    const { t } = useTranslation();

    const { isMobile } = useDeviceStore((s) => s.deviceInfo);

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

    const featured = hot?.info.featured ?? data?.info.featured ?? innerData?.info.featured;
    const logo = hot?.info.logo ?? data?.info.logo ?? innerData?.info.logo;
    const name = hot?.info.name ?? data?.info.name ?? innerData?.info.name;

    const floor =
        data?.metadata?.floorPrice ??
        innerData?.metadata?.floorPrice ??
        statistic?.floor ??
        innerStatistic?.floor;
    const owners = statistic?.owners ?? innerStatistic?.owners;
    const volume =
        data?.metadata?.volumeTrade ??
        innerData?.metadata?.volumeTrade ??
        statistic?.volume ??
        innerStatistic?.volume;

    return (
        <motion.div
            className="flex cursor-pointer flex-col overflow-hidden rounded-[8px] shadow-home-card"
            whileHover={
                !isMobile
                    ? {
                          transform: 'translateY(-8px)',
                          transition: {
                              duration: 0.2,
                          },
                      }
                    : undefined
            }
        >
            <Link to={`/market/${collection}`}>
                <NftMedia src={cdn(featured)} skeleton={false} />
                <div className="px-[9px] pb-3 pt-4">
                    <div className="flex items-center">
                        <img
                            className="mr-[6px] h-[24px] rounded-[8px] md:h-[33px] md:w-[33px]"
                            src={cdn(logo)}
                        />
                        <div className="truncate overflow-ellipsis font-[Inter-SemiBold] text-[10px] leading-[20px] text-[#000] md:ml-0 md:text-[14px]">
                            {name}
                        </div>
                    </div>
                    <div className="mt-[5px] grid grid-cols-3 md:mt-[13.7px]">
                        <div className="flex w-fit flex-shrink-0 flex-col gap-y-[6px] md:gap-y-[12px]">
                            <span className="scale-[0.8] text-left font-inter-medium text-[12px] text-[#999] md:scale-100">
                                {t('home.notable.floor')}
                            </span>
                            <div className="flex scale-[0.8] items-center text-[12px] font-semibold leading-4 text-white md:scale-100 md:text-[16px]">
                                <TokenPrice
                                    value={{
                                        value: floor && Number(floor) > 0 ? floor : undefined,
                                        decimals: { type: 'exponent', value: 8 },
                                        scale: 1,
                                        paddingEnd: 1,
                                        thousand: { symbol: 'K' },
                                    }}
                                />
                                <b className="text-[12px] leading-4 text-white/60 md:text-[14px]">
                                    &nbsp;ICP
                                </b>
                            </div>
                        </div>
                        <div className="flex w-full flex-shrink-0 flex-col items-center gap-y-[6px] md:gap-y-[12px]">
                            <span className="scale-[0.8] text-center font-inter-medium text-[12px] text-[#999] md:scale-100">
                                {t('home.notable.owners')}
                            </span>
                            <div className="flex scale-[0.8] items-center text-[12px] font-semibold leading-4 text-white md:scale-100 md:text-[16px]">
                                {owners ?? '--'}
                            </div>
                        </div>
                        <div className="flex w-full flex-shrink-0 flex-col gap-y-[6px] md:gap-y-[12px]">
                            <span className="scale-[0.8] truncate  overflow-ellipsis text-right font-inter-medium text-[12px] text-[#999] md:scale-100">
                                {t('home.notable.volume')}
                            </span>
                            <div className="flex scale-[0.8] items-center justify-end text-[12px] font-semibold leading-4 text-white md:scale-100 md:text-[16px]">
                                <TokenPrice
                                    value={{
                                        value: volume,
                                        decimals: { type: 'exponent', value: 8 },
                                        scale: 1,
                                        thousand: { symbol: 'K' },
                                    }}
                                />
                                <b className="text-[12px] leading-4 text-white/60 md:text-[14px]">
                                    &nbsp;ICP
                                </b>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

export const CollectionCardNew = ({
    collection,
    hot,
    statistic,
    data,
    index,
    curPage,
    size,
}: {
    index: number;
    collection: string;
    hot?: HomeHotCollection;
    statistic?: CollectionStatistics;
    data?: UniqueCollectionData;
    curPage?: number;
    size?: number;
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

    const entrepot_floor = useEntrepotFloor(data?.info.collection);
    const common_floor = innerStatistic?.floor === '0' ? undefined : innerStatistic?.floor;
    const floor =
        string2bigint(common_floor ?? '0') < string2bigint(entrepot_floor ?? '0')
            ? common_floor ?? entrepot_floor
            : entrepot_floor ?? common_floor;
    const volume =
        data?.metadata?.volumeTrade ??
        innerData?.metadata?.volumeTrade ??
        statistic?.volume ??
        innerStatistic?.volume;
    const rate = innerStatistic?.rate || 0;

    const coreCollectionData = useCollectionData(collection);

    const items = useCollectionTokenOwners(collection, coreCollectionData);
    return (
        <>
            <Link
                className="group relative mb-[24px] hidden h-[64px] w-full items-center xl:flex"
                to={`/market/${collection}`}
            >
                <div className="absolute -bottom-[12px] -left-[12px] -right-[10px] -top-[10px] z-[-1] rounded-[8px] transition-all duration-200 group-hover:bg-[#283047]"></div>
                <p className="flex w-[72px] text-[14px] font-semibold text-white/70">
                    {(curPage || 0) * (size || 0) + index + 1}
                </p>
                <div className="flex flex-1 items-center">
                    <img
                        className="h-[64px] w-[64px] flex-shrink-0 rounded-[8px]"
                        src={logo}
                        alt=""
                    />
                    <p className="col-span-1 ml-[20px] flex break-all text-[14px] font-semibold text-white">
                        {name}
                    </p>
                </div>
                <div className="flex w-[180px] text-[14px] font-semibold text-white xl:w-[10%]">
                    <TokenPrice
                        value={{
                            value: floor && Number(floor) > 0 ? floor : undefined,
                            decimals: { type: 'exponent', value: 8 },
                            scale: 2,
                            paddingEnd: 0,
                            thousand: { symbol: 'K' },
                        }}
                    />
                    <b className="text-[14px] leading-4 text-white md:text-[16px]">&nbsp;ICP</b>
                </div>
                <div className="flex w-[180px] text-[14px] font-semibold text-white xl:w-[10%]">
                    <TokenPrice
                        value={{
                            value: volume,
                            decimals: { type: 'exponent', value: 8 },
                            scale: 2,
                            paddingEnd: 0,
                            thousand: { symbol: 'K' },
                        }}
                    />
                    <b className="text-[14px] leading-4 text-white md:text-[16px]">&nbsp;ICP</b>
                </div>
                <p className="flex w-[180px] text-[14px] font-semibold text-white xl:w-[10%]">
                    {items ? _.uniq(items?.map((o) => o.owner)).length : '--'}
                </p>
                <p
                    className={cn(
                        'flex w-[180px] text-[14px] font-semibold text-[#00AC4F] xl:w-[10%]',
                        rate < 0 && 'text-[#be3636]',
                    )}
                >
                    {(rate < 0 ? '' : '+') + (rate.toFixed(2) + '%')}
                </p>
                <ShowNumber
                    value={{
                        value: items?.length ? `${items?.length}` : undefined,
                        thousand: { symbol: ['M', 'K'] },
                        scale: 2,
                    }}
                    className="flex w-[50px] justify-end text-[14px] font-semibold text-white  xl:w-[10%]"
                />
            </Link>
            <Link
                className="mb-[24px] flex h-[50px] w-full items-center xl:hidden"
                to={`/market/${collection}`}
            >
                <div className="mr-[15px] flex w-[80px] flex-none flex-shrink-0 items-center justify-between md:mr-0 md:w-auto md:flex-[0.5]">
                    <div className="text-sm text-white/70">
                        {(curPage || 0) * (size || 0) + index + 1}
                    </div>
                    <img
                        className="flex h-[50px] w-[50px] flex-shrink-0 rounded-[8px]"
                        src={logo}
                        alt=""
                    />
                </div>
                <div className="xs:flex-[1.5] flex h-full flex-[1] flex-shrink-0  flex-col justify-between overflow-hidden">
                    <p className="w-[180px] truncate text-[14px] font-semibold text-white">
                        {name}
                    </p>
                    <div>
                        <b className="text-[14px] leading-4 text-white/80">Floor</b>
                        &nbsp;
                        <TokenPrice
                            value={{
                                value: floor && Number(floor) > 0 ? floor : undefined,
                                decimals: { type: 'exponent', value: 8 },
                                scale: 2,
                                paddingEnd: 0,
                                thousand: { symbol: 'K' },
                            }}
                            className="text-[14px] leading-4 md:text-[14px]"
                        />
                        <b className="text-[14px] leading-4 text-white/80 md:text-[14px]">
                            &nbsp;ICP
                        </b>
                    </div>
                </div>
                <div className="flex h-full flex-none flex-shrink-0 flex-col items-end justify-between md:flex-[1] xl:w-[10%]">
                    <div className="">
                        <TokenPrice
                            value={{
                                value: volume,
                                decimals: { type: 'exponent', value: 8 },
                                scale: 2,
                                thousand: { symbol: 'K' },
                            }}
                            className="text-[14px] leading-none md:text-[14px]"
                        />
                        <b className="text-[14px] leading-none text-white md:text-[14px]">
                            &nbsp;ICP
                        </b>
                    </div>
                    <p
                        className={cn(
                            'flex w-fit text-right text-[14px] font-semibold text-[#00AC4F]',
                            rate < 0 && 'text-[#be3636]',
                        )}
                    >
                        {(rate < 0 ? '' : '+') + (rate.toFixed(2) + '%')}
                    </p>
                </div>
            </Link>
        </>
    );
};

export const CollectionCardSkeletonNew = () => {
    return (
        <div className="mb-[24px] flex h-[64px] w-full items-center">
            <p className="flex w-[72px] text-[14px] font-semibold text-white/70"></p>
            <div className="flex flex-1 items-center">
                <div className="h-[64px] w-[64px] rounded-[8px]">
                    <Skeleton.Image className="!h-full !w-full !min-w-0" />
                </div>
                <div className="ml-[20px] h-[14px]">
                    <Skeleton.Input className="!h-full !w-full rounded-[4px] bg-[#e8e8e8]" />
                </div>
            </div>
            <div className="ml-[20px] flex h-[14px] w-[180px] text-[14px] font-semibold text-white">
                <Skeleton.Input className="!h-full !w-[80%] rounded-[4px] bg-[#e8e8e8]" />
            </div>
            <div className="flex h-[14px] w-[180px] text-[14px] font-semibold text-white">
                <Skeleton.Input className="!h-full !w-[80%] rounded-[4px] bg-[#e8e8e8]" />
            </div>
            <div className="flex h-[14px] w-[180px] text-[14px] font-semibold text-white">
                <Skeleton.Input className="!h-full !w-[80%] rounded-[4px] bg-[#e8e8e8]" />
            </div>
            <div className="flex h-[14px] w-[180px] text-[14px] font-semibold text-white">
                <Skeleton.Input className="!h-full !w-[80%] rounded-[4px] bg-[#e8e8e8]" />
            </div>

            <p className="flex w-[50px] justify-end text-[14px] font-semibold text-white/70"></p>
        </div>
    );
};

export const CollectionCardSkeleton = () => {
    return (
        <div className="flex cursor-pointer flex-col overflow-hidden rounded-[8px] shadow-home-card">
            <Skeleton.Image className="!h-[180px] !w-full md:!h-[290px]" />
            <div className="flex w-full px-3 py-3">
                <div className="flex !h-[33px] !w-1/2">
                    <Skeleton.Button className="flex !h-[33px] !w-full" />
                </div>
            </div>
            <div className="grid w-full grid-cols-3 gap-x-[10px] px-3 pb-1 md:gap-x-[30px]">
                <div className="flex !h-[20px]">
                    <Skeleton.Input className="flex !h-[20px] !w-full !min-w-0" />
                </div>
                <div className="flex !h-[20px]">
                    <Skeleton.Input className="flex !h-[20px] !w-full !min-w-0" />
                </div>
                <div className="flex !h-[20px]">
                    <Skeleton.Input className="flex !h-[20px] !w-full !min-w-0" />
                </div>
            </div>
            <div className="grid w-full grid-cols-3 gap-x-[10px] px-3 pb-3 md:gap-x-[30px]">
                <div className="flex !h-[20px]">
                    <Skeleton.Input className="flex !h-[20px] !w-full !min-w-0" />
                </div>
                <div className="flex !h-[20px]">
                    <Skeleton.Input className="flex !h-[20px] !w-full !min-w-0" />
                </div>
                <div className="flex !h-[20px]">
                    <Skeleton.Input className="flex !h-[20px] !w-full !min-w-0" />
                </div>
            </div>
        </div>
    );
};
