import * as icp from '@/canisters/ledgers/ledger_icp';
import { LedgerTokenBalance, LedgerTransferArgs } from '@/types/canisters/ledgers';
import { ConnectedIdentity } from '@/types/identity';
import { anonymous } from '../../connect/anonymous';
import { getLedgerIcpCanisterId } from './special';

export const icpAccountBalance = async (account: string): Promise<LedgerTokenBalance> => {
    const backend_canister_id = getLedgerIcpCanisterId();
    return icp.icpLedgerAccountBalance(anonymous, backend_canister_id, account);
};

export const icpTransfer = async (
    identity: ConnectedIdentity,
    args: LedgerTransferArgs,
): Promise<string> => {
    const backend_canister_id = getLedgerIcpCanisterId();
    return icp.icpTransfer(identity, backend_canister_id, args);
};
