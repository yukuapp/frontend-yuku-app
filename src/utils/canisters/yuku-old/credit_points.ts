import { queryCreditPoints } from '@/canisters/yuku-old/yuku_credit_points';
import { LedgerTokenBalance } from '@/types/canisters/ledgers';
import { anonymous } from '../../connect/anonymous';
import { getYukuCreditPointsCanisterId } from './special';

export const queryCreditPointsByPrincipal = async (
    principal: string,
): Promise<LedgerTokenBalance> => {
    const backend_canister_id = getYukuCreditPointsCanisterId();
    return queryCreditPoints(anonymous, backend_canister_id, {
        type: 'principal',
        principal,
    });
};

export const queryCreditPointsByAccount = async (account: string): Promise<LedgerTokenBalance> => {
    const backend_canister_id = getYukuCreditPointsCanisterId();
    return queryCreditPoints(anonymous, backend_canister_id, { type: 'address', account });
};
