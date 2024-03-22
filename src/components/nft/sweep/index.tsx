import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Modal } from 'antd';
import { shallow } from 'zustand/shallow';
import ShowNumber from '@/components/data/number';
import Usd from '@/components/data/usd';
import { IconLogoLedgerIcp, IconLogoLedgerOgy } from '@/components/icons';
import { get_usd_with_fee } from '@/components/layout/components/user-sidebar/funds';
import {
    AddFundsModal,
    BuyWithFiatModal,
    MAX_FIAT_AMOUNT,
    MIN_FIAT_AMOUNT,
} from '@/components/nft-card/components/buy';
import { Input } from '@/components/ui/input';
import BalanceInsufficient from '@/components/user/balance/balance-insufficient';
import BalanceRefresh from '@/components/user/balance/balance-refresh';
import { useBatchBuyNftByTransaction } from '@/hooks/exchange/batch/buy';
import { useBuyNftByTransaction } from '@/hooks/exchange/single/buy';
import {
    getLedgerIcpDecimals,
    getLedgerIcpFee,
    getLedgerOgyDecimals,
    getTokenDecimals,
} from '@/utils/canisters/ledgers/special';
import { cn } from '@/common/cn';
import { exponentNumber } from '@/common/data/numbers';
import { uniqueKey } from '@/common/nft/identifier';
import { justPreventLink } from '@/common/react/link';
import { bigint2string, string2bigint } from '@/common/types/bigint';
import { useAppStore } from '@/stores/app';
import { useIdentityStore } from '@/stores/identity';
import { NftListingListing } from '@/types/listing';
import { NftIdentifier, NftMetadata } from '@/types/nft';
import { ShoppingCartItem } from '@/types/yuku';
import TokenPrice from '../../data/price';
import { getBuyNftRaw } from '../../nft-card/components/buy/index';
import { Button } from '../../ui/button';
import CloseIcon from '../../ui/close-icon';
import { Slider } from '../../ui/slider';
import { Switch } from '../../ui/switch';
import NftName from '../name';
import NftThumbnail from '../thumbnail';
import './index.less';

