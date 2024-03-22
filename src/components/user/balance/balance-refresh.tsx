import { useEffect, useState } from 'react';
import { shallow } from 'zustand/shallow';
import YukuIcon from '@/components/ui/yuku-icon';
import { getTokenDecimals } from '@/utils/canisters/ledgers/special';
import { cn } from '@/common/cn';
import { thousandCommaOnlyInteger } from '@/common/data/numbers';
import { useIdentityStore } from '@/stores/identity';
import { SupportedLedgerTokenSymbol } from '@/types/canisters/ledgers';
import TokenPrice from '../../data/price';
import message from '../../message';
import SkeletonTW from '../../ui/skeleton';

export default function BalanceRefresh({ symbol }: { symbol?: SupportedLedgerTokenSymbol }) {
    const { connectedIdentity, reloadIcpBalance, reloadOgyBalance, e8sOgy, e8sIcp } =
        useIdentityStore(
            (s) => ({
                connectedIdentity: s.connectedIdentity,
                reloadIcpBalance: s.reloadIcpBalance,
                reloadOgyBalance: s.reloadOgyBalance,
                e8sIcp: s.icpBalance?.e8s,
                e8sOgy: s.ogyBalance?.e8s,
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
        reloadBalance();
    }, []);

    const e8s = symbol === 'OGY' ? e8sOgy : e8sIcp;

    return (
        <div className="flex items-center gap-x-[10px] font-inter-semibold text-[12px] leading-tight text-white/60 ">
            <div>Balance:</div>
            {symbol ? (
                <div className="flex items-end space-x-1 font-inter-bold text-[22px]">
                    {e8s ? (
                        <TokenPrice
                            className="font-inter-bold text-[14px] leading-tight  md:text-[14px]"
                            value={{
                                value: e8s,
                                decimals: { type: 'exponent', value: getTokenDecimals(symbol) },
                                scale: 2,
                                paddingEnd: 2,
                                thousand: {
                                    comma: true,
                                    commaFunc: thousandCommaOnlyInteger,
                                },
                            }}
                        />
                    ) : (
                        <SkeletonTW className="!h-[16px] !w-[70px]" />
                    )}
                    <span className="font-inter-bold text-[14px]">{symbol}</span>
                </div>
            ) : (
                <div className="flex gap-x-[10px]">
                    {' '}
                    <div className="flex items-end space-x-1 font-inter-bold text-[22px]">
                        {e8sIcp ? (
                            <TokenPrice
                                className="font-inter-bold text-[14px] leading-tight  md:text-[14px]"
                                value={{
                                    value: e8sIcp,
                                    decimals: { type: 'exponent', value: getTokenDecimals('ICP') },
                                    scale: 2,
                                    paddingEnd: 2,
                                    thousand: {
                                        comma: true,
                                        commaFunc: thousandCommaOnlyInteger,
                                    },
                                }}
                            />
                        ) : (
                            <SkeletonTW className="!h-[16px] !w-[70px]" />
                        )}
                        <span className="font-inter-bold text-[14px]">ICP</span>
                    </div>
                    <div className="flex items-end space-x-1 font-inter-bold text-[22px]">
                        {e8sOgy ? (
                            <TokenPrice
                                className="font-inter-bold text-[14px] leading-tight  md:text-[14px]"
                                value={{
                                    value: e8sOgy,
                                    decimals: { type: 'exponent', value: getTokenDecimals('OGY') },
                                    scale: 2,
                                    paddingEnd: 2,
                                    thousand: {
                                        comma: true,
                                        commaFunc: thousandCommaOnlyInteger,
                                    },
                                }}
                            />
                        ) : (
                            <SkeletonTW className="!h-[16px] !w-[70px]" />
                        )}
                        <span className="font-inter-bold text-[14px]">OGY</span>
                    </div>
                </div>
            )}
            <YukuIcon
                name="action-refresh"
                color="#999999"
                className={cn('cursor-pointer', balanceLoading && 'animate-spin')}
                onClick={reloadBalance}
            />
        </div>
    );
}
