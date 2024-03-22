import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Modal } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import shallow from 'zustand/shallow';
import TokenPrice from '@/components/data/price';
import Usd from '@/components/data/usd';
import { IconLaunchpadFailed, IconLogoLedgerIcp } from '@/components/icons';
import { get_usd_with_fee } from '@/components/layout/components/user-sidebar/funds';
import message from '@/components/message';
import { ActionStepsModal } from '@/components/modal/action-steps';
import {
    AddFundsModal,
    BuyWithFiatModal,
    MAX_FIAT_AMOUNT,
    MIN_FIAT_AMOUNT,
} from '@/components/nft-card/components/buy';
import NftName from '@/components/nft/name';
import NftThumbnail from '@/components/nft/thumbnail';
import { Button } from '@/components/ui/button';
import CloseIcon from '@/components/ui/close-icon';
import BalanceInsufficient from '@/components/user/balance/balance-insufficient';
import BalanceRefresh from '@/components/user/balance/balance-refresh';
import { MarkAction } from '@/hooks/exchange/steps';
import { BuyLaunchpadNftExecutor, LaunchpadBuyAction } from '@/hooks/views/launchpad';
import { cdn } from '@/common/cdn';
import { cn } from '@/common/cn';
import { exponentNumber } from '@/common/data/numbers';
import { uniqueKey } from '@/common/nft/identifier';
import { bigint2string, string2bigint } from '@/common/types/bigint';
import { useAppStore } from '@/stores/app';
import { useIdentityStore } from '@/stores/identity';
import { NftIdentifier } from '@/types/nft';
import { getLedgerIcpDecimals, getLedgerIcpFee } from '../../../../utils/canisters/ledgers/special';
import './index.less';

type LaunchpadBuyModalInfo = {
    amount: number;
    price: string;
    featured: string;
    name: string;
};

