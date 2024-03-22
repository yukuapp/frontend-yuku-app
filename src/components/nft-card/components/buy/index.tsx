import { memo, useEffect, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { isMobile } from 'react-device-detect';
import { Link } from 'react-router-dom';
import { Modal } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Swiper as SwiperType } from 'swiper/types';
import { shallow } from 'zustand/shallow';
import {
    get_usd_with_fee,
    getUsdAmount,
    ramp,
} from '@/components/layout/components/user-sidebar/funds';
import message from '@/components/message';
import { useYukuPlatformFee } from '@/hooks/interval/platform_fee';
import {
    getLedgerIcpDecimals,
    getLedgerIcpFee,
    getLedgerOgyFee,
    getTokenDecimals,
} from '@/utils/canisters/ledgers/special';
import { getServiceFee } from '@/utils/nft/fee';
import {
    getCollectionNameByNftMetadata,
    getNameByNftMetadata,
    getThumbnailByNftMetadata,
} from '@/utils/nft/metadata';
import { cdn } from '@/common/cdn';
import { cn } from '@/common/cn';
import { exponentNumber } from '@/common/data/numbers';
import { alreadyMessaged } from '@/common/data/promise';
import { shrinkText } from '@/common/data/text';
import { uniqueKey } from '@/common/nft/identifier';
import { getYukuOgyBroker } from '@/common/nft/ogy';
import { justPreventLink } from '@/common/react/link';
import { bigint2string, string2bigint } from '@/common/types/bigint';
import { unwrapVariantKey } from '@/common/types/variant';
import { useAppStore } from '@/stores/app';
import { useIdentityStore } from '@/stores/identity';
import { TransactionRecord } from '@/stores/transaction';
import { SupportedLedgerTokenSymbol } from '@/types/canisters/ledgers';
import {
    BuyingAction,
    BuyNftExecutor,
    BuyNftRaw,
    SingleBuyTransaction,
} from '@/types/exchange/single-buy';
import { NftListingData } from '@/types/listing';
import { NftMetadata } from '@/types/nft';
import TokenPrice from '../../../data/price';
import Usd from '../../../data/usd';
import { IconLogoLedgerIcp } from '../../../icons';
import NftMedia from '../../../nft/media';
import NftName from '../../../nft/name';
import NftThumbnail from '../../../nft/thumbnail';
import { Button } from '../../../ui/button';
import CloseIcon from '../../../ui/close-icon';
import Tooltip from '../../../ui/tooltip';
import BalanceInsufficient from '../../../user/balance/balance-insufficient';
import BalanceRefresh from '../../../user/balance/balance-refresh';
import './index.less';

const { ALCHEMY_WEBHOOK_BUY } = import.meta.env;

export const MIN_FIAT_AMOUNT = 15;
export const MAX_FIAT_AMOUNT = 2000;

