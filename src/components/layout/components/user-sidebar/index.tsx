import { useEffect, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Drawer } from 'antd';
import { Modal } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useConnect } from '@connect2ic/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { shallow } from 'zustand/shallow';
import message from '@/components/message';
import YukuIcon from '@/components/ui/yuku-icon';
import { useTransfer } from '@/hooks/ledger/transfer';
import { writeLastConnectEmail, writeLastConnectType } from '@/utils/app/storage';
// import { cdn } from '@/common/cdn';
import { cn } from '@/common/cn';
import { exponentNumber, isValidNumber, thousandCommaOnlyInteger } from '@/common/data/numbers';
import { shrinkAccount, shrinkPrincipal } from '@/common/data/text';
import { isAccountHex, principal2account } from '@/common/ic/account';
import { isPrincipalText } from '@/common/ic/principals';
import { useAppStore } from '@/stores/app';
import { useDeviceStore } from '@/stores/device';
import { useIdentityStore } from '@/stores/identity';
import { SupportedLedgerTokenSymbol } from '@/types/canisters/ledgers';
import TokenPrice from '../../../data/price';
import { IconLogoLedgerIcp, IconLogoLedgerOgy } from '../../../icons';
import { Button, YukuButton } from '../../../ui/button';
import CloseIcon from '../../../ui/close-icon';
import SkeletonTW from '../../../ui/skeleton';
import Tooltip from '../../../ui/tooltip';
import Credit from '../../../user/credit';
import { DepositModal } from './deposit';
import './index.less';
import { TransferForm } from './wallet';

