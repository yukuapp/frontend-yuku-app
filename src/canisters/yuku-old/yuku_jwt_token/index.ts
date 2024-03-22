import { MILLISECONDS_HOUR } from '@/common/data/dates';
import { unwrapRustResultMap } from '@/common/types/results';
import { throwsBy, unchanging } from '@/common/types/variant';
import { ConnectedIdentity } from '@/types/identity';
import idlFactory from './jwt_token.did';
import _SERVICE, { UserJWT } from './jwt_token.did';

export const generateJwtToken = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
): Promise<string> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.generate_jwt();
    // console.debug(`🚀 ~ file: index.ts:17 ~ generateJwtToken:`, r);
    return r;
};

export const queryJwtToken = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
): Promise<string> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.get_my_jwt();
    // console.debug(`🚀 ~ file: index.ts:29 ~ queryJwtToken:`, r);
    return unwrapRustResultMap<UserJWT, string, string>(
        r,
        (ok) => {
            const now = Date.now();
            const expired = Number(`${ok.token_exp * BigInt(1000)}`);
            if (now + MILLISECONDS_HOUR * 12 < expired) return ok.token;
            throw new Error(`token is nearly expired`);
        },
        throwsBy<string>(unchanging),
    );
};
