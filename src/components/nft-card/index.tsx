import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Skeleton } from 'antd';
import { motion } from 'framer-motion';
import { shallow } from 'zustand/shallow';
import { useBuyNftByTransaction } from '@/hooks/exchange/single/buy';
import { useHoldNft } from '@/hooks/exchange/single/hold';
import { useSellNftByTransaction } from '@/hooks/exchange/single/sell';
import { useTransferNftByTransaction } from '@/hooks/exchange/single/transfer';
import { useShowBlindBoxButton } from '@/hooks/nft/functions/blind';
import { useShowBuyButton } from '@/hooks/nft/functions/buy';
import { useShowCartButton } from '@/hooks/nft/functions/cart';
import { useShowHoldButton } from '@/hooks/nft/functions/hold';
import { useShowChangePriceButton, useShowSellButton } from '@/hooks/nft/functions/sell';
import { useShowTicketButton } from '@/hooks/nft/functions/ticket';
import { useShowTransferButton } from '@/hooks/nft/functions/transfer';
import { useNftPath } from '@/hooks/nft/link';
import { useNftListing } from '@/hooks/nft/listing';
import { useNftScore } from '@/hooks/nft/score';
import {
    getMediaUrlByNftMetadata,
    getNameByNftMetadata,
    getThumbnailByNftMetadata,
} from '@/utils/nft/metadata';
import { cdn_by_resize } from '@/common/cdn';
import { cn } from '@/common/cn';
import { isSameNftByTokenId, uniqueKey } from '@/common/nft/identifier';
import { justPreventLink, preventLink } from '@/common/react/link';
import { useDeviceStore } from '@/stores/device';
import { useIdentityStore } from '@/stores/identity';
import { NftListingListing } from '@/types/listing';
import { NftMetadata } from '@/types/nft';
import TokenPrice from '../data/price';
import NftMedia from '../nft/media';
import AspectRatio from '../ui/aspect-ratio';
import BatchListingButton from './functions/batch';
import BlindBoxButton from './functions/blind';
import BuyButton from './functions/buy';
import CartButton from './functions/cart';
import FavoriteButton from './functions/favorite';
import HoldButton from './functions/hold';
import SellButton from './functions/sell';
import TicketButton from './functions/ticket';
import TransferButton from './functions/transfer';
import './index.less';

export type NftCardMode = ':profile' | ':market:middle' | ':market:small';