export const SweepConfirm = ({
    items,
    needed,
    onConfirm,
    onClose,
    confirmLoading,
}: {
    items: ShoppingCartItem[];
    needed: { icp: string; ogy: string };
    onConfirm: () => Promise<NftIdentifier[] | void>;
    confirmLoading: boolean;
    onClose: () => void;
}) => {
    const { e8sIcp, e8sOgy, identity } = useIdentityStore(
        (s) => ({
            e8sIcp: s.icpBalance?.e8s,
            e8sOgy: s.ogyBalance?.e8s,
            identity: s.connectedIdentity,
        }),
        shallow,
    );

    const [addFundsOpen, setAddFundsOpen] = useState(false);

    const [buyWithFiatOpen, setBuyWithFiatOpen] = useState(false);

    const balance_insufficient =
        string2bigint(e8sIcp || '0') < string2bigint(needed.icp) ||
        string2bigint(e8sOgy || '0') < string2bigint(needed.ogy);

    const onlyIcp = needed.ogy === '0';

    const onModalClose = () => {
        onClose();
    };

    const onModalConfirm = () => {
        onConfirm();
        onModalClose();
    };

    const lack =
        string2bigint(needed.icp) - string2bigint(e8sIcp || '0') > string2bigint('0')
            ? string2bigint(needed.icp) - string2bigint(e8sIcp || '0')
            : string2bigint('0');

    const icp_usd = useAppStore((s) => s.icp_usd);

    const ramp_network_fee =
        Number(exponentNumber(getLedgerIcpFee(), -getLedgerIcpDecimals())) * Number(icp_usd);

    const lack_with_alchemy_fee = get_usd_with_fee(
        Number(exponentNumber(bigint2string(lack), -getLedgerIcpDecimals())) * Number(icp_usd) +
            ramp_network_fee,
    );
    const price_needed_with_alchemy_fee = get_usd_with_fee(
        Number(exponentNumber(needed.icp, -getLedgerIcpDecimals())) * Number(icp_usd) +
            ramp_network_fee,
    );

    const larger_than_min = lack_with_alchemy_fee > MIN_FIAT_AMOUNT || lack_with_alchemy_fee === 0;

    const price_larger_than_min = price_needed_with_alchemy_fee > MIN_FIAT_AMOUNT;

    const price_less_than_max = price_needed_with_alchemy_fee < MAX_FIAT_AMOUNT;

    const onBuyWithFiat = async () => {
        try {
            setBuyWithFiatOpen(true);
        } catch (e) {
            return;
        }
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
                    symbol: 'ICP',
                    need_amount: bigint2string(string2bigint(needed.icp) - BigInt(e8sIcp || '0')),
                }}
            />
            {buyWithFiatOpen && (
                <BuyWithFiatModal
                    onClose={() => {
                        setBuyWithFiatOpen(false);
                    }}
                    onBuy={onConfirm}
                    needed={string2bigint(needed.icp)}
                    confirmLoading={confirmLoading}
                />
            )}
            <Modal
                open={true}
                footer={null}
                closeIcon={null}
                onCancel={onModalClose}
                width={550}
                centered={true}
                className="buy-modal swap-modal"
            >
                <div className="mb-[25px] flex w-full items-center justify-between p-[20px] pb-0 text-white md:p-[30px] md:pb-0">
                    <div className="font-inter-bold text-[20px] leading-none">Sweep</div>
                    <CloseIcon className="w-[14px]" onClick={onModalClose} />
                </div>
                <div className="text-white">
                    <div className="flex justify-between px-[30px] font-inter-semibold text-[14px] text-white/60 opacity-60">
                        <span>Item</span>
                        <span>Price</span>
                    </div>
                    <div className="flex h-[258px] overflow-scroll px-[30px] py-[10px]">
                        <div className="flex h-fit w-full  flex-col gap-y-[8px] pb-[10px]">
                            {items
                                .filter((i) => !!i.card)
                                .map((item) => {
                                    if (!item.card) {
                                        return;
                                    }
                                    return (
                                        <Link
                                            to={`/market/${item.token_id.collection}/${item.card.metadata.token_id.token_identifier}`}
                                            className="flex cursor-pointer items-center justify-between hover:text-white"
                                            key={uniqueKey(item.card.metadata.token_id)}
                                        >
                                            <div className="flex items-center gap-x-[10px]">
                                                <NftThumbnail
                                                    token_id={item.token_id}
                                                    cdn_width={100}
                                                    width="w-[34px]"
                                                />

                                                <NftName
                                                    token_id={item.card.metadata.token_id}
                                                    metadata={item.card}
                                                    className="text-white"
                                                />
                                            </div>
                                            <div>
                                                <TokenPrice
                                                    value={{
                                                        value: (item.listing as NftListingListing)
                                                            .price,
                                                        decimals: {
                                                            type: 'exponent',
                                                            value: getTokenDecimals(),
                                                        },
                                                        scale: (v) => (v < 0.01 ? 4 : 2),
                                                    }}
                                                    className="font-inter-semibold text-[14px] md:text-[14px]"
                                                />
                                                <span className="ml-[3px] font-inter-semibold text-[14px]">
                                                    {(
                                                        item.listing as NftListingListing
                                                    ).token.symbol.toLocaleUpperCase()}
                                                </span>
                                            </div>
                                        </Link>
                                    );
                                })}
                        </div>
                    </div>
                </div>
                <div className="hidden w-full flex-col gap-x-[24px] text-white  md:flex">
                    <div className="px-[30px]">
                        <div className="mt-[22px] flex items-center justify-between">
                            <span className=" font-inter-semibold text-[20px]">Total</span>
                            <div className="flex flex-col items-end justify-center gap-y-[10px]">
                                {string2bigint(needed.icp) > 0 && (
                                    <div className="flex items-center leading-none">
                                        <IconLogoLedgerIcp className="mr-[7px] w-[18px]" />
                                        <ShowNumber
                                            className="mr-[5px] font-inter-semibold text-[20px]  md:text-[20px]"
                                            value={{
                                                value: exponentNumber(
                                                    needed.icp,
                                                    -getLedgerIcpDecimals(),
                                                ),
                                                scale: 2,
                                                paddingEnd: 2,
                                            }}
                                        />
                                        <Usd
                                            className="font-inter-medium text-[14px] text-white/60"
                                            value={{
                                                value: exponentNumber(
                                                    needed.icp,
                                                    -getLedgerIcpDecimals(),
                                                ),
                                                symbol: 'ICP',
                                                scale: 2,
                                            }}
                                        />
                                    </div>
                                )}
                                {string2bigint(needed.ogy) > 0 && (
                                    <div className="flex items-center font-inter-medium leading-none">
                                        <IconLogoLedgerOgy className="mr-[7px] w-[18px]" />
                                        <ShowNumber
                                            className="mr-[5px] font-inter-semibold text-[20px] text-black md:text-[20px]"
                                            value={{
                                                value: exponentNumber(
                                                    needed.ogy,
                                                    -getLedgerOgyDecimals(),
                                                ),
                                                scale: 2,
                                                paddingEnd: 2,
                                            }}
                                        />
                                        <Usd
                                            className="text-[14px] text-white/60"
                                            value={{
                                                value: exponentNumber(
                                                    needed.ogy,
                                                    -getLedgerOgyDecimals(),
                                                ),
                                                symbol: 'OGY',
                                                scale: 2,
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="mt-[15px] flex flex-col border-t border-common  p-[30px]">
                        <BalanceRefresh />
                        <div className="mt-[16px] flex cursor-pointer justify-between ">
                            <div className="my-auto flex h-full items-center justify-between gap-y-[2px]">
                                <span
                                    onClick={() => setAddFundsOpen(true)}
                                    className=" cursor-pointer font-inter-semibold leading-none text-shiku hover:opacity-80"
                                >
                                    Add Funds
                                </span>
                                <div className="font-inter-semibold text-[14px]">
                                    {onlyIcp && price_larger_than_min && price_less_than_max && (
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
                            </div>
                            <div className="flex items-center gap-x-[27px]">
                                <Button
                                    onClick={onModalClose}
                                    variant={'outline'}
                                    className="h-[36px] w-[86px] flex-shrink-0 rounded-[8px] border-none bg-[#283047] text-center font-inter-bold text-[16px] leading-[36px] hover:bg-[#283047]/60 hover:text-white "
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={onModalConfirm}
                                    disabled={balance_insufficient}
                                    className={cn(
                                        'h-[36px] flex-shrink-0 rounded-[8px] bg-shiku text-center font-inter-bold text-[16px] leading-[36px] text-white hover:bg-shiku/60',
                                        balance_insufficient && '!cursor-not-allowed',
                                    )}
                                >
                                    Confirm
                                </Button>
                            </div>
                        </div>
                    </div>
                    {balance_insufficient && (
                        <BalanceInsufficient
                            balance={'0'}
                            need={'1'}
                            setAddFundsOpen={setAddFundsOpen}
                        />
                    )}
                </div>
                <div className="flex w-full flex-col gap-x-[24px] text-white  md:hidden">
                    <div className="px-[30px]">
                        <div className="mt-[22px] flex items-center justify-between">
                            <span className=" font-inter-semibold text-[20px]">Total</span>
                            <div className="flex flex-col items-end justify-center gap-y-[10px]">
                                {string2bigint(needed.icp) > 0 && (
                                    <div className="flex items-center leading-none">
                                        <IconLogoLedgerIcp className="mr-[7px] w-[18px]" />
                                        <ShowNumber
                                            className="mr-[5px] font-inter-semibold text-[20px] md:text-[20px]"
                                            value={{
                                                value: exponentNumber(
                                                    needed.icp,
                                                    -getLedgerIcpDecimals(),
                                                ),
                                                scale: 2,
                                                paddingEnd: 2,
                                            }}
                                        />
                                        <Usd
                                            className="font-inter-medium text-[14px] text-white/60"
                                            value={{
                                                value: exponentNumber(
                                                    needed.icp,
                                                    -getLedgerIcpDecimals(),
                                                ),
                                                symbol: 'ICP',
                                                scale: 2,
                                            }}
                                        />
                                    </div>
                                )}
                                {string2bigint(needed.ogy) > 0 && (
                                    <div className="flex items-center font-inter-medium leading-none">
                                        <IconLogoLedgerOgy className="mr-[7px] w-[18px]" />
                                        <ShowNumber
                                            className="mr-[5px] font-inter-semibold text-[20px] text-black md:text-[20px]"
                                            value={{
                                                value: exponentNumber(
                                                    needed.ogy,
                                                    -getLedgerOgyDecimals(),
                                                ),
                                                scale: 2,
                                                paddingEnd: 2,
                                            }}
                                        />
                                        <Usd
                                            className="text-[14px] text-white/60"
                                            value={{
                                                value: exponentNumber(
                                                    needed.ogy,
                                                    -getLedgerOgyDecimals(),
                                                ),
                                                symbol: 'OGY',
                                                scale: 2,
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="mt-[15px] flex flex-col border-t border-common  p-[30px]">
                        <div className="my-auto  mb-[16px] flex h-full items-center justify-start gap-y-[2px]">
                            <span
                                onClick={() => setAddFundsOpen(true)}
                                className=" cursor-pointer font-inter-semibold leading-none text-shiku hover:opacity-80"
                            >
                                Add Funds
                            </span>
                            <div className="font-inter-semibold text-[14px]">
                                <div className="font-inter-semibold text-[14px]">
                                    {onlyIcp && price_larger_than_min && price_less_than_max && (
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
                            </div>
                        </div>

                        <BalanceRefresh />
                        <div className="mt-[16px] flex cursor-pointer flex-col justify-between ">
                            <div className="flex w-full items-center justify-between gap-x-[27px]">
                                <Button
                                    onClick={onModalClose}
                                    variant={'outline'}
                                    className="h-[36px] w-[86px] flex-shrink-0 rounded-[8px] border border-none bg-[#283047]  text-center font-inter-bold text-[16px] leading-[36px]  hover:bg-[#283047]/60  hover:text-white"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={onModalConfirm}
                                    disabled={balance_insufficient}
                                    className={cn(
                                        'h-[36px] flex-shrink-0 rounded-[8px] bg-shiku text-center font-inter-bold text-[16px] leading-[36px] text-white hover:bg-shiku/60',
                                        balance_insufficient && '!cursor-not-allowed',
                                    )}
                                >
                                    Confirm
                                </Button>
                            </div>
                        </div>
                    </div>
                    {balance_insufficient && (
                        <BalanceInsufficient
                            balance={'0'}
                            need={'1'}
                            setAddFundsOpen={setAddFundsOpen}
                        />
                    )}
                </div>
            </Modal>
        </div>
    );
};

const MAX_SWEEP = 50;

export default function Sweep({
    list,
    refresh,
    update,
}: {
    list: NftMetadata[] | undefined;
    isGold?: boolean;
    update?: () => void;
    refresh: (() => Promise<void>) | (() => void);
}) {
    const { collection } = useParams();
    const { sweepMode, sweepItems, identity, toggleSweepMode, setSweepItems } = useIdentityStore(
        (s) => ({
            sweepMode: s.sweepMode,
            toggleSweepMode: s.toggleSweepMode,
            sweepGold: s.sweepGold,
            sweepItems: s.sweepItems,
            setSweepItems: s.setSweepItems,
            identity: s.connectedIdentity,
        }),
        shallow,
    );

    const items = sweepItems[collection!] ?? [];

    const totalPrice = items.reduce(
        (sum, item) =>
            bigint2string(BigInt(sum) + string2bigint((item.listing as NftListingListing).price)),
        '0',
    );

    const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
    const total_icp = items
        .filter((t) => t.listing?.type === 'listing')
        .map((t) => ({
            symbol: (t.listing as NftListingListing).token.symbol,
            decimals: (t.listing as NftListingListing).token.decimals,
            fee: (t.listing as NftListingListing).token.fee,
            price: (t.listing as NftListingListing).price,
        }))
        .filter((t) => t.symbol === 'ICP')
        .filter((t) => t.price)
        .map((t) => BigInt(t.price ?? '0') + BigInt(t.fee ?? '0'))
        .reduce((a, b) => a + b, BigInt(0));
    const total_ogy = items
        .filter((t) => t.listing?.type === 'listing')
        .map((t) => ({
            symbol: (t.listing as NftListingListing).token.symbol,
            decimals: (t.listing as NftListingListing).token.decimals,
            fee: (t.listing as NftListingListing).token.fee,
            price: (t.listing as NftListingListing).price,
        }))
        .filter((t) => t.symbol === 'OGY')
        .filter((t) => t.price)
        .map((t) => BigInt(t.price ?? '0') + BigInt(t.fee ?? '0'))
        .reduce((a, b) => a + b, BigInt(0));

    const { batchBuy, action } = useBatchBuyNftByTransaction();
    const { buy, action: single_action } = useBuyNftByTransaction();

    const [resetSlider, setResetSlider] = useState<number>(0);

    const onBuyNow = async () => {
        try {
            setConfirmOpen(true);
        } catch (e) {
            return;
        }
    };

    const onConfirm = async (): Promise<NftIdentifier[] | undefined> => {
        const nft_list = items.filter((t) => t.card !== undefined && t.listing?.type === 'listing');
        if (nft_list.length === 0) {
            throw new Error('add nft please');
        }
        const entrepot_list = nft_list.filter(
            (l) => l.listing?.type === 'listing' && l.listing.raw.type === 'entrepot',
        );
        const yuku_list = nft_list.filter(
            (l) => l.listing?.type === 'listing' && l.listing.raw.type !== 'entrepot',
        );
        const connectByPlug = identity?.connectType === 'plug';
        try {
            const result = (
                await Promise.all([
                    yuku_list.length &&
                        batchBuy(
                            yuku_list.map((item) => ({
                                owner: item.card!.owner,
                                listing: item.listing!,
                            })),
                        ),

                    ...(connectByPlug
                        ? [
                              entrepot_list.length &&
                                  batchBuy(
                                      entrepot_list.map((item) => ({
                                          owner: item.card!.owner,
                                          listing: item.listing!,
                                      })),
                                  ),
                          ]
                        : [
                              entrepot_list.length &&
                                  entrepot_list.map(async (n) => {
                                      return new Promise((resolve, reject) => {
                                          if (n.listing?.type !== 'listing' || !n.card) {
                                              reject('not list' + n.token_id.token_identifier);
                                              return;
                                          }
                                          buy(
                                              n.token_id,
                                              n.card?.owner.owner,
                                              n.listing?.token,
                                              n.listing?.price,
                                              getBuyNftRaw(n.card, n.card.listing),
                                          ).then(() => resolve(n.token_id));
                                      });
                                  }),
                          ]),
                ])
            )
                .filter((r) => r)
                .flat() as NftIdentifier[];

            setSweepItems([], collection!);
            setResetSlider((prev) => prev + 1);

            return result;
        } catch (error) {
            console.debug('🚀 ~ onConfirm ~ error:', error);
        }
    };

    const max_sweep = Math.min(list?.length || 0, MAX_SWEEP);

    useEffect(() => {
        list &&
            collection &&
            setSweepItems(
                list.slice(0, items.length).map((card) => ({
                    token_id: card.metadata.token_id,
                    card,
                    listing: card.listing?.listing,
                })),
                collection,
            );
    }, [items.length, list, collection]);

    const confirmLoading = !!(action || single_action);
    if (!list && !collection) {
        return <></>;
    }
    return (
        <>
            {confirmOpen && (
                <SweepConfirm
                    items={items}
                    needed={{
                        icp: bigint2string(total_icp),
                        ogy: bigint2string(total_ogy),
                    }}
                    onConfirm={onConfirm}
                    confirmLoading={confirmLoading}
                    onClose={() => {
                        setConfirmOpen(false);
                    }}
                />
            )}
            <div className="fixed bottom-0 left-0 right-0 z-[1000] hidden  h-[74px] w-full items-center justify-between gap-x-[18px]  border-t border-[#283047] bg-[#101522] px-[40px] py-[17px] text-white md:flex">
                <div className="flex items-center gap-x-[18px]">
                    <div className="font-inter-bold text-[16px] leading-normal ">Sweep</div>
                    <Switch
                        checked={sweepMode}
                        onClick={() => {
                            toggleSweepMode();
                            update && update();
                            refresh();
                        }}
                    />
                </div>
                {sweepMode && (
                    <div className="mr-auto flex items-center gap-x-[18px]">
                        <div className="flex h-[40px] items-center justify-between gap-x-[13px] overflow-hidden rounded-[8px] border border-common">
                            <div className="border-r border-common p-[7px]">
                                <img src="/img/market/broom.svg" alt="broom" />
                            </div>
                            <Slider
                                onValueChange={(e) => {
                                    setSweepItems(
                                        list!.slice(0, e[0]).map((card) => ({
                                            token_id: card.metadata.token_id,
                                            card,
                                            listing: card.listing?.listing,
                                        })),
                                        collection!,
                                    );
                                }}
                                className="w-[150px]"
                                value={[items.length]}
                                max={max_sweep}
                                step={1}
                                key={'sweep-slider' + resetSlider}
                            />

                            <div className="flex w-[78px] items-center border-l border-common px-[7px] py-[15px] font-inter-semibold text-[14px]">
                                <Input
                                    className="box-content h-[20px] w-[20px] border-none bg-transparent px-0 py-[10px] font-inter-bold text-[14px] text-white"
                                    value={items.length}
                                    defaultValue={items.length}
                                    onChange={(e) => {
                                        let v = Number(e.target.value);
                                        if (isNaN(v)) {
                                            return;
                                        }
                                        v = Math.min(v, max_sweep);
                                        setSweepItems(
                                            list!.slice(0, v).map((card) => ({
                                                token_id: card.metadata.token_id,
                                                card,
                                                listing: card.listing?.listing,
                                            })),
                                            collection!,
                                        );
                                    }}
                                />
                                <span className="ml-[3px] h-fit">Items</span>
                            </div>
                        </div>

                        <div className="flex items-end font-inter-semibold ">
                            <div className="flex min-w-[15px] items-end">
                                <TokenPrice
                                    value={{
                                        value: bigint2string(total_icp),
                                        decimals: { type: 'exponent', value: getTokenDecimals() },
                                        scale: 2,
                                        paddingEnd: 2,
                                    }}
                                    className="mx-auto text-[14px] leading-none text-white md:text-[14px]"
                                />
                            </div>

                            <span className="ml-[3px] text-[12px] leading-none text-white/70">
                                ICP
                            </span>
                        </div>
                        {total_ogy > 0 && (
                            <div className="flex items-end font-inter-semibold ">
                                <div className="flex min-w-[15px] items-end">
                                    <TokenPrice
                                        value={{
                                            value: bigint2string(total_ogy),
                                            decimals: {
                                                type: 'exponent',
                                                value: getTokenDecimals(),
                                            },
                                            scale: 2,
                                            paddingEnd: 2,
                                        }}
                                        className="mx-auto text-[14px] leading-none text-white md:text-[14px]"
                                    />
                                </div>
                                <span className="ml-[3px] text-[12px] leading-none text-white/70">
                                    OGY
                                </span>
                            </div>
                        )}
                    </div>
                )}
                <div className={cn('flex', !sweepMode && 'hidden')}>
                    {identity ? (
                        <Button
                            disabled={items.length === 0}
                            onClick={onBuyNow}
                            className="flex items-center bg-shiku font-inter-bold text-[14px] hover:bg-shiku/70"
                        >
                            Buy Now
                        </Button>
                    ) : (
                        <Link to="/connect">
                            <Button className="flex items-center bg-shiku font-inter-bold text-[14px] hover:bg-shiku/70">
                                Connect
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
            <div className="fixed bottom-0 left-0 right-0 z-[1000] flex w-full flex-col items-center justify-between gap-x-[18px] border-t border-[#283047] bg-[#101522]  px-[18px] text-white md:hidden">
                <div className="flex min-h-[52px] w-full items-center justify-between">
                    <div className="flex gap-x-[13px]">
                        <div className="font-inter-bold text-[16px]">Sweep</div>
                        <Switch
                            checked={sweepMode}
                            onClick={() => {
                                toggleSweepMode();
                                update && update();
                                refresh();
                            }}
                        />
                    </div>
                    {!sweepMode ? (
                        <div className="rounded-[8px] border border-common p-[7px]">
                            <img src="/img/market/broom.svg" alt="broom" />
                        </div>
                    ) : (
                        <CloseIcon onClick={toggleSweepMode} />
                    )}
                </div>
                {sweepMode && (
                    <div className="mt-[10px] flex w-full flex-col items-center gap-x-[18px]">
                        <div className="flex h-[40px] w-full items-center justify-between gap-x-[13px] overflow-hidden rounded-[8px] border border-common">
                            <div className="border-r border-common p-[7px]">
                                <img src="/img/market/broom.svg" alt="broom" />
                            </div>
                            <Slider
                                onValueChange={(e) => {
                                    setSweepItems(
                                        list!.slice(0, e[0]).map((card) => ({
                                            token_id: card.metadata.token_id,
                                            card,
                                            listing: card.listing?.listing,
                                        })),
                                        collection!,
                                    );
                                }}
                                className="w-[190px]"
                                defaultValue={[items.length]}
                                max={max_sweep}
                                step={1}
                            />
                            <div className="flex w-[72px] items-center border-l border-common px-[7px] py-[15px] font-inter-semibold text-[14px]">
                                <Input
                                    className="box-content h-[20px] w-[20px] border-none bg-transparent px-0 py-[10px] font-inter-bold text-[14px]  text-white"
                                    value={items.length}
                                    defaultValue={items.length}
                                    onChange={(e) => {
                                        let v = Number(e.target.value);
                                        v = Math.min(v, max_sweep);
                                        setSweepItems(
                                            list!.slice(0, v).map((card) => ({
                                                token_id: card.metadata.token_id,
                                                card,
                                                listing: card.listing?.listing,
                                            })),
                                            collection!,
                                        );
                                    }}
                                />
                                <span className="ml-[3px]">Items</span>
                            </div>
                        </div>
                        <div className="mt-[25px] flex w-full items-center justify-between pb-[20px]">
                            {' '}
                            <div className="flex flex-col items-end gap-y-[3px]">
                                {' '}
                                <div className="flex items-end font-inter-semibold">
                                    <div className="flex min-w-[15px] items-end">
                                        <TokenPrice
                                            value={{
                                                value: totalPrice,
                                                decimals: {
                                                    type: 'exponent',
                                                    value: getTokenDecimals(),
                                                },
                                                scale: 2,
                                                paddingEnd: 2,
                                            }}
                                            className="mx-auto text-[14px] leading-none text-white md:text-[14px]"
                                        />
                                    </div>

                                    <span className="ml-[3px] text-[12px] leading-none text-white/70">
                                        ICP
                                    </span>
                                </div>
                                {total_ogy > 0 && (
                                    <div className="flex items-end font-inter-semibold ">
                                        <div className="flex min-w-[15px] items-end">
                                            <TokenPrice
                                                value={{
                                                    value: bigint2string(total_ogy),
                                                    decimals: {
                                                        type: 'exponent',
                                                        value: getTokenDecimals(),
                                                    },
                                                    scale: 2,
                                                    paddingEnd: 2,
                                                }}
                                                className="mx-auto text-[14px] leading-none text-white md:text-[14px]"
                                            />
                                        </div>
                                        <span className="ml-[3px] text-[12px] leading-none text-white/70">
                                            OGY
                                        </span>
                                    </div>
                                )}
                            </div>
                            {identity ? (
                                <Button
                                    disabled={items.length === 0}
                                    className="bg-shiku font-inter-bold text-[14px] hover:bg-shiku/70"
                                    onClick={onBuyNow}
                                >
                                    Buy Now
                                </Button>
                            ) : (
                                <Link to="/connect">
                                    <Button className="bg-shiku font-inter-bold text-[14px] hover:bg-shiku/70">
                                        Connect
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
