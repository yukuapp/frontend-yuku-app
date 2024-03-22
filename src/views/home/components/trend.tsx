import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Skeleton } from 'antd';
import { useQuery } from '@tanstack/react-query';
import TokenPrice from '@/components/data/price';
import NftMedia from '@/components/nft/media';
import AspectRatio from '@/components/ui/aspect-ratio';
import { useNftScoreByNftIdentifier } from '@/hooks/interval/nft/score';
import { queryHomeFeaturedArtworks } from '@/utils/apis/yuku/api_data';
import { queryNftListingData } from '@/utils/nft/listing';
import { HomeFeaturedArtwork } from '@/apis/yuku/api_data';
import { cdn } from '@/common/cdn';
import { uniqueKey } from '@/common/nft/identifier';
import { NftListingData } from '@/types/listing';

export const NftCardSkeleton = () => {
    return (
        <div className="rounded-lg">
            <div>
                <div className="relative flex h-full w-full cursor-pointer flex-col items-center justify-between rounded-lg border border-[#283047] bg-[#191E2E] px-[7px] py-[7px]">
                    <AspectRatio
                        className="flex items-center justify-center overflow-hidden rounded-lg "
                        ratio={1}
                    >
                        <Skeleton.Image
                            active={true}
                            className="flex !h-full !w-full items-center justify-center rounded-[8px]"
                        />
                    </AspectRatio>
                    <div className="items-left flex w-full flex-col pt-[11px]">
                        <Skeleton.Input
                            active={true}
                            className="mb-[12px] !h-[12px] !w-[60px] !min-w-[60px]"
                        />
                        <div className="mb-[7px] flex items-center justify-between">
                            <div className="flex items-center">
                                <Skeleton.Input
                                    active={true}
                                    className="!h-[12px] !w-[40px] !min-w-[40px] "
                                />
                            </div>
                            <Skeleton.Input className="!h-[12px] !w-[20px] !min-w-[20px] " />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const HomeTrendList = ({ item, idx }: { item: HomeFeaturedArtwork; idx: number }) => {
    const [listing, setListing] = useState<NftListingData | undefined>(undefined);

    const { score } = useNftScoreByNftIdentifier(item.token_id);
    useEffect(() => {
        queryNftListingData(item.token_id).then(setListing);
    }, [item]);

    return (
        <Link to={`/market/${uniqueKey(item.token_id)}`}>
            <div
                data-aos="fade-left"
                data-aos-anchor-placement="center-bottom"
                data-aos-delay={50 * idx}
                className="relative flex w-full flex-col overflow-hidden rounded-lg  border border-[#283047]"
            >
                <div className="absolute left-[8px] top-[8px] z-10 flex h-[19px] w-[52px] items-center justify-center rounded-[4px] bg-black bg-opacity-25 backdrop-blur-[6px]">
                    <div className="font-['Inter'] text-xs font-bold text-white">
                        RR {score?.score.order}
                    </div>
                </div>

                <div className="w-full overflow-hidden">
                    <NftMedia
                        src={cdn(item.metadata.metadata.url)}
                        whileHover={{
                            scale: 1.2,
                            transition: { duration: 0.2 },
                        }}
                        skeleton={false}
                        className="w-full object-cover"
                    />
                </div>

                <div className="flex flex-col bg-[#191E2E] pb-[10px] pt-[15px] md:pb-[10px]">
                    <p className="ml-[11px] font-['Inter'] text-sm font-semibold leading-[18px] text-[#999]">
                        {item.metadata.metadata.name}
                    </p>
                    <div className="ml-[11px] mt-[15px] flex">
                        <span className="font-['Inter'] text-sm font-semibold leading-[18px] text-white">
                            <TokenPrice
                                value={{
                                    value:
                                        listing?.latest_price && listing.latest_price !== '0'
                                            ? listing.latest_price
                                            : undefined,
                                    decimals: { type: 'exponent', value: 8 },
                                    symbol: ' ICP',
                                    scale: 2,
                                }}
                            />
                        </span>
                        &nbsp;
                        {/* <span className="font-['Inter'] text-xs font-semibold leading-[18px] text-white text-opacity-70">
                            ICP
                        </span> */}
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default function HomeTrend() {
    const [trendList, setTrendList] = useState<any>(null);

    const { data } = useQuery({
        queryKey: ['home_featured'],
        queryFn: queryHomeFeaturedArtworks,
        staleTime: Infinity,
    });

    useEffect(() => {
        setTrendList(data || []);
    }, [data]);

    return (
        <div className="mx-auto w-full max-w-[1920px] px-[20px] lg:px-[40px]">
            <div className="mt-[50px] flex w-full font-inter-semibold text-[20px] text-white md:mt-[90px] md:text-[28px]">
                Trending Items
            </div>
            <div className="mt-[20px] grid grid-cols-2 gap-x-[20px] gap-y-[20px] md:mt-[32px] md:grid-cols-4 xl:grid-cols-6 xl:gap-x-[30px] xl:gap-y-[30px]">
                {!trendList &&
                    new Array(6).fill('').map((_, index) => (
                        <div key={index} className="mb-[20px] w-full">
                            <NftCardSkeleton />
                        </div>
                    ))}
                {trendList &&
                    trendList.map((item, i) => (
                        <HomeTrendList idx={i} item={item} key={`trend_item_${i}`} />
                    ))}
            </div>
        </div>
    );
}
