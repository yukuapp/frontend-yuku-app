import { bigint2string } from '@/common/types/bigint';
import { string2principal } from '@/common/types/principal';
import { parseMotokoResult, unwrapMotokoResult } from '@/common/types/results';
import { LedgerTokenBalance } from '@/types/canisters/ledgers';
import { ConnectedIdentity } from '@/types/identity';
import idlFactory from './credit_points.did';
import _SERVICE from './credit_points.did.d';

export const queryCreditPoints = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    args: { type: 'address'; account: string } | { type: 'principal'; principal: string },
): Promise<LedgerTokenBalance> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.balance(
        args.type === 'address'
            ? { address: args.account }
            : { principal: string2principal(args.principal) },
    );
    return unwrapMotokoResult(
        parseMotokoResult(
            r,
            (balance) => ({ e8s: bigint2string(balance) }),
            (e) => e,
        ),
        (e) => {
            if (e['InvalidToken']) throw new Error(`InvalidToken: ${e['InvalidToken']}`);
            if (e['Other']) throw new Error(`Other: ${e['Other']}`);
            throw new Error(`wrong result or query credit point`);
        },
    );
};