// deposit money to icp
const getFormSchema = (
    balance: string,
    fee: string,
    decimals: number,
    symbol: SupportedLedgerTokenSymbol,
) => {
    return z.object({
        amount: z
            .string()
            .nonempty({
                message: 'Please enter the amount to transfer',
            })
            .refine((amount) => !isNaN(Number(amount)) && isValidNumber(amount, 8), {
                message: 'Expected a valid number',
            })
            .refine(
                (amount) => {
                    return (
                        !isNaN(Number(amount)) &&
                        isValidNumber(amount, 8) &&
                        BigInt(exponentNumber(amount, decimals)) + BigInt(fee) <= BigInt(balance)
                    );
                },
                {
                    message: 'Not sufficient funds',
                },
            )
            .refine(
                (amount) => {
                    const n = Number(amount);
                    return symbol === 'ICP'
                        ? 0.0002 <= n && n < 100000
                        : 0.003 <= n && n < 10000000;
                },
                {
                    message:
                        symbol === 'ICP'
                            ? "Transaction amount can't be lower than 0.0002 or exceed 100000"
                            : "Transaction amount can't be lower than 0.003 or exceed 10000000",
                },
            ),
        principal: z
            .string()
            .nonempty({
                message: 'Please enter a principal or account id',
            })
            .refine((target) => isPrincipalText(target) || isAccountHex(target), {
                message: 'Expected a principal or account id',
            }),
    });
};
function SideBarWrapper({
    children,
    onClose,
    open,
}: {
    children?;
    onClose: () => void;
    open: boolean;
}) {
    const { isMobile } = useDeviceStore((s) => s.deviceInfo);
    const identity = useIdentityStore((s) => s.connectedIdentity);
    return (
        <>
            {!isMobile ? (
                <Modal
                    open={open}
                    footer={null}
                    //onOk={onConfirm}
                    width={415}
                    closeIcon={null}
                    onCancel={onClose}
                    styles={{
                        mask: { backgroundColor: 'transparent', display: 'none' },
                        body: { overflow: 'scroll' },
                    }}
                    maskClosable={true}
                    className={cn(
                        'sidebar-modal-wrap',
                        identity?.connectType === 'email' ? '!w-fit !min-w-[415px]' : '!w-[415px]',
                    )}
                >
                    {children}
                </Modal>
            ) : (
                <Drawer
                    open={open}
                    closeIcon={<CloseIcon className="ml-auto" onClick={onClose} />}
                    contentWrapperStyle={{ height: '100vh' }}
                    placement="top"
                    styles={{
                        body: { padding: 0 },
                    }}
                    closable={true}
                    className="sidebar-drawer-wrapper"
                >
                    {children}
                </Drawer>
            )}
        </>
    );
}
export default function SideBar() {
    const navigate = useNavigate();
    const {
        connectedIdentity,
        principal,
        loadingProfile,
        identityProfile,
        reloadIcpBalance,
        reloadOgyBalance,
        isUserSidebarOpen,
        toggleIsUserSidebarIdOpen,
        toggleAddFundsOpen,
        resetUnityUserToken,
        resetProfilePermissions,
        setConnectedIdentity,
    } = useIdentityStore(
        (s) => ({
            connectedIdentity: s.connectedIdentity,
            principal: s.connectedIdentity?.principal,
            identityProfile: s.identityProfile,
            reloadIcpBalance: s.reloadIcpBalance,
            reloadOgyBalance: s.reloadOgyBalance,
            creditPoints: s.creditPoints,
            isUserSidebarOpen: s.isUserSidebarOpen,
            toggleIsUserSidebarIdOpen: s.toggleIsUserSidebarIdOpen,
            toggleAddFundsOpen: s.toggleAddFundsOpen,
            connecting: s.connecting,
            loadingProfile: s.loadingProfile,
            resetUnityUserToken: s.resetUnityUserToken,
            resetProfilePermissions: s.resetProfilePermissions,
            setConnectedIdentity: s.setConnectedIdentity,
        }),
        shallow,
    );

    const { disconnect } = useConnect();
    const setGenerationOpen = useAppStore((s) => s.setGenerationOpen);
    // memoized
    const account = principal ? principal2account(principal) : '';

    const [copied, setCopied] = useState(false);

    // const nftOptions = useMemo(() => {
    //     return [
    //         { key: 'Collected', label: 'Collected', path: `/profile/${principal}/collected` },
    //         { key: 'Created', label: 'Created', path: `/profile/${principal}/created` },
    //         { key: 'Favorited', label: 'Favorited', path: `/profile/${principal}/favorite` },
    //         { key: 'Activity', label: 'Activity', path: `/profile/${principal}/activity` },
    //     ];
    // }, [principal]);

    const [balanceLoading, setBalanceLoading] = useState(false);

    const reloadBalance = () => {
        if (connectedIdentity === undefined) return;
        if (balanceLoading) return;
        setBalanceLoading(true);
        Promise.all([reloadIcpBalance(), reloadOgyBalance()])
            .catch((e) => message.error(`${e}`))
            .finally(() => setBalanceLoading(false));
    };

    useEffect(() => {
        isUserSidebarOpen && reloadBalance();
    }, [isUserSidebarOpen]);

    // const handleOption = ({ path }: { path: string }) => {
    //     if (path) {
    //         toggleIsUserSidebarIdOpen();
    //         navigate(path);
    //     }
    // };

    // useInterval(() => {
    //     reloadBalance();
    // }, 10000);

    // symbol
    const [symbol, setSymbol] = useState<SupportedLedgerTokenSymbol>('ICP');
    const { balance, fee, decimals, transferring } = useTransfer(symbol);
    const e8s = balance?.e8s;

    const form = useForm<{ amount: string; principal: string }>({
        resolver: zodResolver(getFormSchema(e8s ?? '0', fee ?? '0', decimals ?? 8, symbol)),
    });

    const [isAddFunds, setIsAddFunds] = useState<boolean>(true);

    const [depositOpen, setDepositOpen] = useState<boolean>(false);

    const loginInWithEmail = connectedIdentity?.connectType === 'email';

    return (
        <SideBarWrapper
            open={isUserSidebarOpen}
            onClose={() => {
                toggleIsUserSidebarIdOpen();

                form.reset(undefined, { keepDefaultValues: true });
                form.setValue('amount', '');
                form.setValue('principal', '');
            }}
        >
            <div className="flex h-full flex-col items-center justify-center p-[30px]">
                <div className="mb-[10px] flex w-full items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center overflow-hidden">
                            {!loadingProfile ? (
                                <img
                                    className="h-[50px] w-[50px] rounded-[50%] bg-white"
                                    src={identityProfile?.avatar}
                                    alt=""
                                />
                            ) : (
                                <div className="flex h-[50px] w-[50px] items-center justify-center rounded-[50%] border border-white">
                                    <LoadingOutlined className="text-white" />
                                </div>
                            )}
                            <div className="ml-[14px] flex h-[50px] flex-col items-start justify-between ">
                                <div className="flex">
                                    {' '}
                                    {identityProfile ? (
                                        <div className="max-w-[200px] font-inter-bold text-[18px]  leading-tight text-[#fff]">
                                            {shrinkPrincipal(
                                                identityProfile?.username ??
                                                    connectedIdentity?.principal ??
                                                    '',
                                            )}
                                        </div>
                                    ) : (
                                        <SkeletonTW className="!h-[20px] !w-[110px]" />
                                    )}
                                </div>
                                <Credit
                                    account={connectedIdentity?.account || ''}
                                    hasLabel={false}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-x-[15px]">
                        {connectedIdentity ? (
                            <Link
                                to="/profile/settings"
                                onClick={() => {
                                    toggleIsUserSidebarIdOpen();
                                }}
                            >
                                <img
                                    className="h-[24px] w-[24px] cursor-pointer  rounded-full hover:border-black"
                                    src={'/img/sidebar/setting.svg'}
                                ></img>
                            </Link>
                        ) : (
                            <SkeletonTW className="!h-[24px] !w-[24px]" />
                        )}
                        {connectedIdentity ? (
                            <img
                                className="h-[24px] w-[24px] cursor-pointer rounded-full  hover:border-black"
                                src={'/img/sidebar/logout.svg'}
                                onClick={() => {
                                    writeLastConnectType('');
                                    writeLastConnectEmail('');
                                    resetUnityUserToken();
                                    resetProfilePermissions();
                                    toggleIsUserSidebarIdOpen();
                                    navigate('/');
                                    connectedIdentity.connectType === 'email'
                                        ? setConnectedIdentity(undefined)
                                        : disconnect();
                                }}
                            ></img>
                        ) : (
                            <SkeletonTW className="!h-[24px] !w-[24px]" />
                        )}
                    </div>
                </div>

                <div
                    className={cn(
                        'flex w-full items-center justify-between',
                        loginInWithEmail && 'hidden',
                    )}
                >
                    <div
                        className="relative flex h-5 shrink-0 cursor-pointer items-center text-sm leading-4 "
                        onMouseLeave={() => setCopied(false)}
                    >
                        <div className="peer text-[12px] leading-tight">
                            <span className="font-inter-medium  text-white/70">Principal ID:</span>
                            <CopyToClipboard text={principal} onCopy={() => setCopied(true)}>
                                <Tooltip
                                    title={copied ? 'Copied' : 'Copy'}
                                    overlayInnerStyle={{ width: '80px', textAlign: 'center' }}
                                    placement="bottom"
                                    className="pl-[3px] text-left font-inter-semibold text-white"
                                >
                                    {shrinkPrincipal(principal)}
                                </Tooltip>
                            </CopyToClipboard>
                        </div>
                    </div>
                    <div className="h-[16px] w-[2px] bg-[#f6f6f6]"></div>
                    <div
                        className="relative flex h-5 shrink-0 cursor-pointer items-center text-sm"
                        onMouseLeave={() => setCopied(false)}
                    >
                        <div className="peer relative flex h-full items-center text-[12px] leading-tight text-white/60">
                            <span className="font-inter-medium text-white/70">Account ID:</span>
                            <CopyToClipboard text={account} onCopy={() => setCopied(true)}>
                                <Tooltip
                                    title={copied ? 'Copied' : 'Copy'}
                                    placement="bottom"
                                    overlayInnerStyle={{ width: '80px', textAlign: 'center' }}
                                    className="pl-[3px] text-left font-inter-semibold text-white"
                                >
                                    {shrinkAccount(account)}
                                </Tooltip>
                            </CopyToClipboard>
                        </div>
                    </div>
                </div>
                <div className="mt-[40px] flex w-full flex-col items-center justify-between">
                    <Link
                        className="flex w-full justify-between"
                        to={`/profile/settings`}
                        onClick={toggleIsUserSidebarIdOpen}
                    >
                        <div className="font-inter-semibold text-[18px] text-white">Profile</div>

                        <img src="/img/sidebar/right-arrow.svg" className="cursor-pointer" alt="" />
                    </Link>
                    <Link
                        to={`/profile/${principal}/collected`}
                        onClick={toggleIsUserSidebarIdOpen}
                        className={cn(
                            'mt-[30px] flex w-full justify-between',
                            loginInWithEmail && 'hidden',
                        )}
                    >
                        <div className="font-inter-semibold text-[18px] text-white">My Assets</div>

                        <img src="/img/sidebar/right-arrow.svg" className="cursor-pointer" alt="" />
                    </Link>
                </div>

                <div className="relative mt-[40px] flex w-full flex-1 flex-col items-center justify-between ">
                    <div className="flex w-full items-center justify-between">
                        <div className="font-inter-semibold text-[18px] text-white">My Wallet</div>
                    </div>
                    {loginInWithEmail && !connectedIdentity.principal ? (
                        <div className="flex h-[400px] w-[415px] flex-col items-center justify-center">
                            <div className="w-80 text-center font-inter-medium text-sm leading-tight text-white text-opacity-75">
                                System will generate one and hold it securely under your account
                            </div>
                            <YukuButton
                                type={'CONFIRM'}
                                className="mt-5 w-fit"
                                onClick={() => {
                                    setGenerationOpen(true);
                                }}
                            >
                                {'Generate'}
                            </YukuButton>
                        </div>
                    ) : (
                        <div className="relative mt-[22px] flex w-full flex-1 flex-col justify-start rounded-[8px] border border-[#283047] p-[20px]">
                            <DepositModal
                                open={depositOpen}
                                setOpen={setDepositOpen}
                                principal={connectedIdentity?.principal}
                                account={connectedIdentity?.account}
                                symbol={symbol}
                            />
                            <div className="flex h-fit w-full cursor-pointer items-end gap-x-[40px] border-b border-[#283047] pb-[20px]">
                                <div
                                    className="relative flex items-center gap-x-[14px]"
                                    onClick={() => {
                                        if (symbol === 'ICP') {
                                            return;
                                        }
                                        !transferring && setSymbol('ICP');

                                        form.reset(undefined, { keepDefaultValues: true });
                                        form.setValue('amount', '');
                                        form.setValue('principal', '');
                                    }}
                                >
                                    <IconLogoLedgerIcp className="h-[22px] w-[22px]" />
                                    <div className="font-inter-semibold text-[16px] leading-[18px] text-white">
                                        ICP
                                    </div>
                                    {symbol === 'ICP' && (
                                        <div className="absolute -bottom-[20px] left-0 right-0 h-[4px] rounded-[2px] bg-[#36F]"></div>
                                    )}
                                </div>

                                {!loginInWithEmail && (
                                    <div
                                        className="relative flex items-center gap-x-[14px]"
                                        onClick={() => {
                                            if (symbol === 'OGY') {
                                                return;
                                            }
                                            !transferring && setSymbol('OGY');

                                            form.reset(undefined, { keepDefaultValues: true });
                                            form.setValue('amount', '');
                                            form.setValue('principal', '');
                                        }}
                                    >
                                        <IconLogoLedgerOgy className="h-[18px] w-[18px]" />
                                        <div className="font-inter-semibold text-[16px] leading-[18px] text-white">
                                            OGY
                                        </div>
                                        {symbol === 'OGY' && (
                                            <div className="absolute -bottom-[20px] left-0 right-0 h-[4px] rounded-[2px] bg-[#36F]"></div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="flex w-full flex-col gap-y-[15px]">
                                <div className="mt-[15px] flex justify-between">
                                    <Button
                                        onClick={() => {
                                            setDepositOpen(true);
                                        }}
                                        className="h-fit rounded-[6px] bg-[#36F] px-[8px] py-[7px] font-inter-semibold text-[14px] leading-[14px] hover:bg-[#36F]/60"
                                    >
                                        Deposit
                                    </Button>
                                    <div className="flex items-center gap-x-[10px] font-inter-semibold text-[12px] leading-tight text-[#666666] ">
                                        <div className="font-normal text-white/60">Balance:</div>
                                        <div className="flex items-end space-x-1 font-inter-bold text-[22px]">
                                            {e8s ? (
                                                <TokenPrice
                                                    className="font-inter-bold text-[14px] leading-tight text-white md:text-[14px]"
                                                    value={{
                                                        value: e8s,
                                                        decimals: {
                                                            type: 'exponent',
                                                            value: decimals,
                                                        },
                                                        scale: 4,
                                                        paddingEnd: 4,
                                                        thousand: {
                                                            comma: true,
                                                            commaFunc: thousandCommaOnlyInteger,
                                                        },
                                                    }}
                                                />
                                            ) : (
                                                <SkeletonTW className="!h-[16px] !w-[70px]" />
                                            )}

                                            <span className="text-[14px] font-normal text-white/60">
                                                {symbol}
                                            </span>
                                        </div>
                                        <YukuIcon
                                            name="action-refresh"
                                            color="#8D8D8D"
                                            className={cn(
                                                'cursor-pointer',
                                                balanceLoading && 'animate-spin',
                                            )}
                                            onClick={reloadBalance}
                                        />
                                    </div>
                                </div>
                                <TransferForm symbol={symbol}></TransferForm>
                                <div className="relative flex">
                                    <Button
                                        onClick={() => {
                                            toggleAddFundsOpen();
                                        }}
                                        className="flex w-full items-center justify-center rounded-[8px] bg-[#283047] py-[13px] font-inter-bold text-[14px] text-white hover:bg-[#283047]/60"
                                    >
                                        {isAddFunds ? 'Add Funds' : 'Sell'}
                                    </Button>
                                    <div
                                        onClick={() => {
                                            setIsAddFunds((prev) => !prev);
                                        }}
                                        className={cn(
                                            'absolute right-0 top-0 flex h-full w-[40px] cursor-pointer rounded-r-[8px] border-l border-[#FFFFFF99] hover:bg-[#333]',
                                            !isAddFunds &&
                                                'left-0 rounded-none rounded-l-[8px] border-r',
                                        )}
                                    >
                                        <img
                                            src="/img/sidebar/add-funds-icon.svg"
                                            className="m-auto h-[20px] w-[20px]"
                                            alt=""
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-center gap-x-[25.5px]">
                                    <img src="/img/sidebar/pay-mastercard.svg" alt="" />
                                    <img src="/img/sidebar/pay-visa.svg" alt="" />
                                    <img src="/img/sidebar/pay-apple.svg" alt="" />
                                    <img src="/img/sidebar/pay-google.svg" alt="" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </SideBarWrapper>
    );
}
