import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Skeleton, Tooltip } from 'antd';
import DOMPurify from 'dompurify';
import _ from 'lodash';
import TokenPrice from '@/components/data/price';
import YukuIcon from '@/components/ui/yuku-icon';
import Username from '@/components/user/username';
import { useEntrepotFloor } from '@/hooks/nft/listing';
import { getCollectionStatistics } from '@/utils/apis/yuku/api_data';
import { CollectionStatistics } from '@/apis/yuku/api_data';
import { cdn, url_cdn } from '@/common/cdn';
import { cn } from '@/common/cn';
import { assureHttp } from '@/common/data/http';
import { string2bigint } from '@/common/types/bigint';
import { NftTokenOwner } from '@/types/nft';
import { CoreCollectionData } from '@/types/yuku';

const mediaList: { name: string; size: number }[] = [
    { name: 'twitter', size: 15 },
    { name: 'medium', size: 15 },
    { name: 'discord', size: 22 },
    { name: 'website', size: 17 },
    { name: 'instagram', size: 18 },
    { name: 'telegram', size: 15 },
];
function MarketCollectionHeader({
    data,
    owners,
}: {
    data?: CoreCollectionData;
    owners?: NftTokenOwner[];
}) {
    const { t } = useTranslation();
    const textLimit = useRef(200);
    const [statistic, setStatistic] = useState<CollectionStatistics | undefined>(undefined);

    const [showReadMore, setShowReadMore] = useState<boolean>(false);
    const [fold, setFold] = useState<boolean>(showReadMore);
    useEffect(() => {
        if (data === undefined) return;
        const info = data.info;
        if (info && info.description) {
            const desc = info.description;
            setShowReadMore(desc.length > textLimit.current ? true : false);
            setFold(desc.length > 150 ? true : false);
        }
        getCollectionStatistics(data.info.collection).then(setStatistic);
    }, [data]);

    const entrepot_floor = useEntrepotFloor(data?.info.collection);
    const common_floor = statistic?.floor === '0' ? undefined : statistic?.floor;
    const floor =
        string2bigint(common_floor ?? '0') < string2bigint(entrepot_floor ?? '0')
            ? common_floor ?? entrepot_floor
            : entrepot_floor ?? common_floor;
    return (
        <div className="market-collection-header -mt-[44px]   md:-mt-[75px]">
            {!data ||
                (data.info.banner !== undefined && (
                    <div className="relative h-[430px] w-full">
                        <div className="absolute bottom-0 left-0 right-0 top-0 h-full w-full bg-gradient-to-b from-[#10152266] to-[#101522]"></div>
                        {data?.info.banner ? (
                            <div
                                className=" block h-full w-full  bg-cover bg-center bg-no-repeat"
                                style={{ backgroundImage: `${url_cdn(data?.info.banner)}` }}
                            />
                        ) : (
                            <Skeleton.Image className="!h-full !min-h-0 !w-full" active />
                        )}
                        <div className="absolute bottom-0 left-[15px] right-[15px] flex flex-col lg:left-[30px] lg:right-[30px]">
                            <div className="bottom-[-64px] left-[40px] h-[60px] w-[60px] rounded-[16px] lg:h-[92px] lg:w-[92px]">
                                {data?.info.logo ? (
                                    <img
                                        className="h-full w-full rounded-[16px]"
                                        src={cdn(data.info.logo)}
                                    />
                                ) : (
                                    <Skeleton.Avatar active={true} />
                                )}
                            </div>
                            <div className="flex w-full flex-col lg:flex-row">
                                <div className="flex flex-1 flex-col">
                                    <div className="mt-[15px] flex flex-col items-start justify-start gap-x-[26px] lg:mt-[30px] lg:flex-row">
                                        <div className="font-inter-bold text-[18px] text-white lg:text-[24px]">
                                            {data?.info.name ? (
                                                data.info.name
                                            ) : (
                                                <Skeleton
                                                    title={false}
                                                    active={true}
                                                    paragraph={{ rows: 3 }}
                                                />
                                            )}
                                        </div>
                                        <div className="mt-[10px] flex h-full items-center lg:mt-0">
                                            <div className="hidden h-6 w-px bg-white/60 lg:flex"></div>
                                            <div className="flex items-center justify-between gap-x-[20px] lg:ml-[26px]">
                                                {data?.info.links &&
                                                    mediaList
                                                        .filter((m) => data.info.links![m.name])
                                                        .map((m) => ({
                                                            name: m.name,
                                                            size: m.size,
                                                            link: data.info.links![m.name],
                                                        }))
                                                        .map(({ name, size, link }) => (
                                                            <Link
                                                                key={name}
                                                                to={assureHttp(link)}
                                                                className="flex"
                                                                target="_blank"
                                                            >
                                                                <Tooltip
                                                                    placement="top"
                                                                    title={name}
                                                                >
                                                                    <YukuIcon
                                                                        name={`media-${name}`}
                                                                        size={size}
                                                                        color="white"
                                                                        className="m-auto cursor-pointer transition-opacity hover:opacity-50"
                                                                    />
                                                                </Tooltip>
                                                            </Link>
                                                        ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="font-inter-normal mb-[10px] mt-[10px] flex-shrink-0 text-[16px] text-white">
                                        {data ? (
                                            <>
                                                @
                                                <Username
                                                    principal_or_account={data.info.creator}
                                                    className="text-[16px] text-white"
                                                />
                                            </>
                                        ) : (
                                            <Skeleton
                                                title={false}
                                                active={true}
                                                paragraph={{ rows: 3 }}
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className="mt-[10px] flex items-center justify-between gap-x-[20px] overflow-x-scroll lg:mt-0 lg:gap-x-[57px]">
                                    <div className="flex flex-shrink-0 flex-col items-center justify-between gap-y-[18px]">
                                        <div className="text-center font-inter-semibold text-[12px] leading-none text-white lg:text-[14px]">
                                            {data || statistic ? (
                                                <TokenPrice
                                                    value={{
                                                        value: floor ?? '0',
                                                        decimals: { type: 'exponent', value: 8 },
                                                        symbol: 'ICP',
                                                        scale: 2,
                                                        paddingEnd: 0,
                                                        symbolClassName: true,
                                                    }}
                                                    className="text-[12px] lg:text-[14px]"
                                                />
                                            ) : (
                                                <Skeleton
                                                    title={false}
                                                    active={true}
                                                    paragraph={{ rows: 1 }}
                                                />
                                            )}
                                        </div>
                                        <div className="text-center font-inter-medium text-[12px] leading-none text-white/[.60] lg:text-[14px]">
                                            Floor Price
                                        </div>
                                    </div>
                                    <div className="flex flex-shrink-0 flex-col items-center justify-between gap-y-[18px]">
                                        <div className="text-center font-inter-semibold text-[12px] leading-none text-white lg:text-[14px]">
                                            {data?.metadata?.volumeTrade ? (
                                                <TokenPrice
                                                    value={{
                                                        value: data?.metadata?.volumeTrade,
                                                        decimals: { type: 'exponent', value: 8 },
                                                        symbol: 'ICP',
                                                        scale: 2,
                                                        thousand: { symbol: 'K' },
                                                        symbolClassName: true,
                                                    }}
                                                    className="text-[12px] lg:text-[14px]"
                                                />
                                            ) : (
                                                <Skeleton
                                                    title={false}
                                                    active={true}
                                                    paragraph={{ rows: 1 }}
                                                />
                                            )}
                                        </div>
                                        <div className="text-center font-inter-medium text-[12px] leading-none text-white/[.60] lg:text-[14px]">
                                            Volume Traded
                                        </div>
                                    </div>
                                    <div className="flex flex-shrink-0 flex-col items-center justify-between gap-y-[18px]">
                                        <div className="text-center font-inter-semibold text-[12px] leading-none text-white lg:text-[14px]">
                                            {owners ? (
                                                owners.length
                                            ) : (
                                                <Skeleton
                                                    title={false}
                                                    active={true}
                                                    paragraph={{ rows: 1 }}
                                                />
                                            )}
                                        </div>
                                        <div className="text-center font-inter-medium text-[12px] leading-none text-white/[.60] lg:text-[14px]">
                                            Items
                                        </div>
                                    </div>
                                    <div className="flex flex-shrink-0 flex-col items-center justify-between gap-y-[18px]">
                                        <div className="text-center font-inter-semibold text-[12px] leading-none text-white lg:text-[14px]">
                                            {data?.info.royalties ? (
                                                `${data.info.royalties}%`
                                            ) : (
                                                <Skeleton
                                                    title={false}
                                                    active={true}
                                                    paragraph={{ rows: 1 }}
                                                />
                                            )}
                                        </div>
                                        <div className="text-center font-inter-medium text-[12px] leading-none text-white/[.60] lg:text-[14px]">
                                            Creator Royalty
                                        </div>
                                    </div>
                                    <div className="flex flex-shrink-0 flex-col items-center justify-between gap-y-[18px]">
                                        <div className="text-center font-inter-semibold text-[12px] leading-none text-white lg:text-[14px]">
                                            {owners
                                                ? _.uniq(owners.map((o) => o.owner)).length
                                                : '--'}
                                        </div>
                                        <div className="text-center font-inter-medium text-[12px] leading-none text-white/[.60] lg:text-[14px]">
                                            Owners
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

            <div className="mx-[15px] mt-[15px] flex flex-col items-start justify-between md:mx-[40px] lg:mx-[30px] lg:mt-[0]">
                <div className="flex items-center text-[16px]">
                    <div className="font-inter">Canister ID:</div>
                    &nbsp;
                    <Link
                        className="font-inter-medium underline"
                        to={`https://dashboard.internetcomputer.org/canister/${data?.info.collection}`}
                        target="_blank"
                    >
                        {data?.info.collection}
                    </Link>
                </div>
                <div
                    className={cn(
                        'mb-[30px] mt-[10px] flex-shrink-0 font-inter text-[14px] text-sm leading-[1.3125rem] text-[#737375] text-white/[.60] lg:mt-[30px] lg:w-[502px]',
                    )}
                >
                    {data ? (
                        <>
                            <div
                                className={cn(
                                    'h-[60px] overflow-y-hidden',
                                    !(showReadMore && fold) && 'h-fit',
                                )}
                                dangerouslySetInnerHTML={{
                                    __html: DOMPurify.sanitize(data.info.description),
                                }}
                            ></div>
                            {showReadMore ? (
                                <span
                                    onClick={() => setFold(!fold)}
                                    className="group mt-3 inline-block cursor-pointer font-inter-bold leading-[149.99%] text-white"
                                >
                                    {fold ? t('launchpad.main.readMore') : 'Show less'}
                                </span>
                            ) : null}
                        </>
                    ) : (
                        // data.info.description
                        <Skeleton title={false} active={true} paragraph={{ rows: 3 }} />
                    )}
                </div>
            </div>
        </div>
    );
}

export default MarketCollectionHeader;
