import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Skeleton } from 'antd';
import TokenPrice from '@/components/data/price';
import { IconLogoLedgerIcp } from '@/components/icons';
import BuyModal from '@/components/nft-card/components/buy';
import NftMedia from '@/components/nft/media';
import UserAvatar from '@/components/user/avatar';
import { useBuyNftByTransaction } from '@/hooks/exchange/single/buy';
import { useUsername } from '@/hooks/user/username';
import { ArtStandoutCard } from '@/hooks/views/explore';
import { getMediaUrlByNftMetadata } from '@/utils/nft/metadata';
import { cdn } from '@/common/cdn';
import { cn } from '@/common/cn';
import { shrinkText } from '@/common/data/text';
import { uniqueKey } from '@/common/nft/identifier';
import { AssureLink } from '@/common/react/link';
import { NftListingData } from '@/types/listing';
import { NftMetadata } from '@/types/nft';

export function ArtSwiperSlideItem({
    item,
    update,
}: {
    item: ArtStandoutCard;
    update: () => void;
}) {
    const { principal, username } = useUsername(item.card?.owner.owner);

    const price =
        item.card?.listing?.listing.type === 'listing'
            ? item.card?.listing.listing.price
            : undefined;

    const { buy, action: buyAction } = useBuyNftByTransaction();
    const [buyNft, setBuyNft] = useState<
        { card: NftMetadata; listing: NftListingData } | undefined
    >(undefined);
    const onBuy = () => {
        if (item.card === undefined || item.card.listing === undefined) return;
        setBuyNft({
            card: item.card,
            listing: item.card.listing,
        });
    };
    const onCleanBuyNft = () => {
        setBuyNft(undefined);
    };

    return (
        <div className="flex cursor-pointer">
            <AssureLink
                to={`/market/${uniqueKey(item.art.token_id)}`}
                className="flex flex-shrink-0 items-center justify-center lg:h-[152px] lg:w-[152px] xl:h-[235px] xl:w-[235px]"
            >
                <div className="w-full">
                    <NftMedia
                        src={cdn(getMediaUrlByNftMetadata(item.card))}
                        metadata={item.card?.metadata}
                        className="rounded-[8px]"
                    />
                </div>
            </AssureLink>
            <div className="ml-[15px] flex flex-col justify-between xl:ml-[28px]">
                <div className="flex flex-col">
                    <span className="flex flex-row items-center xl:flex-col xl:items-start">
                        <div className="rounder-[8px] relative rounded-[8px] lg:h-[25px] lg:w-[25px] xl:h-[34px] xl:w-[34px]">
                            {!item.card && (
                                <Skeleton.Button className="top-0 !h-full !w-full !min-w-0 rounded-[8px]" />
                            )}
                            {item.card && (
                                <UserAvatar
                                    className="rounded-full"
                                    principal_or_account={item.card?.owner.owner}
                                />
                            )}
                        </div>
                        <Link
                            to={principal ? `/profile/${principal}` : ''}
                            className="ml-[5px] flex truncate text-[12px] text-[#fff] md:text-[14px] xl:ml-0 xl:mt-[8px]"
                        >
                            {shrinkText(username ?? principal)}
                        </Link>
                        <p className="ml-[5px] flex truncate font-inter text-[16px] text-[#fff] xl:ml-0 xl:mt-[10px]">
                            {item.art.name}
                        </p>
                    </span>
                    {/* <p className="mt-[10px] line-clamp-2 text-[16px] font-semibold text-[#000] xl:mt-[15px]">
                        {item.description}
                    </p> */}
                </div>
                <div className="flex items-center justify-start gap-x-[30px] lg:mt-[10px] xl:mt-[19px]">
                    <div className="flex items-center gap-x-[10px]">
                        <IconLogoLedgerIcp className="h-[18px] w-[18px]" />
                        <TokenPrice
                            value={{
                                value: price,
                                decimals: { type: 'exponent', value: 8 },
                            }}
                            className="ml-0 text-[12px] text-[#fff] md:text-[16px]"
                        />
                    </div>
                    <span
                        className={cn(
                            'hidden h-[36px] w-[96px] items-center justify-center rounded-sm bg-[#36F] text-[16px] text-white ',
                            price && 'flex',
                        )}
                        onClick={onBuy}
                    >
                        Buy Now
                    </span>
                    {buyNft && (
                        <BuyModal
                            card={buyNft.card}
                            listing={buyNft.listing}
                            buy={buy}
                            action={buyAction}
                            refreshListing={update}
                            onClose={onCleanBuyNft}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export function ArtBannerSkeleton() {
    return (
        <div className="mt-3 hidden justify-between  overflow-hidden lg:flex lg:h-[504px] xl:h-[753px]">
            <div className="mr-[96px] hidden items-center justify-center lg:flex lg:h-[489px] lg:w-[467px] xl:h-[738px] xl:w-[698px]">
                <Skeleton.Image className="!h-full !w-full !rounded-[16px]" />
            </div>
            <div className="flex flex-1 flex-col">
                <>
                    {['', '', ''].map((_, index) => (
                        <div key={index} className="flex w-full">
                            <div className="mb-[19px] flex w-full cursor-pointer xl:mb-[29px]">
                                <div className="flex flex-shrink-0 items-center lg:h-[152px] lg:w-[152px] xl:h-[235px] xl:w-[235px]">
                                    <Skeleton.Image className="!h-full !w-full rounded-[8px] object-cover" />
                                </div>
                                <div className="ml-[15px] flex flex-1 flex-col justify-between xl:ml-[28px]">
                                    <div className="flex flex-col">
                                        <span className="mb-[10px] flex flex-row items-center xl:mb-[15px] xl:flex-col xl:items-start">
                                            <Skeleton.Input className="!h-full !w-[50%] rounded-[8px]" />
                                        </span>
                                        <Skeleton.Input className=" !h-full !w-[80%] rounded-[8px]" />
                                    </div>
                                    <div className="flex flex-col">
                                        <Skeleton.Input className="mb-3 !h-full !w-[30%] rounded-[8px]" />
                                        <Skeleton.Button className=" !h-[36px] !w-[96px] rounded-[8px] " />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </>
            </div>
        </div>
    );
}
