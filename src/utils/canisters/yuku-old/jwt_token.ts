import * as jwt from '@/canisters/yuku-old/yuku_jwt_token';
import { ConnectedIdentity } from '@/types/identity';
import { getYukuJwtTokenCanisterId } from './special';

export const generateJwtToken = async (identity: ConnectedIdentity): Promise<string> => {
    const backend_canister_id = getYukuJwtTokenCanisterId();
    return jwt.generateJwtToken(identity, backend_canister_id);
};

export const queryJwtToken = async (identity: ConnectedIdentity): Promise<string> => {
    const backend_canister_id = getYukuJwtTokenCanisterId();
    return jwt.queryJwtToken(identity, backend_canister_id);
};