function NftCard({
    mode,
    card,
    refreshList,
    updateItem,
}: {
    mode: NftCardMode;
    card: NftMetadata;
    refreshList?: () => void;
    updateItem?: (item: NftMetadata) => void;
}) {
    const { isMobile } = useDeviceStore((s) => s.deviceInfo);

    // self
    const { connectedIdentity, sweepMode, sweepItems } = useIdentityStore(
        (s) => ({
            connectedIdentity: s.connectedIdentity,
            sweepMode: s.sweepMode,
            sweepItems: s.sweepItems,
        }),
        shallow,
    );
    const self = !!connectedIdentity && card.owner.owner === connectedIdentity.account;
    console.debug('🚀 ~ self:', self);
    const path = useNftPath(card);

    const score = useNftScore(card, updateItem);

    const { loading, listing, refresh } = useNftListing(card, updateItem);

    const afterBid = useCallback(() => {
        refresh();
        refreshList && refreshList();
    }, [refreshList, refresh]);

    const { sell, executing } = useSellNftByTransaction();
    const { hold, action: holdingAction } = useHoldNft();
    const { transfer, action: transferAction } = useTransferNftByTransaction();
    const { buy, action: buyAction } = useBuyNftByTransaction();
    const { shoppingCartItems } = useIdentityStore((s) => ({
        shoppingCartItems: s.shoppingCartItems,
    }));

    const showCartButton = useShowCartButton(card, listing);
    const showSellButton = useShowSellButton(card, listing);
    const showChangePriceButton = useShowChangePriceButton(card, listing, holdingAction);
    const showHoldButton = useShowHoldButton(card, listing);
    const showTransferButton = useShowTransferButton(card, listing);
    const showBlindBoxButton = useShowBlindBoxButton(card, listing);
    const showTicketButton = useShowTicketButton(card);

    const showBuyButton = useShowBuyButton(card, listing);

    const [extra, setExtra] = useState<boolean>(false);

    const batchSales = useIdentityStore((s) => s.batchSales);

    const showBorder = !sweepMode
        ? batchSales.find((l) => isSameNftByTokenId(l, card.owner)) ||
          shoppingCartItems?.find((l) => isSameNftByTokenId(l, card.owner))
        : card.data?.info.collection &&
          sweepItems[card.data?.info.collection]?.find((l) => isSameNftByTokenId(l, card.owner));

    const isMarket = mode === ':market:middle' || mode === ':market:small';

    const [srcUrl, setSrcUrl] = useState<string | undefined>(getThumbnailByNftMetadata(card));

    return (
        <>
            <motion.div
                initial={{ transform: 'none' }}
                whileHover={
                    !isMobile
                        ? {
                              boxShadow: '0px 8px 25px rgba(88, 88, 88, 0.15)',
                              marginTop: -5,
                          }
                        : undefined
                }
                className={cn(
                    'relative rounded-[12px] border border-[#283047]',
                    showBorder && ' border-shiku',
                )}
                onHoverEnd={() => !isMobile && setExtra(false)}
                key={uniqueKey(card.metadata.token_id)}
            >
                <Link to={path} state={{ card }}>
                    <div
                        className={cn(
                            'group box-border flex h-full w-full cursor-pointer flex-col items-center justify-between rounded-[10px]  border-[1px] border-[#283047] bg-[#191E2E] px-[7px] py-[7px]',
                            showBorder && ' border-shiku',
                        )}
                    >
                        <AspectRatio
                            className="flex items-center justify-center overflow-hidden rounded-[8px] "
                            ratio={1}
                        >
                            <div
                                className="flex h-full w-full items-center justify-center rounded-[8px]"
                                onMouseEnter={() => setSrcUrl(getMediaUrlByNftMetadata(card))}
                                onMouseLeave={() => setSrcUrl(getThumbnailByNftMetadata(card))}
                            >
                                {/* <img src={cdn(getThumbnailByNftMetadata(card))} /> */}
                                <NftMedia
                                    src={cdn_by_resize(srcUrl, {
                                        width: 800,
                                    })}
                                    metadata={card.metadata}
                                    whileHover={{
                                        scale: 1.2,
                                        transition: { duration: 0.2 },
                                    }}
                                    skeleton={false}
                                    className="rounded-[8px]"
                                />
                            </div>
                            {card.metadata.raw.standard !== 'ogy' && (
                                <FavoriteButton card={card} identity={connectedIdentity} />
                            )}
                            {card?.listing?.listing.type === 'listing' &&
                                card?.listing?.listing.raw.type === 'entrepot' && (
                                    <div className="absolute bottom-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-500 bg-opacity-60 px-[2px]">
                                        <img
                                            className="h-4 w-4"
                                            src={'/img/logo/entrepot.png'}
                                            alt=""
                                        />
                                    </div>
                                )}
                            {score && (
                                <div className="absolute left-[8px] top-[9px] z-30 rounded-[4px] bg-black/25 px-[6px] py-[2px] font-inter-bold text-[12px] text-white">
                                    RR<span className="ml-[6px]">{score.score.order}</span>
                                </div>
                            )}
                            {
                                <BatchListingButton
                                    card={card}
                                    listing={listing}
                                    identity={connectedIdentity}
                                />
                            }
                        </AspectRatio>
                        <div className="items-left flex w-full flex-col pt-[11px]">
                            <div
                                className={cn([
                                    'min-h-2 mb-[12px] w-full truncate text-[12px] text-sm font-semibold text-[#999]',
                                ])}
                            >
                                {getNameByNftMetadata(card)}
                            </div>
                            <div className="mb-[7px] flex items-center justify-between">
                                <div
                                    className={cn(
                                        'flex items-end font-inter-medium',
                                        // isMarket && 'group-hover:hidden',
                                    )}
                                >
                                    {!loading && listing?.listing.type === 'listing' ? (
                                        <>
                                            <TokenPrice
                                                value={{
                                                    value: listing.listing.price,
                                                    token: listing.listing.token,
                                                    scale: 2,
                                                    decimals: {
                                                        type: 'exponent',
                                                        value: (
                                                            listing.listing as NftListingListing
                                                        ).token.decimals,
                                                    },
                                                    symbol: '',
                                                    thousand: { symbol: 'K' },
                                                }}
                                                className="mr-[5px] font-inter-semibold text-[14px] leading-none text-white"
                                            />
                                            <span
                                                className={cn(
                                                    'font-inter-semibold text-[14px] leading-none text-white md:text-[16px]',
                                                )}
                                            >
                                                {listing?.listing.type === 'listing'
                                                    ? listing.listing.token.symbol
                                                    : 'ICP'}
                                            </span>
                                        </>
                                    ) : (
                                        <div className="text-[14px] leading-[20px] text-white">
                                            --
                                        </div>
                                    )}
                                </div>
                                {isMarket &&
                                    !isMobile &&
                                    showCartButton &&
                                    showBuyButton &&
                                    !sweepMode && (
                                        <div className="absolute bottom-0 left-0 hidden h-[33px] w-full items-center justify-between overflow-hidden rounded-b-[8px] bg-black group-hover:flex">
                                            <BuyButton
                                                className="h-[33px] flex-1 bg-shiku text-center font-inter-semibold text-[14px] leading-[33px]   text-white"
                                                card={card}
                                                listing={listing}
                                                buy={buy}
                                                action={buyAction}
                                                refreshListing={afterBid}
                                            />
                                            <CartButton
                                                className="h-[33px] border-l border-white bg-shiku px-[10px]"
                                                card={card}
                                                listing={listing}
                                                isMarket={isMarket}
                                            />
                                        </div>
                                    )}
                                {showTicketButton && (
                                    <div
                                        className="z-50 ml-auto mr-[10px]"
                                        onClick={justPreventLink}
                                    >
                                        <TicketButton card={card} identity={connectedIdentity} />
                                    </div>
                                )}
                                {(showTransferButton ||
                                    showSellButton ||
                                    showChangePriceButton ||
                                    showCartButton ||
                                    showBuyButton ||
                                    showHoldButton ||
                                    showBlindBoxButton) &&
                                    (!isMarket || (isMarket && isMobile)) && (
                                        <div
                                            className="group/edit relative h-[20px] w-[20px] cursor-pointer"
                                            onClick={justPreventLink}
                                        >
                                            <img
                                                className="pointer-events-auto block h-[20px] w-[20px] "
                                                src={''}
                                                alt=""
                                                onMouseEnter={preventLink(() => {
                                                    setExtra(true);
                                                })}
                                            />
                                            <div
                                                className={cn(
                                                    'absolute right-[-50%] top-0 z-50 hidden pt-[26px]',
                                                    extra ? 'block' : 'hidden',
                                                )}
                                            >
                                                <ul
                                                    className="absolute right-full top-full z-50 cursor-pointer rounded-[4px] border border-solid border-[#283047] bg-[#283047] font-inter-semibold text-[12px]  shadow-[0_2px_15px_0_rgba(81,81,81,.25)]"
                                                    onClick={() => setExtra(false)}
                                                    onMouseLeave={() => setExtra(false)}
                                                >
                                                    {showTransferButton && (
                                                        <li className="relative h-[33px] w-[105px] ">
                                                            <TransferButton
                                                                className="absolute left-0 top-0 h-[33px] w-[105px]  px-[11px] text-left  leading-[33px] text-white"
                                                                card={card}
                                                                listing={listing}
                                                                identity={connectedIdentity}
                                                                transfer={transfer}
                                                                action={transferAction}
                                                                refreshList={
                                                                    refreshList ?? (() => {})
                                                                }
                                                            />
                                                        </li>
                                                    )}

                                                    {showSellButton && (
                                                        <li className="relative h-[33px] w-[105px] text-center ">
                                                            <SellButton
                                                                className="absolute left-0 top-0 h-[33px] w-[105px] px-[11px] text-left leading-[33px] text-white"
                                                                card={card}
                                                                listing={listing}
                                                                holdingAction={holdingAction}
                                                                identity={connectedIdentity}
                                                                sell={sell}
                                                                executing={executing}
                                                                refreshListing={refresh}
                                                            />
                                                        </li>
                                                    )}

                                                    {showChangePriceButton &&
                                                        listing?.listing.type === 'listing' && (
                                                            <li className="relative h-[33px] w-[105px] text-center hover:bg-[#283047]">
                                                                <SellButton
                                                                    className="absolute left-0 top-0 h-[33px] w-[105px] px-[11px] text-left leading-[33px] text-white hover:bg-[#283047]/60"
                                                                    card={card}
                                                                    listing={listing}
                                                                    holdingAction={holdingAction}
                                                                    lastPrice={
                                                                        listing.listing.price
                                                                    }
                                                                    identity={connectedIdentity}
                                                                    sell={sell}
                                                                    executing={executing}
                                                                    refreshListing={refresh}
                                                                />
                                                            </li>
                                                        )}

                                                    {showCartButton && (
                                                        <li className="relative h-[33px] w-[105px] px-[11px] text-left leading-[33px] text-white hover:bg-[#283047]">
                                                            <CartButton
                                                                className="absolute left-0 top-0 h-[33px] w-[105px] px-[11px] text-left"
                                                                card={card}
                                                                listing={listing}
                                                            />
                                                        </li>
                                                    )}
                                                    {showBuyButton && (
                                                        <li className="relative h-[33px] w-[105px] hover:bg-[#283047]">
                                                            <BuyButton
                                                                className="absolute left-0 top-0 h-[33px] w-[105px] px-[11px] text-left leading-[33px]  text-white"
                                                                card={card}
                                                                listing={listing}
                                                                buy={buy}
                                                                action={buyAction}
                                                                refreshListing={afterBid}
                                                            />
                                                        </li>
                                                    )}
                                                    {showHoldButton && (
                                                        <li className="relative h-[33px] w-[105px] hover:bg-[#283047]">
                                                            <HoldButton
                                                                className="absolute left-0 top-0 h-[33px] w-[105px] px-[11px] text-left leading-[33px]  text-white"
                                                                card={card}
                                                                listing={listing}
                                                                identity={connectedIdentity}
                                                                hold={hold}
                                                                action={holdingAction}
                                                                refreshListing={refresh}
                                                            />
                                                        </li>
                                                    )}
                                                    {showBlindBoxButton && (
                                                        <li className="relative h-[33px] w-[105px] hover:bg-[#283047]">
                                                            <BlindBoxButton
                                                                className="absolute left-0 top-0 h-[33px] w-[105px] px-[11px] text-left  leading-[33px] text-white"
                                                                card={card}
                                                                listing={listing}
                                                                identity={connectedIdentity}
                                                                refreshList={
                                                                    refreshList ?? (() => {})
                                                                }
                                                            />
                                                        </li>
                                                    )}
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                            </div>
                        </div>
                    </div>
                </Link>
            </motion.div>
        </>
    );
}

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

export default NftCard;