export const BoughtModal = ({
    record,
    transaction,
    onClose,
}: {
    record: TransactionRecord;
    transaction: SingleBuyTransaction;
    onClose: () => void;
}) => {
    const onModalClose = () => {
        onClose();
    };
    return (
        <Modal
            open={
                record.status === 'successful' &&
                record.transaction.type === 'single-buy' &&
                record.transaction.args.raw.standard !== 'entrepot'
            }
            footer={null}
            closeIcon={null}
            centered={true}
            width={600}
            className="bought-modal"
        >
            <div className="">
                <div className="mb-[20px] flex items-center justify-between">
                    <span className=" font-inter-bold text-[20px]">Purchase successful!</span>
                    <CloseIcon className="w-[14px]" onClick={onModalClose} />
                </div>

                <div
                    key={uniqueKey(transaction.args.token_id)}
                    className=" mt-[20px] flex h-full w-full cursor-pointer flex-col items-center justify-between"
                >
                    <NftThumbnail
                        token_id={transaction.args.token_id}
                        cdn_width={800}
                        width="w-[200px]"
                    />

                    <div className="mt-[9px] truncate font-inter-bold text-[16px] leading-[20px]">
                        <NftName token_id={transaction.args.token_id} />
                    </div>
                </div>
                <div className="mx-auto mt-[10px] flex w-fit items-center">
                    <IconLogoLedgerIcp className="h-fit w-[14px]" />
                    <TokenPrice
                        className="ml-[10px] mr-[5px] font-inter-semibold text-[16px] md:text-[16px]"
                        value={{
                            value: transaction.args.price,
                            decimals: { type: 'exponent', value: getTokenDecimals('ICP') },
                            symbol: '',
                            scale: 2,
                            paddingEnd: 2,
                        }}
                    />
                    <span className="font-inter-semibold text-[16px]">ICP</span>
                </div>
                <p className="mt-[10px] w-full text-center  text-[12px] text-white/70">
                    Check your NFT in the profile page
                </p>

                <div className="mt-[15px] flex justify-center">
                    <Link to={'/profile'}>
                        <Button
                            onClick={onModalClose}
                            className="!hover:text-white h-[48px] w-[160px] cursor-pointer rounded-[8px]  bg-shiku text-center font-inter-bold text-[16px] leading-[48px]  text-white hover:bg-shiku/60 hover:text-white"
                        >
                            View
                        </Button>
                    </Link>
                </div>
            </div>
        </Modal>
    );
};
export const AddFundsModal = ({
    open,
    show_or,
    onClose,
    args,
}: {
    open: boolean;
    show_or: boolean;
    onClose: () => void;
    args: { principal?: string; symbol: SupportedLedgerTokenSymbol; need_amount: string };
}) => {
    const { principal, symbol } = args;
    const [copied, setCopied] = useState(false);
    const { addFundsOpen, toggleAddFundsOpen, setAddFundArgs } = useIdentityStore(
        (s) => ({
            addFundsOpen: s.addFundsOpen,
            toggleAddFundsOpen: s.toggleAddFundsOpen,
            setAddFundArgs: s.setAddFundArgs,
        }),
        shallow,
    );
    const needed = exponentNumber(args.need_amount, -getTokenDecimals());
    const showNeeded = Number(needed) < 0 ? '0' : Number(needed).toFixed(4);

    return (
        <Modal
            open={open && !addFundsOpen}
            footer={null}
            closeIcon={null}
            onCancel={onClose}
            width={550}
            className="buy-modal"
            centered={true}
        >
            <div className="flex w-full  flex-col items-center justify-between p-[20px] text-white md:p-[30px]">
                <div className="mb-[30px] flex w-full items-center justify-between">
                    <div className="font-inter-bold text-[20px] leading-none ">Add Funds</div>
                    <CloseIcon className="w-[14px]" onClick={onClose} />
                </div>
                <div className="flex w-full flex-wrap items-center justify-between gap-y-[10px] font-inter-medium text-[12px] text-white/60 md:text-[14px]">
                    <div>Send {symbol} to this address</div>
                    <BalanceRefresh symbol={symbol} />
                </div>
                <div className="mt-[20px]  w-full  rounded bg-[#1A2236] px-6 py-5">
                    <CopyToClipboard text={principal} onCopy={() => setCopied(true)}>
                        <Tooltip
                            title={copied ? 'Copied' : 'Copy'}
                            placement="top"
                            overlayInnerStyle={{ width: '80px', textAlign: 'center' }}
                            className="pl-[3px]  text-left font-inter-semibold"
                        >
                            <span
                                className="cursor-pointer font-inter-semibold "
                                onMouseLeave={() => setCopied(false)}
                            >
                                {principal}
                            </span>
                        </Tooltip>
                    </CopyToClipboard>
                </div>
                <div className={cn('hidden w-full', symbol === 'ICP' && show_or && 'block')}>
                    <div className="mt-[20px] flex w-full items-center justify-between md:mt-[40px]">
                        <div className="h-px w-[45%] bg-[#eeeeee]" />
                        <span className="font-inter-semibold text-[18px] tracking-wide md:text-[24px]">
                            OR
                        </span>
                        <div className="h-px w-[45%] bg-[#eeeeee]" />
                    </div>
                    {Number(showNeeded) > 0 && (
                        <div className="mt-[40px] font-inter-semibold text-[14px] text-shiku">
                            Require add {showNeeded} ICP
                        </div>
                    )}
                    <Button
                        className="relative mt-[10px] flex w-full justify-start border-none bg-[#283047] py-[13px] text-left font-inter-semibold text-[14px] md:justify-center md:text-center md:text-[16px]"
                        variant={'outline'}
                        onClick={() => {
                            toggleAddFundsOpen();
                            setAddFundArgs({
                                type: 'BUY',
                                amount: exponentNumber(args.need_amount, -getTokenDecimals()),
                                symbol: 'ICP',
                            });
                        }}
                    >
                        <div>Buy ICP with card</div>
                        <div className="absolute right-[12.5px] flex justify-center gap-x-[10px]">
                            <img src="/img/sidebar/pay-mastercard.svg" alt="" />
                            <img src="/img/sidebar/pay-visa.svg" alt="" />
                            <img src="/img/sidebar/pay-apple.svg" alt="" />
                            <img src="/img/sidebar/pay-google.svg" alt="" />
                        </div>
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

const BuyWithFiatIframe = memo(
    ({
        iframeKey,
        usdAmount,
        iframeLoading,
        setIframeLoading,
    }: {
        iframeKey: number;
        usdAmount?: number;
        iframeLoading: boolean;
        setIframeLoading: (b: boolean) => void;
    }) => {
        return (
            <div className="m-auto mt-[20px] h-[516px] w-[371px]">
                {usdAmount && (
                    <iframe
                        key={iframeKey}
                        src={
                            ramp.handleUrl() +
                            `&callbackUrl=${encodeURIComponent(ALCHEMY_WEBHOOK_BUY)}` +
                            `&payWayCode=1001` +
                            (Number(usdAmount) >= 16 ? `&fiatAmount=${usdAmount}` : '')
                        }
                        className={cn(
                            'invisible m-auto h-[516px] w-[371px] rounded-[16px] border border-common',
                            !iframeLoading && 'visible z-10',
                            isMobile && 'h-[400px] w-[280px]',
                        )}
                        onLoad={() => setIframeLoading(false)}
                    ></iframe>
                )}
            </div>
        );
    },
);

export const BuyWithFiatModal = ({
    onClose,
    needed,
    onBuy,
    confirmLoading,
}: {
    needed: bigint;
    onClose: () => void;
    onBuy: () => void;
    confirmLoading: boolean;
}) => {
    const [swiper, setSwiper] = useState<SwiperType | null>(null);

    const [currentPage, setCurrentPage] = useState<number>(0);

    const onSlideChange = (e: any) => setCurrentPage(e.realIndex);
    const [iframeLoading, setIframeLoading] = useState<boolean>(true);
    const [iframeKey, setIframeKey] = useState<number>(0);

    useEffect(() => {
        setIframeLoading(true);
        setIframeKey((p) => p + 1);
    }, [currentPage]);
    const { e8sIcp } = useIdentityStore(
        (s) => ({
            e8sIcp: s.icpBalance?.e8s,
        }),
        shallow,
    );

    const [usdAmount, setUsdAmount] = useState<number>();
    const needed_amount = exponentNumber(bigint2string(needed), -getLedgerIcpDecimals());

    useEffect(() => {
        getUsdAmount(Number(needed_amount)).then(setUsdAmount);
    }, [needed]);

    const onModalClose = () => {
        setUsdAmount(undefined);
        onClose();
    };
    return (
        <Modal
            open={true}
            footer={null}
            closeIcon={null}
            onCancel={onModalClose}
            width={isMobile ? 365 : 550}
            className="buy-with-fiat-modal"
            centered={true}
        >
            <div className="flex justify-between text-white">
                <div className={cn('font-inter-bold text-[24px] ', isMobile && 'text-[20px]')}>
                    {currentPage === 0 ? 'Warning' : 'Buy ICP'}
                </div>
                <CloseIcon onClick={onClose} />
            </div>
            <Swiper
                className="buy-with-fiat-swiper cursor-pointer"
                direction="horizontal"
                loop={false}
                onSwiper={(swiper) => setSwiper(swiper)}
                onSlideChange={onSlideChange}
            >
                <SwiperSlide className="w-full">
                    <img
                        src="/img/recorder/failed.svg"
                        className={cn(
                            'mx-auto mb-[37px] mt-[50px] w-[58px]',
                            isMobile && 'mt-[27px]',
                        )}
                        alt=""
                    />
                    <div
                        className={cn(
                            'flex h-[369px] flex-col justify-between rounded-2xl border border-common px-[40px] py-[58px] text-white/60',
                            isMobile && 'px-[20px] py-[48px] text-sm',
                        )}
                    >
                        <div className="flex items-center justify-between gap-x-[9px] ">
                            <div className="h-2 w-2 rounded-full bg-orange-500" />
                            <div className="w-[395px] font-inter-medium leading-normal text-[#666666]">
                                The fiat currency you pay will be converted into ICP to complete the
                                NFT purchase.
                            </div>
                        </div>
                        <div className="flex items-center justify-between gap-x-[9px]">
                            <div className="h-2 w-2 rounded-full bg-orange-500" />
                            <div className="w-[395px] font-inter-medium leading-normal text-[#666666]">
                                If the transaction fails,your ICP will be in your main account
                                wallet.
                            </div>
                        </div>
                        <div className="flex items-center justify-between gap-x-[9px]">
                            <div className="h-2 w-2 rounded-full bg-orange-500" />
                            <div className="w-[395px] font-inter-medium leading-normal text-[#666666]">
                                Due to fluctuations in the exchange rate, the actual purchase
                                quantity of ICP may vary.
                            </div>
                        </div>
                    </div>
                </SwiperSlide>
                <SwiperSlide className="relative flex w-full">
                    <div
                        className={cn(
                            'absolute bottom-0 left-0 right-0 top-0 hidden  h-full w-full bg-white',
                            (iframeLoading || !usdAmount) && 'flex',
                        )}
                    >
                        {
                            <LoadingOutlined
                                className="!mx-auto text-[50px]"
                                style={{ color: '#7953ff' }}
                            />
                        }
                    </div>
                    {
                        <BuyWithFiatIframe
                            iframeKey={iframeKey}
                            usdAmount={usdAmount}
                            iframeLoading={iframeLoading}
                            setIframeLoading={setIframeLoading}
                        ></BuyWithFiatIframe>
                    }
                    <div
                        className={cn(
                            'mx-auto mt-[10px] flex  w-[371px] font-inter-medium text-sm leading-tight text-white/60',
                            isMobile && 'w-[280px]',
                            needed <= string2bigint(e8sIcp || '0') && 'hidden',
                        )}
                    >
                        Waiting to buy at least&nbsp;
                        <div className="font-inter-bold text-white">{needed_amount}</div>
                        &nbsp;ICP{' '}
                        {!iframeLoading && (
                            <LoadingOutlined className="z-[1] ml-[5px] text-[12px] text-shiku"></LoadingOutlined>
                        )}
                    </div>
                </SwiperSlide>
            </Swiper>

            <div className="relative mt-[10px]  flex h-2.5 w-full justify-center gap-x-[50px]">
                <div
                    className={cn(
                        'h-2.5 w-2.5 cursor-pointer rounded-full border border-[#929292] ',
                        currentPage === 0 && 'bg-shiku',
                    )}
                    onClick={() => {
                        swiper?.slideTo(0);
                    }}
                />
                <div
                    className={cn(
                        'h-2.5 w-2.5 cursor-pointer rounded-full border border-[#929292] ',
                        currentPage === 1 && 'bg-shiku',
                    )}
                    onClick={() => {
                        swiper?.slideTo(1);
                    }}
                />
            </div>
            {currentPage === 0 ? (
                <div className="flex w-full pt-[10px]">
                    <Button
                        className="ml-auto mt-[40px] h-[36px] bg-shiku font-inter-bold text-[14px] text-white hover:bg-shiku/60 hover:text-white"
                        onClick={() => {
                            swiper?.slideTo(1);
                        }}
                    >
                        Continue
                    </Button>
                </div>
            ) : (
                <div className="relative mt-[20px] flex pt-[30px] ">
                    <div
                        className={cn(
                            'absolute -left-[30px] -right-[30px] top-0 border border-[#283047]',
                            isMobile && '-left-[16px] -right-[16px]',
                        )}
                    ></div>
                    <BalanceRefresh symbol="ICP"></BalanceRefresh>
                    <Button
                        onClick={onBuy}
                        disabled={!e8sIcp || string2bigint(e8sIcp) < needed}
                        className="ml-auto h-[36px] bg-shiku font-inter-bold text-[14px]  text-white hover:bg-shiku/60 hover:text-white"
                    >
                        Buy Now
                        {confirmLoading && <LoadingOutlined className="ml-2" />}
                    </Button>
                </div>
            )}
        </Modal>
    );
};

export function getBuyNftRaw(card: NftMetadata, listing?: NftListingData): BuyNftRaw {
    if (listing?.listing.type !== 'listing') throw new Error('buy failed');
    if (card.owner.raw.standard === 'ogy') {
        const account = card.owner.raw.data.account;
        const key = unwrapVariantKey(account);
        if (key !== 'principal') {
            throw new Error(`the owner of nft must be principal`);
        }
        const principal = account[key] as string;
        if (listing?.listing.raw.type !== 'ogy') {
            throw new Error(`wrong listing data`);
        }
        return {
            standard: 'ogy',
            sale_id: listing?.listing.raw.sale_id,
            broker_id: getYukuOgyBroker(),
            seller: principal,
        };
    }
    if (
        card.listing?.listing.type === 'listing' &&
        card.listing.listing.raw.type === 'entrepot' &&
        card.data?.info.collection
    ) {
        return {
            standard: 'entrepot',
            token_id: {
                collection: card.data?.info.collection,
                token_identifier: card.listing.listing.raw.token_identifier,
            },
            price: card.listing.listing.price,
        };
    }
    return { standard: card.owner.raw.standard } as BuyNftRaw;
}

function BuyModal({
    card,
    listing,
    buy,
    action,
    onClose,
}: {
    card: NftMetadata;
    listing: NftListingData;
    buy: BuyNftExecutor;
    action: BuyingAction;
    refreshListing?: () => void;
    onClose: () => void;
}) {
    const [open, setOpen] = useState(true);

    const removeShoppingCartItem = useIdentityStore((s) => s.removeShoppingCartItem);
    const { e8sIcp, e8sOgy, identity } = useIdentityStore(
        (s) => ({
            e8sIcp: s.icpBalance?.e8s,
            e8sOgy: s.ogyBalance?.e8s,
            identity: s.connectedIdentity,
        }),
        shallow,
    );
    const { price, token } = (() => {
        if (listing.listing.type !== 'listing') return { price: undefined, token: undefined };
        return { price: listing.listing.price, token: listing.listing.token };
    })();

    const needed =
        token?.symbol.toLocaleUpperCase() === 'OGY'
            ? string2bigint(getLedgerOgyFee()) + string2bigint(price || '0')
            : string2bigint(getLedgerIcpFee()) + string2bigint(price || '0');
    const e8s = (token?.symbol.toLocaleUpperCase() === 'OGY' ? e8sOgy : e8sIcp) ?? '0';

    const icp_usd = useAppStore((s) => s.icp_usd);

    const lack =
        needed - string2bigint(e8s) > string2bigint('0')
            ? needed - string2bigint(e8s)
            : string2bigint('0');

    const lack_with_alchemy_fee = get_usd_with_fee(
        Number(exponentNumber(bigint2string(lack), -getLedgerIcpDecimals())) * Number(icp_usd),
    );
    const price_needed_with_alchemy_fee = get_usd_with_fee(
        Number(exponentNumber(bigint2string(needed), -getLedgerIcpDecimals())) * Number(icp_usd),
    );

    const larger_than_min =
        token?.symbol.toLocaleUpperCase() === 'ICP' &&
        (lack_with_alchemy_fee > MIN_FIAT_AMOUNT || lack_with_alchemy_fee === 0);

    const price_larger_than_min =
        token?.symbol.toLocaleUpperCase() === 'ICP' &&
        price_needed_with_alchemy_fee > MIN_FIAT_AMOUNT;

    const price_less_than_max =
        token?.symbol.toLocaleUpperCase() === 'ICP' &&
        price_needed_with_alchemy_fee < MAX_FIAT_AMOUNT;

    const YukuPlatformFee = useYukuPlatformFee();

    const [addFundsOpen, setAddFundsOpen] = useState(false);
    const [buyWithFiatOpen, setBuyWithFiatOpen] = useState(false);

    const onConfirm = async () => {
        if (price === undefined || token === undefined) return;
        if (listing.listing.type !== 'listing') return;

        new Promise<NftListingData>((resolve) => {
            if (card.owner.raw.standard !== 'ogy') return resolve(listing);
            if (listing.listing.type !== 'listing') return resolve(listing);
            if (listing.listing.raw.type !== 'ogy') return resolve(listing);
            if (listing.listing.raw.sale_id) return resolve(listing);
        })
            .then((listing) => {
                setOpen(false);

                if (listing.listing.type !== 'listing') throw new Error('buy failed');
                buy(
                    card.owner.token_id,
                    card.owner.owner,
                    token,
                    price,
                    getBuyNftRaw(card, listing),
                )
                    .then((d) => {
                        // message.destroy();
                        return alreadyMessaged(d);
                    })
                    .then(() => {
                        removeShoppingCartItem(card.metadata.token_id);
                    })
                    .catch((e) => {
                        if (`${e}`.indexOf('already recorded transaction') >= 0) {
                            onModalClose();
                        }
                    });
            })
            .catch((e) => {
                console.error(`🚀 ~ file: index.tsx:330 ~ onConfirm ~ e:`, e);
                message.error('buy failed. please try again');
            });
    };

    const onModalClose = () => {
        setOpen(false);
        onClose();
    };

    const confirmLoading = !!action;

    const confirmDisabled = string2bigint(e8s) < needed;

    const isIcp = token?.symbol.toLocaleUpperCase() === 'ICP';

    const onBuyWithFiat = async () => {
        setBuyWithFiatOpen(true);
    };
    return (
        <div onClick={justPreventLink}>
            <AddFundsModal
                open={addFundsOpen}
                show_or={larger_than_min}
                onClose={() => {
                    setAddFundsOpen(false);
                }}
                args={{
                    principal: identity?.principal,
                    symbol: token?.symbol.toLocaleUpperCase() as SupportedLedgerTokenSymbol,
                    need_amount: bigint2string(lack),
                }}
            />
            {buyWithFiatOpen && (
                <BuyWithFiatModal
                    onClose={() => {
                        setBuyWithFiatOpen(false);
                    }}
                    onBuy={onConfirm}
                    needed={needed}
                    confirmLoading={confirmLoading}
                />
            )}
            <Modal
                open={open}
                footer={null}
                closeIcon={null}
                onCancel={onModalClose}
                width={550}
                className="buy-modal"
                centered={true}
            >
                <div className="mb-[30px] flex w-full items-center justify-between p-[20px] pb-0 md:p-[30px] md:pb-0">
                    <div className="font-inter-bold text-[20px] leading-none">
                        <div className="hidden">{action}</div>
                        Purchase
                    </div>
                    <CloseIcon className="w-[14px] text-white" onClick={onModalClose} />
                </div>

                <div className="hidden w-full flex-col gap-x-[24px] md:flex">
                    <div className="px-[30px]">
                        <div className="flex justify-between">
                            <div className="flex flex-1 flex-col justify-between">
                                <div className="mb-[10px] font-inter-medium text-[14px] text-white/70">
                                    {getCollectionNameByNftMetadata(card)}
                                </div>
                                <div className="mb-auto font-inter-bold  text-[18px] leading-none">
                                    {getNameByNftMetadata(card)}
                                </div>

                                <div className="flex items-center leading-none">
                                    <IconLogoLedgerIcp className="mr-[7px] w-[18px]" />
                                    <TokenPrice
                                        className="mr-[5px] font-inter-semibold text-[20px] text-white md:text-[20px]"
                                        value={{
                                            value: price!,
                                            token: token!,
                                            symbol: '',
                                            scale: 2,
                                            paddingEnd: 2,
                                        }}
                                    />
                                    <Usd
                                        className="font-inter-medium text-white/70"
                                        value={{
                                            value: price!,
                                            token: token!,
                                            scale: 2,
                                        }}
                                    />
                                </div>
                            </div>
                            <NftThumbnail
                                token_id={card.metadata.token_id}
                                imgClass="rounded-[8px]"
                                width="w-[90px]"
                            />
                        </div>

                        <div className="mt-[40px]">
                            <span className=" font-inter-medium leading-none text-white/70">
                                commission
                            </span>
                            <div className="mt-[10px] flex flex-col gap-y-[11px] rounded-[8px] border border-[#283047] bg-[#1A2236]  px-[10px] py-[16px] font-inter-medium text-[14px] text-white">
                                <div className="flex w-full items-center justify-between  ">
                                    <span className="font mr-[8px] leading-[16px] ">
                                        Service Fee
                                    </span>
                                    <span className="">
                                        {getServiceFee(card, YukuPlatformFee) ?? '--'}%
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="mr-[8px] text-white">Creator Royalty</span>
                                    <span className="">{card.data?.info.royalties ?? '--'}%</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-[30px] flex justify-between">
                            <span className=" font-inter-semibold text-[20px]">Total</span>
                            <div className="flex items-center leading-none">
                                {<IconLogoLedgerIcp className="mr-[7px] w-[18px]" />}
                                <TokenPrice
                                    className="mr-[5px] font-inter-semibold text-[20px] md:text-[20px]"
                                    value={{
                                        value: price!,
                                        token: token!,
                                        symbol: '',
                                        scale: 2,
                                        paddingEnd: 2,
                                    }}
                                />
                                <Usd
                                    className="text-[14px] text-white/60"
                                    value={{
                                        value: price!,
                                        token: token!,
                                        scale: 2,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="mt-[15px] flex cursor-pointer justify-between border-t border-common p-[30px]">
                        <div className="my-auto flex h-full flex-col justify-between gap-y-[5px]">
                            <div className="font-inter-semibold text-[14px]">
                                <span
                                    onClick={() => setAddFundsOpen(true)}
                                    className={cn('text-shiku hover:opacity-80')}
                                >
                                    Add Funds
                                </span>

                                {isIcp && price_larger_than_min && price_less_than_max && (
                                    <>
                                        &nbsp;/&nbsp;
                                        <span onClick={onBuyWithFiat} className="hover:opacity-60">
                                            Pay with fiat
                                        </span>
                                    </>
                                )}
                            </div>

                            <BalanceRefresh
                                symbol={
                                    token
                                        ? (token?.symbol.toLocaleUpperCase() as SupportedLedgerTokenSymbol)
                                        : 'ICP'
                                }
                            />
                        </div>
                        <div className="flex items-center gap-x-[27px]">
                            {' '}
                            <Button
                                onClick={onModalClose}
                                variant={'outline'}
                                className="h-[36px] w-[86px] flex-shrink-0 rounded-[8px] border border-solid border-black/60 bg-[#283047]  text-center font-inter-bold text-[16px] leading-[36px]  text-white hover:bg-[#283047]/60  hover:text-white"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={onConfirm}
                                disabled={string2bigint(e8s) < needed}
                                className={cn(
                                    'h-[36px] flex-shrink-0 rounded-[8px]  bg-shiku text-center font-inter-bold text-[16px] leading-[36px] text-white  hover:bg-shiku/60 hover:text-white',
                                    confirmDisabled && '!cursor-not-allowed',
                                )}
                            >
                                Confirm {confirmLoading && <LoadingOutlined className="ml-2" />}
                            </Button>
                        </div>
                    </div>
                    <BalanceInsufficient
                        balance={e8s}
                        need={bigint2string(needed)}
                        setAddFundsOpen={setAddFundsOpen}
                    />
                </div>

                <div className="flex">
                    <div className="flex  w-full shrink-0 flex-col  gap-1 rounded-lg md:hidden">
                        <div className="mb-3 ml-5 mr-6 flex flex-row items-start gap-16">
                            <div className="flex w-1/2 flex-col gap-5">
                                <div className="flex flex-col items-start gap-px">
                                    <div className="mb-[10px] font-inter-medium text-[14px] text-white/70">
                                        {shrinkText(getCollectionNameByNftMetadata(card))}
                                    </div>
                                    <div className="mb-auto font-inter-bold  text-[18px] leading-none">
                                        {getNameByNftMetadata(card)}
                                    </div>
                                </div>
                                <div className="flex items-center leading-none">
                                    {<IconLogoLedgerIcp className="mr-[7px] w-[18px]" />}
                                    <TokenPrice
                                        className="mr-[5px] font-inter-semibold text-[20px] md:text-[20px]"
                                        value={{
                                            value: price!,
                                            token: token!,
                                            symbol: '',
                                            scale: 2,
                                            paddingEnd: 2,
                                        }}
                                    />
                                    <Usd
                                        className="font-inter-medium text-white/60"
                                        value={{
                                            value: price!,
                                            token: token!,
                                            scale: 2,
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="w-[90px]">
                                <NftMedia
                                    className="block rounded-[8px]"
                                    src={cdn(getThumbnailByNftMetadata(card))}
                                    metadata={card.metadata}
                                />
                            </div>
                        </div>
                        <div className="ml-4 self-start font-inter text-sm font-medium leading-[20px] text-white/70">
                            commission
                        </div>
                        <div className="mb-6 ml-4 mr-6 flex h-20 shrink-0 flex-row items-center justify-between rounded-lg border border-solid border-[#283047] bg-[#1A2236] px-2">
                            <div className="flex w-20 shrink-0 flex-col items-start gap-3">
                                <div className="font-inter text-sm font-medium leading-[20px]">
                                    royalty
                                </div>
                                <div className="font-inter text-sm font-medium leading-[20px]">
                                    service fee
                                </div>
                            </div>
                            <div className="flex w-5 shrink-0 flex-col items-start gap-3">
                                <div className="font-inter text-sm font-medium leading-[20px]">
                                    <span className="">
                                        {getServiceFee(card, YukuPlatformFee) ?? '--'}%
                                    </span>
                                </div>
                                <div className="font-inter text-sm font-medium leading-[20px]">
                                    {card.data?.info.royalties ?? '--'}%
                                </div>
                            </div>
                        </div>
                        <div className="mb-5 ml-4 mr-5 flex flex-row items-start justify-between">
                            <div className="mb-1 font-inter text-lg font-semibold leading-[20px]">
                                Total
                            </div>
                            <div className="flex items-center leading-none">
                                {<IconLogoLedgerIcp className="mr-[7px] w-[18px]" />}
                                <TokenPrice
                                    className="mr-[5px] font-inter-semibold text-[20px] md:text-[20px]"
                                    value={{
                                        value: price!,
                                        token: token!,
                                        symbol: '',
                                        scale: 2,
                                        paddingEnd: 2,
                                    }}
                                />
                                <Usd
                                    className="font-inter-medium text-white/70"
                                    value={{
                                        value: price!,
                                        token: token!,
                                        scale: 2,
                                    }}
                                />
                            </div>
                        </div>
                        <div className="mt-[15px] flex cursor-pointer justify-between border-t border-common p-[20px] pb-[10px]">
                            <div className="my-auto flex h-full w-full flex-col justify-between gap-y-[5px]">
                                <div className="font-inter-semibold text-[14px]">
                                    <span
                                        onClick={() => setAddFundsOpen(true)}
                                        className={cn('text-shiku hover:opacity-80')}
                                    >
                                        Add Funds
                                    </span>
                                    {isIcp && price_larger_than_min && price_less_than_max && (
                                        <>
                                            &nbsp;/&nbsp;
                                            <span
                                                onClick={onBuyWithFiat}
                                                className="hover:opacity-60"
                                            >
                                                Pay with fiat
                                            </span>
                                        </>
                                    )}
                                </div>
                                <BalanceRefresh
                                    symbol={
                                        token
                                            ? (token?.symbol.toLocaleUpperCase() as SupportedLedgerTokenSymbol)
                                            : 'ICP'
                                    }
                                />
                            </div>
                        </div>
                        <div className="flex w-full items-center justify-between gap-x-[27px] p-5 pt-0">
                            {' '}
                            <Button
                                variant={'outline'}
                                onClick={onModalClose}
                                className="h-[36px] w-[86px] flex-shrink-0 rounded-[8px] border border-solid border-black/60 bg-[#283047] text-center font-inter-bold text-[16px] leading-[36px] text-white hover:bg-[#283047]/60 hover:text-white "
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={onConfirm}
                                disabled={string2bigint(e8s) < needed}
                                className={cn(
                                    'h-[36px] flex-shrink-0 rounded-[8px] bg-shiku text-center font-inter-bold text-[16px] leading-[36px] text-white hover:bg-shiku/60 hover:text-white',
                                    string2bigint(e8s) < needed && '!cursor-not-allowed',
                                )}
                            >
                                Confirm {action && <LoadingOutlined className="ml-2" />}
                            </Button>
                        </div>
                        <BalanceInsufficient
                            balance={e8s}
                            need={bigint2string(needed)}
                            setAddFundsOpen={setAddFundsOpen}
                            className="line-clamp-1  w-full justify-between px-[20px]"
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default BuyModal;
