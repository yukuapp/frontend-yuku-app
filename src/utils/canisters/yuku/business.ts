import * as business from '@/canisters/yuku/yuku_business';
import { ConnectedIdentity } from '@/types/identity';
import { getYukuBusinessCanisterId } from './special';

export const queryRandomKey = async (identity: ConnectedIdentity): Promise<string> => {
    const backend_canister_id = getYukuBusinessCanisterId();
    return business.queryRandomKey(identity, backend_canister_id);
};
