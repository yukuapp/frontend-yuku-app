import { useCallback, useEffect, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { isMobile } from 'react-device-detect';
import { useForm } from 'react-hook-form';
import { EyeInvisibleOutlined, EyeOutlined, LoadingOutlined } from '@ant-design/icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { shallow } from 'zustand/shallow';
import ShowNumber from '@/components/data/number';
import TokenPrice from '@/components/data/price';
import { IconLogoLedgerIcp, IconLogoLedgerOgy } from '@/components/icons';
import message from '@/components/message';
import { Button, YukuButton } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import SkeletonTW from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTokenRate } from '@/hooks/interval/token_rate';
import { useTransfer } from '@/hooks/ledger/transfer';
import { getEscrowICPTransferFee, sendActionEmailCode, sendEscrowICP } from '@/utils/apis/yuku/api';
import {
    getLedgerIcpCanisterId,
    getLedgerIcpDecimals,
    getLedgerOgyDecimals,
    getTokenDecimals,
} from '@/utils/canisters/ledgers/special';
import { cn } from '@/common/cn';
import { exponentNumber, isValidNumber, thousandCommaOnlyInteger } from '@/common/data/numbers';
import { shrinkAccount, shrinkPrincipal } from '@/common/data/text';
import { isAccountHex, principal2account } from '@/common/ic/account';
import { isPrincipalText } from '@/common/ic/principals';
import { justPreventLink } from '@/common/react/link';
import { bigint2string } from '@/common/types/bigint';
import { useAppStore } from '@/stores/app';
import { useIdentityStore } from '@/stores/identity';
import { SupportedLedgerTokenSymbol } from '@/types/canisters/ledgers';

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
        code: z.string().length(6, { message: 'Please input 6 letters' }),
    });
};
export const getPrincipalFormSchema = (
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
export default function Wallet() {
    const { identity, icpBalance, ogyBalance, reloadIcpBalance } = useIdentityStore(
        (s) => ({
            identity: s.connectedIdentity,
            reloadIcpBalance: s.reloadIcpBalance,
            icpBalance: s.icpBalance,
            ogyBalance: s.ogyBalance,
        }),
        shallow,
    );
    const loginWithEmail = identity?.connectType === 'email';
    const [showBalance, setShowBalance] = useState<boolean>(true);

    const [balanceLoading, setBalanceLoading] = useState(false);

    const reloadBalance = () => {
        if (identity === undefined) return;
        if (balanceLoading) return;
        setBalanceLoading(true);
        Promise.all([reloadIcpBalance()])
            .catch((e) => message.error(`${e}`))
            .finally(() => setBalanceLoading(false));
    };

    useEffect(() => {
        identity && reloadBalance();
    }, [identity]);

    const tabs: { value: SupportedLedgerTokenSymbol; label: string }[] = [
        { value: 'ICP', label: 'ICP' },
        { value: 'OGY', label: 'OGY' },
    ];
    const [tab, setTab] = useState<SupportedLedgerTokenSymbol>('ICP');

    const e8s = (tab === 'ICP' ? icpBalance?.e8s : ogyBalance?.e8s) || '0';
    const decimals = tab === 'OGY' ? getLedgerOgyDecimals() : getLedgerIcpDecimals();
    const { icp_usd, ogy_usd } = useTokenRate();
    const usd = tab === 'ICP' ? icp_usd : tab === 'OGY' ? ogy_usd : '0';
    const total_icp_usd = Number(exponentNumber(`${e8s}`, -decimals)) * Number(usd);
    const onTabChange = (value: string) => {
        setTab(value as SupportedLedgerTokenSymbol);
    };
    const setGenerationOpen = useAppStore((s) => s.setGenerationOpen);
    return (
        <>
            {loginWithEmail && !identity.principal ? (
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
                <div className="mt-[15px] flex h-fit w-full flex-col items-center justify-center rounded-[8px] text-white">
                    <Tabs defaultValue="ICP" onValueChange={onTabChange} className="w-full">
                        <TabsList className="flex w-full justify-start gap-x-[30px] rounded-none  border-b border-[#2A3043] bg-transparent">
                            {tabs.map((t) => (
                                <TabsTrigger
                                    className={cn(
                                        'box-border rounded-none border-b-[3px] border-transparent px-0 font-inter-semibold text-lg text-white/60 data-[state=active]:border-shiku data-[state=active]:bg-transparent data-[state=active]:bg-none  data-[state=active]:text-white',
                                        loginWithEmail && t.value === 'OGY' && 'hidden',
                                    )}
                                    value={t.value}
                                    key={t.value}
                                >
                                    <div className="relative flex items-center gap-x-[14px]">
                                        {t.value === 'ICP' && (
                                            <IconLogoLedgerIcp className="h-[22px] w-[22px]" />
                                        )}
                                        {t.value === 'OGY' && (
                                            <IconLogoLedgerOgy className="h-[22px] w-[22px]" />
                                        )}
                                        <div className="font-inter-semibold text-[16px] leading-[18px] text-white">
                                            {t.label}
                                        </div>
                                    </div>
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                    <div className="mt-[30px] w-full self-start">
                        {' '}
                        <div className="flex items-center justify-start gap-x-1">
                            <div className=" font-inter-semibold text-lg text-white/60">
                                Balance
                            </div>
                            {showBalance ? (
                                <EyeOutlined
                                    onClick={() => {
                                        setShowBalance(false);
                                    }}
                                ></EyeOutlined>
                            ) : (
                                <EyeInvisibleOutlined
                                    onClick={() => {
                                        setShowBalance(true);
                                    }}
                                ></EyeInvisibleOutlined>
                            )}
                        </div>
                        <div
                            className={cn(
                                '!md:text-[28px]  mt-5 flex items-center gap-x-[13px] font-inter-semibold !text-[28px] leading-tight text-white',
                                isMobile && '!text-[20px]',
                            )}
                        >
                            <div className="flex items-center gap-x-[10px]">
                                {e8s ? (
                                    !showBalance ? (
                                        <div className="leading-[10px]">*****</div>
                                    ) : (
                                        <TokenPrice
                                            className={cn(
                                                'font-inter-semibold text-[28px] leading-tight text-white md:text-[28px]',
                                                isMobile && 'text-[20px]',
                                            )}
                                            value={{
                                                value: e8s,
                                                decimals: {
                                                    type: 'exponent',
                                                    value: getLedgerIcpDecimals(),
                                                },
                                                scale: 4,
                                                paddingEnd: 2,
                                                thousand: {
                                                    comma: true,
                                                    commaFunc: thousandCommaOnlyInteger,
                                                },
                                            }}
                                        />
                                    )
                                ) : (
                                    <SkeletonTW className="!h-[16px] !w-[70px]" />
                                )}
                                <div className="text-white/60">ICP</div>
                            </div>

                            <div className="flex items-center">
                                <img src="/img/login/aet.svg" className="mr-[13px]" alt="" />$
                                {showBalance ? (
                                    <ShowNumber
                                        className={cn(
                                            'ml-[6px] text-[28px]',
                                            isMobile && 'text-[20px]',
                                        )}
                                        value={{
                                            value: `${total_icp_usd}`,
                                            scale: 2,
                                            thousand: { symbol: ['M', 'K'] },
                                        }}
                                    />
                                ) : (
                                    <div className="ml-[6px] leading-[10px]">*****</div>
                                )}
                            </div>
                        </div>
                        <div className="my-3 flex">
                            <div className="flex items-center">
                                <p
                                    className={cn(
                                        'mr-2 font-inter-medium text-[14px] font-normal leading-[30px] text-white/60 md:text-[15px]',
                                        isMobile && 'text-[12px]',
                                    )}
                                >
                                    {'Principal ID:'}
                                </p>
                                <div className="flex items-center">
                                    <p className="font-['Inter'] text-[14px] font-normal leading-[30px] text-white md:text-[15px]">
                                        {shrinkPrincipal(identity?.principal)}
                                    </p>
                                    <CopyToClipboard
                                        text={identity?.principal}
                                        onCopy={() => {
                                            message.success('Copied');
                                        }}
                                    >
                                        <img
                                            src={'/img/profile/copy.svg'}
                                            className="ml-2.5 cursor-pointer"
                                        />
                                    </CopyToClipboard>
                                </div>
                            </div>
                            <div className="ml-[15px] flex items-center md:ml-[30px]">
                                <p
                                    className={cn(
                                        'mr-2 font-inter-medium text-[14px] font-normal leading-[30px] text-white/60 md:text-[15px]',
                                        isMobile && 'text-[12px]',
                                    )}
                                >
                                    {'Account ID'}
                                </p>
                                <div className="flex items-center">
                                    <p className="font-['Inter'] text-[14px] font-normal leading-[30px] text-white md:text-[15px]">
                                        {shrinkAccount(identity?.account)}
                                    </p>
                                    <CopyToClipboard
                                        text={identity?.account}
                                        onCopy={() => {
                                            message.success('Copied');
                                        }}
                                    >
                                        <img
                                            src={'/img/profile/copy.svg'}
                                            className="ml-2.5 cursor-pointer"
                                        />
                                    </CopyToClipboard>
                                </div>
                            </div>
                        </div>
                        <TransferForm symbol={tab}></TransferForm>
                    </div>
                </div>
            )}
        </>
    );
}
const ACTION = 'SEND_ICP';

export const TransferFormEmail = () => {
    const { identity, reloadIcpBalance } = useIdentityStore(
        (s) => ({
            identity: s.connectedIdentity,
            reloadIcpBalance: s.reloadIcpBalance,
        }),
        shallow,
    );
    // token
    const getYukuToken = useIdentityStore((s) => s.getYukuToken);
    const token = identity && getYukuToken();
    const icpBalance = useIdentityStore((s) => s.icpBalance);

    const [emailTransferring, setEmailTransferring] = useState(false);
    const [sendingCode, setSendingCode] = useState(false);
    const [fee, setFee] = useState<string>('0');
    const e8s = icpBalance?.e8s;
    const email_form = useForm<{ amount: string; principal: string; code: string }>({
        resolver: zodResolver(getFormSchema(e8s ?? '0', fee, getLedgerIcpDecimals(), 'ICP')),
    });

    useEffect(() => {
        getEscrowICPTransferFee({ canister_id: getLedgerIcpCanisterId() })
            .then((r) => {
                setFee(r ?? '0');
            })
            .catch(() => {
                message.error('Get ICP fee failed');
            });
    }, [identity]);

    const isEmailLogin = identity?.connectType === 'email';

    const [seconds, setSeconds] = useState(0);
    useEffect(() => {
        if (seconds === 0) return;

        const intervalId = setInterval(() => {
            setSeconds((seconds) => seconds - 1);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [seconds]);
    const onSendCode = async (e) => {
        justPreventLink(e);
        if (sendingCode || !token || seconds) {
            return;
        }
        try {
            setSendingCode(true);

            await sendActionEmailCode({
                action: ACTION,
                email: isEmailLogin ? identity.main_email : '',
                user_id: token?.user_id,
                user_token: token?.user_token,
                hash: isEmailLogin ? identity?.hash ?? '' : '',
            });
        } catch (error) {
            message.error(`${error}`);
        } finally {
            setSeconds(60);
            setSendingCode(false);
        }
    };

    const [balanceLoading, setBalanceLoading] = useState(false);

    const reloadBalance = () => {
        if (identity === undefined) return;
        if (balanceLoading) return;
        setBalanceLoading(true);
        Promise.all([reloadIcpBalance()])
            .catch((e) => message.error(`${e}`))
            .finally(() => setBalanceLoading(false));
    };

    useEffect(() => {
        identity && reloadBalance();
    }, [identity]);

    const onEmailTransferSubmit = useCallback(
        async (data: { amount: string; principal: string }) => {
            if (emailTransferring || !isEmailLogin || !token || !Number(fee)) {
                return;
            }
            const { principal } = data;
            const amount = exponentNumber(data.amount, getLedgerIcpDecimals());
            try {
                setEmailTransferring(true);
                const h = await sendEscrowICP({
                    to: isPrincipalText(principal) ? principal2account(principal) : principal,
                    amount,
                    action: ACTION,
                    canister_id: getLedgerIcpCanisterId(),
                    code: email_form.getValues('code'),
                    email: isEmailLogin ? identity.main_email : '',
                    fee,
                    user_id: token.user_id,
                    user_token: token.user_token,
                    hash: isEmailLogin ? identity?.hash ?? '' : '',
                });
                if (h) {
                    message.success(`Transfer Succeeded.`);
                    email_form.reset({
                        amount: '',
                        principal: '',
                        code: '',
                    });
                    setSeconds(0);
                }
                reloadBalance();
            } catch (error) {
                message.error(`${error}`);
            } finally {
                setEmailTransferring(false);
            }
        },
        [sendEscrowICP, emailTransferring, token, fee],
    );

    const setMax = useCallback(() => {
        const max = Number(
            exponentNumber(
                bigint2string(BigInt(e8s ?? '0') - BigInt(fee)),
                -getLedgerIcpDecimals(),
            ),
        );
        email_form.setValue('amount', max > 0 ? max.toString() : '0');
        email_form.trigger();
    }, [fee, e8s, isEmailLogin]);

    return (
        <Form {...email_form} key={'EMAIL_FORM_SETTING'}>
            <form
                onSubmit={email_form.handleSubmit(onEmailTransferSubmit)}
                className="flex flex-col gap-y-[24px]"
            >
                <FormField
                    control={email_form.control}
                    name="principal"
                    render={({ field }) => (
                        <FormItem>
                            <span className="flex items-center justify-between">
                                <FormControl className="">
                                    <Input
                                        className="h-[42px] rounded-[8px] border-[#283047] !bg-[#1F2432] bg-transparent px-[11px] py-[4px] font-inter-medium text-[14px] text-white placeholder:text-white/50  focus-visible:ring-white "
                                        placeholder={'Principal ID or Account ID'}
                                        {...field}
                                    />
                                </FormControl>
                            </span>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={email_form.control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem>
                            <span className="flex h-[42px] items-center justify-between">
                                <FormControl className="w-full">
                                    <Input
                                        placeholder="Amount"
                                        className="placeholder:text-text-white/50 rounded-[8px] rounded-r-none border-r-0 border-[#283047] !bg-[#1F2432] bg-transparent px-[11px] py-[4px] font-inter-medium text-[14px] text-white  focus-visible:ring-white "
                                        {...field}
                                        defaultValue={''}
                                    />
                                </FormControl>
                                <div className="flex h-[40px] items-center rounded-[8px] rounded-l-none border border-l-0 border-[#283047] !bg-[#1F2432] font-inter-medium text-[14px]">
                                    <div className="px-[8px] text-white">{'ICP'}</div>
                                    <div className="h-full w-[1px] bg-[#283047]"></div>
                                    <div
                                        className="cursor-pointer px-[8px] text-[#36F]"
                                        onClick={setMax}
                                    >
                                        Max
                                    </div>
                                </div>
                            </span>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={email_form.control}
                    name="code"
                    render={({ field }) => (
                        <FormItem className="relative">
                            {/* <FormLabel>Username</FormLabel> */}
                            <FormControl>
                                <Input
                                    placeholder="Verification Code"
                                    className="border-[#3C3C3C] bg-[#1F2432] text-white"
                                    {...field}
                                />
                            </FormControl>

                            <YukuButton
                                type={'CONFIRM'}
                                onClick={onSendCode}
                                className="absolute right-0 top-0 !mt-0 h-full w-16 rounded-none rounded-r-[4px] bg-transparent font-inter-medium !text-shiku hover:bg-transparent"
                            >
                                {sendingCode ? (
                                    <LoadingOutlined className="ml-[7px]"></LoadingOutlined>
                                ) : seconds ? (
                                    `${seconds}s`
                                ) : (
                                    'Send'
                                )}
                            </YukuButton>
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    className={cn(
                        'mt-[5px] flex w-full items-center justify-center rounded-[8px] bg-[#36F] py-[13px] font-inter-bold text-[14px] font-bold text-white hover:bg-[#36F]',
                        (emailTransferring || !email_form.formState.isValid) &&
                            'cursor-not-allowed opacity-40',
                    )}
                >
                    Transfer
                    {!!emailTransferring && (
                        <LoadingOutlined className="ml-[10px]"></LoadingOutlined>
                    )}
                </Button>
            </form>
        </Form>
    );
};

export const TransferFormPrincipal = ({ symbol }: { symbol: SupportedLedgerTokenSymbol }) => {
    const { connectedIdentity, reloadIcpBalance, reloadOgyBalance, isUserSidebarOpen } =
        useIdentityStore(
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

    const { balance, fee, decimals, transfer, transferring } = useTransfer(symbol);
    const e8s = balance?.e8s;

    const form = useForm<{ amount: string; principal: string }>({
        resolver: zodResolver(
            getPrincipalFormSchema(e8s ?? '0', fee ?? '0', decimals ?? 8, symbol),
        ),
    });

    const onSubmit = useCallback(
        (data: { amount: string; principal: string }) => {
            if (transferring) {
                return;
            }
            const { principal } = data;
            const amount = exponentNumber(data.amount, getTokenDecimals(symbol));
            transfer({
                to: isPrincipalText(principal) ? principal2account(principal) : principal,
                amount,
            })
                .then((height) => {
                    if (height) {
                        message.success(`Transfer Succeeded.`);
                        form.reset({
                            amount: '',
                            principal: '',
                        });
                    }
                })
                .catch((e) => message.error(`${e}`));
        },
        [symbol, transfer],
    );

    const setMax = useCallback(() => {
        const max = Number(
            exponentNumber(bigint2string(BigInt(e8s ?? '0') - BigInt(fee)), -decimals),
        );
        form.setValue('amount', max > 0 ? max.toString() : '0');
        form.trigger();
    }, [symbol, fee, e8s, decimals]);

    return (
        <Form {...form} key={'PRINCIPAL_FORM_SIDEBAR'}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="">
                <FormField
                    control={form.control}
                    name="principal"
                    render={({ field }) => (
                        <FormItem>
                            <span className="flex items-center justify-between">
                                <FormControl className="">
                                    <Input
                                        className="h-[42px] rounded-[8px] border-[#283047] bg-transparent px-[11px] py-[4px] font-inter-medium text-[14px] text-white placeholder:text-white/50  focus-visible:ring-white "
                                        placeholder={'Principal ID or Account ID'}
                                        {...field}
                                    />
                                </FormControl>
                            </span>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem>
                            <span className="mt-[20px] flex h-[42px] items-center justify-between">
                                <FormControl className="w-full">
                                    <Input
                                        placeholder="Amount"
                                        className="placeholder:text-text-white/50 rounded-[8px] rounded-r-none border-r-0 border-[#283047] bg-transparent px-[11px] py-[4px] font-inter-medium text-[14px] text-white  focus-visible:ring-white "
                                        {...field}
                                        defaultValue={''}
                                    />
                                </FormControl>
                                <div className="flex h-[40px] items-center rounded-[8px] rounded-l-none border border-l-0 border-[#283047] font-inter-medium text-[14px]">
                                    <div className="px-[8px] text-white">{symbol}</div>
                                    <div className="h-full w-[1px] bg-[#283047]"></div>
                                    <div
                                        className="cursor-pointer px-[8px] text-[#36F]"
                                        onClick={setMax}
                                    >
                                        Max
                                    </div>
                                </div>
                            </span>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    className={cn(
                        'mt-[20px] flex w-full items-center justify-center rounded-[8px] bg-[#36F] py-[13px] font-inter-bold text-[14px] font-bold text-white hover:bg-[#36F]',
                        (transferring || !form.formState.isValid) &&
                            'cursor-not-allowed opacity-40',
                    )}
                >
                    Transfer
                    {!!transferring && <LoadingOutlined className="ml-[10px]"></LoadingOutlined>}
                </Button>
            </form>
        </Form>
    );
};

export const TransferForm = ({ symbol }: { symbol: SupportedLedgerTokenSymbol }) => {
    const identity = useIdentityStore((s) => s.connectedIdentity);
    if (identity?.connectType === 'email') {
        return <TransferFormEmail></TransferFormEmail>;
    } else {
        return <TransferFormPrincipal symbol={symbol}></TransferFormPrincipal>;
    }
};
