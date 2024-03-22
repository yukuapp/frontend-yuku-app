import { bigint2string } from '@/common/types/bigint';
import { ConnectedIdentity } from '@/types/identity';
import { idlFactory } from './business.did';
import { _SERVICE } from './business.did.d';

// ===================== Get random key for backend principal verification =====================

export const queryRandomKey = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
): Promise<string> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.user_update();
    return bigint2string(r);
};