export const LaunchpadResult = ({
    success_list,
    total_buy,
    onClose,
}: {
    success_list: NftIdentifier[];
    total_buy: number;
    onClose: () => void;
}) => {
    return (
        <Modal
            zIndex={10001}
            open={true}
            closeIcon={null}
            footer={null}
            onCancel={onClose}
            centered={true}
            className="launchpad-result"
        >
            <div className="relative flex min-h-[400px] flex-col items-center justify-center text-white">
                <CloseIcon className="absolute right-0 top-0" onClick={onClose}></CloseIcon>
                <div className={cn('flex h-full flex-col justify-between')}>
                    {(!success_list || (success_list && success_list.length === 0)) && (
                        <div className="flex min-h-[400px] flex-col justify-between">
                            <span className="mb-[20px] font-inter-bold text-[20px]">
                                Purchase Failed
                            </span>
                            <div className="flex flex-col items-center">
                                <IconLaunchpadFailed className="h-[142.3px] w-[179px]" />
                                <p className="mt-[30px] font-inter text-[14px] leading-[20px] ">
                                    Sorry, your purchase has failed. The paid funds have been
                                    returned to your account, please check and try the purchase
                                    again!
                                </p>

                                <div className="mt-[15px] flex justify-center">
                                    <Link to={'/profile'}>
                                        <Button className="!hover:text-white h-[48px] w-[160px] cursor-pointer rounded-[8px]  bg-shiku text-center text-[16px] leading-[48px]  text-white hover:bg-shiku/60 hover:text-white">
                                            View NFT
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                    {success_list && success_list.length !== 0 && (
                        <>
                            <div className="">
                                <img
                                    className="m-auto mb-[8px] flex w-[200px] items-center justify-center"
                                    src={'/img/market/success.svg'}
                                    alt=""
                                />
                                <div className="mb-[19px] text-center font-inter-bold text-[14px]  md:mb-[25px]">
                                    Purchase successfully!
                                </div>
                            </div>
                            <div className="grid w-full grid-cols-3 flex-wrap items-center gap-x-[24px]  gap-y-[20px] md:grid-cols-5">
                                {success_list &&
                                    success_list.map((item, index) => (
                                        <div
                                            key={uniqueKey(item) + index}
                                            className="flex h-full w-full cursor-pointer flex-col justify-between"
                                        >
                                            <NftThumbnail
                                                token_id={item}
                                                cdn_width={100}
                                                width="w-full"
                                            />
                                            <div className="mt-[9px] h-[14px] text-center text-[12px] leading-[14px]">
                                                <NftName
                                                    token_id={item}
                                                    shrink_text={{ prefix: 1, suffix: 5 }}
                                                ></NftName>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                            <div className="font-inter-normal mt-[30px] w-full text-left  text-[14px] ">
                                You claimed {total_buy} NFT{total_buy > 1 && 's'} and the result
                                is:&nbsp;
                                <span className="text-[#7355FF]">
                                    {success_list?.length} successes,{' '}
                                    {success_list && total_buy - success_list.length} failures
                                </span>
                            </div>
                            <div className="font-inter-normal m-auto hidden  text-left text-[14px] ">
                                In the failed claim, the paid funds have been returned to your
                                account, please check and try the purchase again!
                            </div>
                            <div className="font-inter-normal m-auto  text-left text-[14px] ">
                                Sorry for the inconvenience, you will get your refund in your
                                account for failed order, please check and try to purchase again!
                            </div>
                            <div className="mt-[30px]">
                                <div className="font-inter-normal mb-[19px] text-center text-[12px]  md:mb-[15px]">
                                    Check your NFT in the profile page
                                </div>
                                <Link to="/profile" onClick={onClose}>
                                    <Button className="m-auto block !h-[40px] !w-[134px] rounded-[8px]  bg-shiku text-center font-inter-bold text-[16px] text-white  hover:bg-shiku/60 hover:text-white md:!h-[48px] md:!w-[160px]">
                                        View
                                    </Button>
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </Modal>
    );
};

const actions: MarkAction<LaunchpadBuyAction>[] = [
    {
        title: 'Check order status and check wallet balance',
        actions: ['DOING', 'CHECKING_PURCHASE', 'CHECKING_BALANCE'],
    },
    { title: 'Calling Ledger to validate transactions', actions: ['PAY'] },
    { title: 'Transferring item', actions: ['CLAIMING'] },
];
export const LaunchpadBuyModal = ({
    open,
    onClose,
    info,
    buy,
    action,
    update,
}: {
    open: boolean;
    onClose: () => void;
    info: LaunchpadBuyModalInfo;
    buy: BuyLaunchpadNftExecutor;
    update: Function;
    action: LaunchpadBuyAction;
}) => {
    const { amount, price, featured, name } = info;

    const [tokenIdList, setTokenIdList] = useState<NftIdentifier[]>([]);
    const { e8sIcp, identity } = useIdentityStore(
        (s) => ({
            e8sIcp: s.icpBalance?.e8s,
            identity: s.connectedIdentity,
        }),
        shallow,
    );
    const e8s = e8sIcp || '0';

    const needed = BigInt(amount) * BigInt(price) + BigInt(getLedgerIcpFee());
    const [addFundsOpen, setAddFundsOpen] = useState<boolean>(false);
    const [buyWithFiatOpen, setBuyWithFiatOpen] = useState<boolean>();
    const [resultOpen, setResultOpen] = useState<boolean>();
    const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
    const onConfirm = async () => {
        if (!action) {
            setConfirmLoading(true);
            onClose();
            buy(amount)
                .then((token_id_list) => {
                    if (token_id_list !== undefined) {
                        setTokenIdList(token_id_list);
                        update();
                        setResultOpen(true);
                    }
                })
                .catch((e) => message.error(`buy failed ${e}`))
                .finally(() => setConfirmLoading(false));
        }
    };

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

    const larger_than_min = lack_with_alchemy_fee > MIN_FIAT_AMOUNT || lack_with_alchemy_fee === 0;

    const price_larger_than_min = price_needed_with_alchemy_fee > MIN_FIAT_AMOUNT;

    const price_less_than_max = price_needed_with_alchemy_fee < MAX_FIAT_AMOUNT;

    const balance_enough = string2bigint(e8s) >= needed;

    const onBuyWithFiat = async () => {
        setBuyWithFiatOpen(true);
    };
    return (
        <>
            <AddFundsModal
                open={addFundsOpen}
                show_or={larger_than_min}
                onClose={() => {
                    setAddFundsOpen(false);
                }}
                args={{
                    principal: identity?.principal,
                    symbol: 'ICP',
                    need_amount: bigint2string(lack),
                }}
            ></AddFundsModal>
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
            {action && (
                <ActionStepsModal<LaunchpadBuyAction>
                    title={''}
                    actions={actions}
                    action={action}
                ></ActionStepsModal>
            )}
            {resultOpen && (
                <LaunchpadResult
                    success_list={tokenIdList}
                    total_buy={amount}
                    onClose={() => {
                        setResultOpen(false);
                    }}
                ></LaunchpadResult>
            )}
            <Modal
                open={open}
                footer={null}
                closeIcon={null}
                onCancel={onClose}
                width={550}
                centered={true}
                className="buy-modal"
            >
                <div className="mb-[30px] flex w-full items-center justify-between p-[20px] pb-0 md:p-[30px] md:pb-0">
                    <div className="font-inter-bold text-[20px] leading-none">Checkout</div>
                    <CloseIcon className="w-[14px]" onClick={onClose} />
                </div>

                <div className="hidden w-full flex-col gap-x-[24px] md:flex">
                    <div className="px-[30px]">
                        <div className="flex justify-between">
                            <div className="flex flex-1 flex-col justify-between">
                                <div className="mb-[10px] font-inter-medium text-[14px] text-white/70">
                                    {name}
                                </div>
                                <div className="mb-auto font-inter-medium text-[14px] leading-none">
                                    Amount:&nbsp;{amount}
                                </div>
                                <div className="flex items-center leading-none">
                                    {<IconLogoLedgerIcp className="mr-[7px] w-[18px]" />}
                                    <TokenPrice
                                        value={{
                                            value: price,
                                            decimals: { type: 'exponent', value: 8 },
                                            scale: 2,
                                        }}
                                        className="mr-[10px] font-inter-bold text-[26px]"
                                    />
                                    <Usd
                                        value={{
                                            value: price,
                                            decimals: {
                                                type: 'exponent',
                                                value: getLedgerIcpDecimals(),
                                            },
                                            symbol: 'ICP',
                                            scale: 2,
                                        }}
                                        className="font-inter-medium text-[16px]"
                                    />
                                </div>
                            </div>
                            <img
                                className="mr-[24px] block h-[90px] w-[90px] rounded-[8px]"
                                src={cdn(featured)}
                            />
                        </div>

                        <div className="mt-[30px] flex justify-between">
                            <span className=" font-inter-semibold text-[20px]">Total</span>

                            <div className="flex items-center leading-none">
                                {<IconLogoLedgerIcp className="mr-[7px] w-[18px]" />}
                                <TokenPrice
                                    value={{
                                        value: (BigInt(amount) * BigInt(price)).toString(),
                                        decimals: { type: 'exponent', value: 8 },
                                        scale: 2,
                                    }}
                                    className="mr-[10px] font-inter-bold text-[26px]"
                                />
                                <Usd
                                    value={{
                                        value: `${Number(price) * Number(amount)}`,
                                        decimals: {
                                            type: 'exponent',
                                            value: getLedgerIcpDecimals(),
                                        },
                                        symbol: 'ICP',
                                        scale: 2,
                                    }}
                                    className="font-inter-medium text-[16px]"
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

                                {price_larger_than_min && price_less_than_max && (
                                    <>
                                        &nbsp;/&nbsp;
                                        <span onClick={onBuyWithFiat} className="hover:opacity-60">
                                            Pay with fiat
                                        </span>
                                    </>
                                )}
                            </div>

                            <BalanceRefresh symbol={'ICP'} />
                        </div>
                        <div className="flex items-center gap-x-[27px]">
                            <Button
                                onClick={onClose}
                                variant={'outline'}
                                className="h-[36px] w-[86px] flex-shrink-0 rounded-[8px] border border-solid border-black/60 bg-[#283047] text-center font-inter-bold text-[16px] leading-[36px] text-white hover:bg-[#283047]/60  hover:text-white"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={onConfirm}
                                disabled={!balance_enough}
                                className={cn(
                                    'h-[36px] flex-shrink-0 rounded-[8px]  bg-shiku text-center font-inter-bold text-[16px] leading-[36px] text-white  hover:bg-shiku/60 hover:text-white',
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
                <div className="flex w-full flex-col gap-x-[24px] md:hidden">
                    <div className="px-[20px]">
                        <div className="flex justify-between">
                            <div className="flex flex-1 flex-col justify-between">
                                <div className="mb-[5px] font-inter-medium text-[14px] text-name">
                                    {name}
                                </div>
                                <div className="mb-auto font-inter-medium text-[14px] leading-none">
                                    Amount:&nbsp;{amount}
                                </div>
                                <div className="flex items-center leading-none">
                                    {<IconLogoLedgerIcp className="mr-[7px] w-[18px]" />}
                                    <TokenPrice
                                        value={{
                                            value: (BigInt(amount) * BigInt(price)).toString(),
                                            decimals: { type: 'exponent', value: 8 },
                                            scale: 2,
                                        }}
                                        className="mr-[10px] font-inter-bold text-[26px]"
                                    />
                                    <Usd
                                        value={{
                                            value: `${Number(price) * Number(amount)}`,
                                            decimals: {
                                                type: 'exponent',
                                                value: getLedgerIcpDecimals(),
                                            },
                                            symbol: 'ICP',
                                            scale: 2,
                                        }}
                                        className="font-inter-medium text-[16px]"
                                    />
                                </div>
                            </div>
                            <img
                                className="mr-[24px] block h-[90px] w-[90px] rounded-[8px]"
                                src={cdn(featured)}
                            />
                        </div>

                        <div className="mt-[30px] flex justify-between">
                            <span className=" font-inter-semibold text-[20px]">Total</span>

                            <div className="flex items-center leading-none">
                                {<IconLogoLedgerIcp className="mr-[7px] w-[18px]" />}
                                <TokenPrice
                                    value={{
                                        value: (BigInt(amount) * BigInt(price)).toString(),
                                        decimals: { type: 'exponent', value: 8 },
                                        scale: 2,
                                    }}
                                    className="mr-[10px] font-inter-bold text-[26px]"
                                />
                                <Usd
                                    value={{
                                        value: `${Number(price) * Number(amount)}`,
                                        decimals: {
                                            type: 'exponent',
                                            value: getLedgerIcpDecimals(),
                                        },
                                        symbol: 'ICP',
                                        scale: 2,
                                    }}
                                    className="font-inter-medium text-[16px]"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="mt-[15px] border-t border-common p-[20px]">
                        <BalanceRefresh symbol={'ICP'} />
                        <div className=" flex cursor-pointer justify-between">
                            <div className="my-auto flex h-full flex-col justify-between gap-y-[5px]">
                                <div className="font-inter-semibold text-[14px]">
                                    <span
                                        onClick={() => setAddFundsOpen(true)}
                                        className={cn('text-shiku hover:opacity-80')}
                                    >
                                        Add Funds
                                    </span>

                                    {price_larger_than_min && price_less_than_max && (
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
                        <div className="mt-[15px] flex items-center justify-between gap-x-[27px]">
                            {' '}
                            <Button
                                onClick={onClose}
                                variant={'outline'}
                                className="h-[36px] w-[86px] flex-shrink-0 rounded-[8px] border border-solid border-black/60 bg-[#283047]  text-center font-inter-bold text-[16px] leading-[36px]  text-white hover:bg-[#283047]/60  hover:text-white"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={onConfirm}
                                // disabled={string2bigint(e8s) < needed}
                                className={cn(
                                    'h-[36px] flex-shrink-0 rounded-[8px] bg-black bg-shiku text-center font-inter-bold text-[16px] leading-[36px] text-white  hover:bg-shiku/60 hover:text-white',
                                    false && '!cursor-not-allowed',
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
            </Modal>
        </>
    );
};
