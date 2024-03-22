import { useEffect, useState } from 'react';
import { formatUnits } from 'viem';
import message from '@/components/message';
import Tooltip from '@/components/ui/tooltip';
import { queryCreditPointsByAccount } from '@/utils/canisters/yuku-old/credit_points';
import { string2bigint } from '@/common/types/bigint';
import { useIdentityStore } from '@/stores/identity';
import { LedgerTokenBalance } from '@/types/canisters/ledgers';

function Credit({
    account,
    className,
    hasLabel = true,
}: {
    account: string;
    className?: string;
    hasLabel?: boolean;
}) {
    const [creditPointsLoading, setCreditPointsLoading] = useState(false);
    const [creditPoints, setCreditPoints] = useState<LedgerTokenBalance | undefined>(undefined);

    const connectedIdentity = useIdentityStore((s) => s.connectedIdentity);
    const self = account === connectedIdentity?.account;
    const selfCreditPoints = useIdentityStore((s) => s.creditPoints);
    const reloadSelfCreditPoints = useIdentityStore((s) => s.reloadCreditPoints);

    // const deviceInfo = useDeviceStore((s) => s.deviceInfo);

    useEffect(() => {
        setCreditPointsLoading(true);
        (async (): Promise<LedgerTokenBalance> => {
            if (self && selfCreditPoints !== undefined) return selfCreditPoints;
            return await queryCreditPointsByAccount(account);
        })()
            .then(
                (creditPoints) => {
                    if (self && creditPoints !== selfCreditPoints) reloadSelfCreditPoints();
                    setCreditPoints(creditPoints);
                },
                (e) => message.error(`fetch credit points info failed: ${e.message}`),
            )
            .finally(() => setCreditPointsLoading(false));
    }, [account]);

    return (
        <div className={className}>
            {hasLabel && (
                <div className="whitespace-nowrap font-inter-bold text-[10px] leading-4 text-white md:text-[14px]">
                    Yuku Credit:
                </div>
            )}
            <div className="flex items-center justify-center gap-x-[9px]">
                <img
                    className="h-[12px] w-[12px] md:h-[16px] md:w-[16px]"
                    src={'/img/sidebar/diamond.svg'}
                ></img>
                <div className="font-inter-bold text-[12px] leading-tight text-white md:text-[16px]">
                    {!creditPointsLoading && creditPoints
                        ? Number(formatUnits(string2bigint(creditPoints.e8s), 8)).toFixed(2)
                        : '--'}
                </div>

                <Tooltip
                    title={
                        <span className="whitespace-pre-wrap text-[12px] leading-tight">
                            We reward you as our loyal customers. Yuku credit provides you
                            opportunities for airdrop, and access to exclusive events and
                            activities.
                        </span>
                    }
                >
                    <img
                        className="h-[12px] w-[12px] cursor-pointer md:h-[16px] md:w-[16px]"
                        src={'/img/sidebar/tooltip-credit.svg'}
                    ></img>
                </Tooltip>
            </div>
        </div>
    );
}

export default Credit;
