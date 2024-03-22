import * as ogy from '@/canisters/ledgers/ledger_ogy';
import { LedgerTokenBalance, LedgerTransferArgs } from '@/types/canisters/ledgers';
import { ConnectedIdentity } from '@/types/identity';
import { anonymous } from '../../connect/anonymous';
import { getLedgerOgyCanisterId } from './special';

export const ogyAccountBalance = async (account: string): Promise<LedgerTokenBalance> => {
    const backend_canister_id = getLedgerOgyCanisterId();
    return ogy.ogyLedgerAccountBalance(anonymous, backend_canister_id, account);
};

export const ogyTransfer = async (
    identity: ConnectedIdentity,
    args: LedgerTransferArgs,
): Promise<string> => {
    const backend_canister_id = getLedgerOgyCanisterId();
    return ogy.ogyTransfer(identity, backend_canister_id, args);
};
