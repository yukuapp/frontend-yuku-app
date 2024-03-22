import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingOutlined } from '@ant-design/icons';
import { useBuyNftByTransaction } from '@/hooks/exchange/single/buy';
import { useHoldNft } from '@/hooks/exchange/single/hold';
import { useSellNftByTransaction } from '@/hooks/exchange/single/sell';
import { useTransferNftByTransaction } from '@/hooks/exchange/single/transfer';
import { useShoppingCart } from '@/hooks/nft/cart';
import { useShowBuyButton } from '@/hooks/nft/functions/buy';
import { useShowCartButton } from '@/hooks/nft/functions/cart';
import { useShowHoldButton } from '@/hooks/nft/functions/hold';
import { useShowChangePriceButton, useShowSellButton } from '@/hooks/nft/functions/sell';
import { useShowTransferButton } from '@/hooks/nft/functions/transfer';
import { cdn } from '@/common/cdn';
import { alreadyMessaged } from '@/common/data/promise';
import { isSameNftByTokenId } from '@/common/nft/identifier';
import { useIdentityStore } from '@/stores/identity';
import { useTransactionStore } from '@/stores/transaction';
import { NftListingData } from '@/types/listing';
import { NftMetadata } from '@/types/nft';
import { ShoppingCartItem } from '@/types/yuku';
import TokenPrice from '../data/price';
import Usd from '../data/usd';
import message from '../message';
import BuyModal from '../nft-card/components/buy';
import SellModal from '../nft-card/components/sell';
import TransferModal from '../nft-card/components/transfer';

