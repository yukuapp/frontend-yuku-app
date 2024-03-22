import { hex2array } from '@/common/data/hex';
import { bigint2string, string2bigint } from '@/common/types/bigint';
import { wrapOption } from '@/common/types/options';
import { unwrapRustResultMap } from '@/common/types/results';
import { unwrapVariantKey } from '@/common/types/variant';
import { LedgerTokenBalance, LedgerTransferArgs } from '@/types/canisters/ledgers';
import { ConnectedIdentity } from '@/types/identity';
import idlFactory from './ogy.did';
import _SERVICE, { TransferError_1 } from './ogy.did.d';

// ================= Query Balance =================

export const ogyLedgerAccountBalance = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    account: string,
): Promise<LedgerTokenBalance> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const balance = await actor.account_balance({ account: hex2array(account) });
    return { e8s: bigint2string(balance.e8s) };
};

// ================= Transfer =================

export const ogyTransfer = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    args: LedgerTransferArgs,
): Promise<string> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.transfer({
        to: hex2array(args.to),
        from_subaccount: wrapOption(args.from_subaccount),
        amount: { e8s: string2bigint(args.amount.e8s) },
        fee: { e8s: string2bigint(args.fee.e8s) },
        memo: string2bigint(args.memo),
        created_at_time: [],
    });
    return unwrapRustResultMap<bigint, TransferError_1, string>(r, bigint2string, (e) => {
        const key = unwrapVariantKey(e);
        switch (key) {
            case 'TxTooOld':
                throw new Error(`${key}: ${e[key].allowed_window_nanos}`);
            case 'BadFee':
                throw new Error(`${key}: ${e[key].expected_fee.e8s}`);
            case 'TxDuplicate':
                throw new Error(`${key}: ${e[key].duplicate_of}`);
            case 'TxCreatedInFuture':
                throw new Error(`${key}}`);
            case 'InsufficientFunds':
                throw new Error(`${key}: ${Number(e[key].balance.e8s) / 1e8}`);
        }
        throw new Error(`unknown error: ${e}`);
    });
};
