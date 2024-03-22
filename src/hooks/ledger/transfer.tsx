import { useCallback, useState } from 'react';
import { icpTransfer } from '@/utils/canisters/ledgers/icp';
import { ogyTransfer } from '@/utils/canisters/ledgers/ogy';
import {
    getLedgerIcpDecimals,
    getLedgerIcpFee,
    getLedgerOgyDecimals,
    getLedgerOgyFee,
} from '@/utils/canisters/ledgers/special';
import { useIdentityStore } from '@/stores/identity';
import { LedgerTokenBalance, SupportedLedgerTokenSymbol } from '@/types/canisters/ledgers';
import { useCheckIdentity } from '../common/identity';
import { useMessage } from '../common/message';

export type LedgerTransferExecutor = (args: {
    to: string; // account_hex
    from_subaccount?: number[];
    amount: string;
    memo?: string;
}) => Promise<string>;

type LedgerTransferReturn = {
    balance?: LedgerTokenBalance;
    fee: string;
    decimals: number;
    transfer: LedgerTransferExecutor;
    transferring: number;
};

export const useTransferByICP = (multi: boolean = false): LedgerTransferReturn => {
    const message = useMessage();

    const checkIdentity = useCheckIdentity();

    const balance = useIdentityStore((s) => s.icpBalance);
    const reload = useIdentityStore((s) => s.reloadIcpBalance);

    const [transferring, setTransferring] = useState<number>(0);

    const transfer = useCallback(
        async (args: {
            to: string; // account_hex
            from_subaccount?: number[];
            amount: string;
            memo?: string;
        }): Promise<string> => {
            const identity = checkIdentity();

            if (!multi && transferring) {
                message.warning('already transferring');
                throw new Error(`already transferring`);
            }

            setTransferring((last) => last + 1);
            try {
                const height = await icpTransfer(identity, {
                    to: args.to,
                    from_subaccount: args.from_subaccount,
                    amount: { e8s: args.amount },
                    fee: { e8s: getLedgerIcpFee() },
                    memo: args.memo ?? '0',
                });

                reload();
                return height;
            } catch (e) {
                throw new Error(`transfer icp failed: ${e}`);
            } finally {
                setTransferring((last) => last - 1);
            }
        },
        [checkIdentity, multi, transferring],
    );

    return {
        balance,
        fee: getLedgerIcpFee(),
        decimals: getLedgerIcpDecimals(),
        transfer,
        transferring,
    };
};

export const useTransferByOGY = (multi: boolean = false): LedgerTransferReturn => {
    const message = useMessage();

    const checkIdentity = useCheckIdentity();

    const balance = useIdentityStore((s) => s.ogyBalance);
    const reload = useIdentityStore((s) => s.reloadOgyBalance);

    const [transferring, setTransferring] = useState<number>(0);

    const transfer = useCallback(
        async (args: {
            to: string; // account_hex
            from_subaccount?: number[];
            amount: string;
            memo?: string;
        }): Promise<string> => {
            const identity = checkIdentity();

            if (!multi && transferring) {
                message.warning('already transferring');
                throw new Error(`already transferring`);
            }

            setTransferring((last) => last + 1);
            try {
                const height = await ogyTransfer(identity, {
                    to: args.to,
                    from_subaccount: args.from_subaccount,
                    amount: { e8s: args.amount },
                    fee: { e8s: getLedgerOgyFee() },
                    memo: args.memo ?? '0',
                });

                reload();
                return height;
            } catch (e) {
                throw new Error(`transfer ogy failed: ${e}`);
            } finally {
                setTransferring((last) => last - 1);
            }
        },
        [checkIdentity, multi, transferring],
    );

    return {
        balance,
        fee: getLedgerOgyFee(),
        decimals: getLedgerOgyDecimals(),
        transfer,
        transferring,
    };
};

export const useTransfer = (
    symbol: SupportedLedgerTokenSymbol | undefined,
): LedgerTransferReturn => {
    const {
        balance: balanceOgy,
        fee: feeOgy,
        decimals: decimalsOgy,
        transfer: transferOgy,
        transferring: transferringOgy,
    } = useTransferByOGY();
    const {
        balance: balanceIcp,
        fee: feeIcp,
        decimals: decimalsIcp,
        transfer: transferIcp,
        transferring: transferringIcp,
    } = useTransferByICP();

    if (symbol === 'ICP') {
        return {
            balance: balanceIcp,
            fee: feeIcp,
            decimals: decimalsIcp,
            transfer: transferIcp,
            transferring: transferringIcp,
        };
    }
    if (symbol === 'OGY') {
        return {
            balance: balanceOgy,
            fee: feeOgy,
            decimals: decimalsOgy,
            transfer: transferOgy,
            transferring: transferringOgy,
        };
    }
    throw new Error(`unsupported symbol: ${symbol}`);
};