export const NftDetailFunction = ({
    card,
    refreshCard,
    refreshListing,
}: {
    card: NftMetadata | undefined;
    refreshCard: () => void;
    refreshListing: () => void;
}) => {
    const identity = useIdentityStore((s) => s.connectedIdentity);
    const navigate = useNavigate();

    const self = !!identity && card?.owner.owner === identity.account;

    const [countdown, setCountdown] = useState<
        undefined | { hours: string; minutes: string; seconds: string }
    >(undefined);

    const showSellButton = useShowSellButton(card, card?.listing);
    const [sellNft, setSellNft] = useState<NftMetadata | undefined>(undefined);
    const { sell, executing } = useSellNftByTransaction();

    const onSell = () => {
        if (card) setSellNft(card);
    };
    const onCleanSellNft = () => setSellNft(undefined);

    const showHoldButton = useShowHoldButton(card, card?.listing);
    const { hold, action: holdingAction } = useHoldNft();

    const onHolding = async () => {
        if (card === undefined) return;
        if (holdingAction !== undefined) return;

        hold(identity!, card.owner)
            .then(alreadyMessaged)
            .then(() => {
                message.success('Cancel listing successful.');
                refreshListing();
            });
    };

    const showChangePriceButton = useShowChangePriceButton(card, card?.listing, holdingAction);

    const showTransferButton = useShowTransferButton(card, card?.listing);
    const { transfer, action: transferAction } = useTransferNftByTransaction();
    const [transferNft, setTransferNft] = useState<NftMetadata | undefined>(undefined);
    const onTransfer = () => setTransferNft(card);
    const onCleanTransferNft = () => setTransferNft(undefined);

    const showBuyButton = useShowBuyButton(card, card?.listing);
    const { buy, action: buyAction } = useBuyNftByTransaction();
    const [buyNft, setBuyNft] = useState<
        { card: NftMetadata; listing: NftListingData } | undefined
    >(undefined);
    const onBuy = () => {
        if (!identity) {
            navigate('/connect');
        }
        if (card === undefined || card.listing === undefined) return;
        setBuyNft({
            card,
            listing: card.listing,
        });
    };
    const onCleanBuyNft = () => setBuyNft(undefined);

    const showCartButton = useShowCartButton(card, card?.listing);
    const {
        add: addToShoppingCart,
        remove: removeFromShoppingCart,
        action: shoppingCartAction,
    } = useShoppingCart();
    const shoppingCartItems = useIdentityStore((s) => s.shoppingCartItems);
    const items: ShoppingCartItem[] = shoppingCartItems ?? [];
    const item = items.find((i) => card && isSameNftByTokenId(i, card.metadata));
    const cart = (() => {
        if (card === undefined) return false;
        if (card.listing?.listing.type !== 'listing') return false;
        if (shoppingCartItems) {
            if (shoppingCartItems.find((item) => isSameNftByTokenId(item, card.owner))) return true;
        }
        return false;
    })();

    const onCartChange = async () => {
        if (shoppingCartAction !== undefined) return;
        const added = !!item;
        if (added) removeFromShoppingCart(item.token_id);
        else addToShoppingCart(card!);
    };

    const { isRepurchase, end_date }: { isRepurchase?: boolean; end_date?: number } =
        useMemo(() => {
            if (card === undefined) return {};
            if (card.listing?.listing.type !== 'listing') return {};
            try {
                const item = JSON.parse(card.listing.raw);
                return { isRepurchase: item.isRepurchase, end_date: item.end_date / 1e6 };
            } catch (error) {
                return {};
            }
        }, [card]);

    useEffect(() => {
        let intervalId: any;
        if (isRepurchase && end_date) {
            const targetTime = end_date;
            intervalId = setInterval(() => {
                const now = Date.now();
                const diff = Math.max(targetTime - now, 0) / 1000;
                const hours = Math.floor(diff / 3600);
                const minutes = Math.floor((diff % 3600) / 60);
                const seconds = (diff % 60).toFixed(0);
                setCountdown({
                    hours: hours.toString().padStart(2, '0'),
                    minutes: minutes.toString().padStart(2, '0'),
                    seconds: seconds.toString().padStart(2, '0'),
                });
            }, 1000);
        }
        return () => clearInterval(intervalId);
    }, [isRepurchase, end_date]);

    const refreshSingleSellFlags = useTransactionStore((s) => s.refreshFlags['single-sell']);
    useEffect(() => {
        refreshSingleSellFlags && refreshListing();
    }, [refreshSingleSellFlags]);
    return (
        <div className="mb-[19px] mt-[21px] flex-shrink-0 rounded-[16px] border border-solid border-[#283047] px-[20px]  py-[21px] text-white md:mt-[37px]  md:w-[618px] md:px-[38px] md:py-[41px]">
            {self &&
                card &&
                card?.listing?.listing.type === 'listing' &&
                isRepurchase &&
                end_date && (
                    <div className=" mb-[20px]">
                        <div className=" font-inter-bold text-[14px] leading-[14px]  text-opacity-[0.6]">
                            Remaining Time
                        </div>
                        <div className="mt-[12px] flex items-center font-inter-regular text-[12px] text-white/60">
                            <div className=" text-center">
                                <div className=" flex h-[44px] w-[44px] items-center justify-center rounded-[8px] bg-[#f3f3f3] font-inter-semibold text-[16px] text-[#000]">
                                    {countdown?.hours}
                                </div>
                                <div>Hours</div>
                            </div>
                            <div className=" ml-[20px] text-center">
                                <div className="flex h-[44px] w-[44px] items-center justify-center rounded-[8px] bg-[#f3f3f3] font-inter-semibold text-[16px] text-[#000]">
                                    {countdown?.minutes}
                                </div>
                                <div>Mins</div>
                            </div>
                            <div className=" ml-[20px] text-center">
                                <div className="flex h-[44px] w-[44px] items-center justify-center rounded-[8px] bg-[#f3f3f3] font-inter-semibold text-[16px] text-[#000]">
                                    {countdown?.seconds}
                                </div>
                                <div>Secs</div>
                            </div>
                        </div>
                    </div>
                )}
            <div className="h-[67px] w-full rounded-[8px] bg-[#283047] px-[17px] md:h-[125px] md:rounded-[16px] md:px-[23px]">
                <div className="mb-[10px]  pt-[10px] font-inter-bold text-[12px] md:mb-[12px] md:pt-[31px] md:text-[14px]">
                    List Price
                </div>
                <div className="leading-[19px] md:leading-none">
                    <span className="font-inter-semibold text-[18px]  md:text-[24px] ">
                        <TokenPrice
                            value={{
                                value:
                                    card?.listing?.listing.type === 'listing'
                                        ? card?.listing?.listing.price
                                        : undefined,
                                token:
                                    card?.listing?.listing.type === 'listing'
                                        ? card?.listing?.listing.token
                                        : undefined,
                                symbol: '',
                                scale: 2,
                                paddingEnd: 2,
                            }}
                            className="text-[18px] md:text-[24px]"
                        />
                    </span>
                    <span className="ml-[3px] mr-[3px] font-inter-semibold text-[14px] text-white/60 md:mr-[5px] md:text-[18px]">
                        {card?.listing?.listing.type === 'listing'
                            ? card?.listing?.listing.token.symbol
                            : ''}
                    </span>
                    {card?.listing?.listing.type === 'listing' && (
                        <span className="font-inter-normal text-[12px] text-white/60 md:text-[16px]">
                            <Usd
                                value={{
                                    value:
                                        card?.listing?.listing.type === 'listing'
                                            ? card?.listing?.listing.price
                                            : undefined,
                                    token:
                                        card?.listing?.listing.type === 'listing'
                                            ? card?.listing?.listing.token
                                            : undefined,
                                    scale: 2,
                                }}
                                className="text-[12px] text-white/60 md:text-[16px]"
                            />
                        </span>
                    )}
                </div>
            </div>
            {self && card && (
                <>
                    {
                        <>
                            {card.listing?.listing.type === 'listing' && !isRepurchase && (
                                <>
                                    <div className="mt-[25px] flex justify-between gap-x-[15px] md:mt-[47px]">
                                        {showChangePriceButton && (
                                            <div
                                                className="h-[40px] w-[242px] cursor-pointer rounded-[8px] bg-shiku text-center font-inter-bold text-[16px] leading-[40px] text-white hover:text-[#fff9] md:h-[61px] md:w-[255px] md:leading-[61px]"
                                                onClick={onSell}
                                            >
                                                Change price
                                            </div>
                                        )}
                                        {showHoldButton && (
                                            <div
                                                className="h-[40px] w-[242px] cursor-pointer rounded-[8px] bg-shiku text-center font-inter-bold text-[16px] leading-[40px] text-white hover:text-[#fff9] md:h-[61px] md:w-[255px] md:leading-[61px]"
                                                onClick={onHolding}
                                            >
                                                Cancel
                                                {holdingAction && (
                                                    <LoadingOutlined className="!ml-[10px]" />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {sellNft && (
                                        <SellModal
                                            identity={identity}
                                            card={sellNft}
                                            lastPrice={card.listing.listing.price}
                                            sell={sell}
                                            executing={executing}
                                            refreshListing={refreshListing}
                                            onClose={onCleanSellNft}
                                        />
                                    )}
                                </>
                            )}
                            {card.listing?.listing.type === 'listing' && isRepurchase && (
                                <div
                                    onClick={onHolding}
                                    className=" mt-[15px] flex h-[40px] cursor-pointer items-center justify-center rounded-[8px] bg-[#0A0909] font-inter-bold text-[14px] text-[#fff] md:mt-[60px] md:h-[60px] md:text-[16px]"
                                >
                                    Cancel Repurchase
                                    {holdingAction && <LoadingOutlined className="!ml-[10px]" />}
                                </div>
                            )}
                        </>
                    }

                    {card.listing?.listing.type === 'holding' && (
                        <>
                            <div className="mt-[25px] flex justify-start gap-x-[30px] md:mt-[47px]">
                                {showSellButton && (
                                    <div
                                        className="h-[40px] w-[50%] cursor-pointer rounded-[8px] bg-shiku text-center font-inter-bold text-[16px] leading-[40px] text-white hover:text-[#fff9]  md:h-[61px] md:leading-[61px]"
                                        onClick={onSell}
                                    >
                                        Sell
                                    </div>
                                )}
                                {showTransferButton && (
                                    <div
                                        className="h-[40px] w-[50%] cursor-pointer rounded-[8px] bg-shiku text-center font-inter-bold text-[16px] leading-[40px] text-white hover:text-[#fff9] md:h-[61px] md:leading-[61px]"
                                        onClick={onTransfer}
                                    >
                                        Transfer
                                    </div>
                                )}
                            </div>
                            {sellNft && (
                                <SellModal
                                    identity={identity}
                                    card={sellNft}
                                    lastPrice={undefined}
                                    sell={sell}
                                    executing={executing}
                                    refreshListing={refreshListing}
                                    onClose={onCleanSellNft}
                                />
                            )}
                            {transferNft && (
                                <TransferModal
                                    identity={identity}
                                    card={transferNft}
                                    transfer={transfer}
                                    action={transferAction}
                                    refreshList={refreshCard}
                                    onClose={onCleanTransferNft}
                                />
                            )}
                        </>
                    )}
                </>
            )}
            {!self && (
                <>
                    {card?.listing?.listing.type === 'listing' && (
                        <>
                            <div className="mt-[25px] flex justify-between md:mt-[47px]">
                                {showBuyButton && (
                                    <div
                                        className="h-[40px] w-[242px] cursor-pointer rounded-[8px] bg-shiku text-center font-inter-bold text-[16px] leading-[40px] text-white opacity-100  hover:opacity-80 md:h-[61px] md:w-[450px] md:leading-[61px]"
                                        onClick={onBuy}
                                    >
                                        Buy now
                                    </div>
                                )}

                                {showCartButton && (
                                    <div className=" flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-[8px] bg-shiku  opacity-80 hover:opacity-100 md:h-[61px] md:w-[61px]">
                                        <img
                                            className="block h-[20px] w-[20px] rounded-[8px] opacity-100  hover:opacity-100 md:h-[38px] md:w-[38px]"
                                            src={cdn(cart ? '' : '')}
                                            alt=""
                                            onClick={onCartChange}
                                        />
                                    </div>
                                )}
                            </div>
                            {buyNft && (
                                <BuyModal
                                    card={buyNft.card}
                                    listing={buyNft.listing}
                                    buy={buy}
                                    action={buyAction}
                                    refreshListing={refreshListing}
                                    onClose={onCleanBuyNft}
                                />
                            )}
                        </>
                    )}
                    {card?.listing?.listing.type === 'holding' && (
                        <>
                            <div className="mt-[25px] flex justify-between md:mt-[47px]">
                                <div className="h-[40px] w-[242px] cursor-not-allowed rounded-[8px] bg-[#999999] text-center font-inter-bold text-[16px] leading-[40px] text-white opacity-80  hover:opacity-100 md:h-[61px] md:w-[450px] md:leading-[61px]">
                                    Buy now
                                </div>

                                <div className=" flex h-[40px] w-[40px] cursor-not-allowed items-center justify-center rounded-[8px] bg-[#999999]  opacity-80 hover:opacity-100 md:h-[61px] md:w-[61px]">
                                    <img
                                        className="block h-[20px] w-[20px] rounded-[8px] opacity-100  hover:opacity-100 md:h-[38px] md:w-[38px]"
                                        src={cdn(cart ? '' : '')}
                                        alt=""
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
};
