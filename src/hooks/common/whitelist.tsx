import _ from 'lodash';
import { diffWhitelist, updateWhitelist } from '@/utils/connect/whitelist';
import { ConnectedIdentity } from '@/types/identity';

export const checkWhitelist = async (
    identity: ConnectedIdentity,
    whitelist: string[],
): Promise<void> => {
    whitelist = whitelist.filter((canister_id) => !!canister_id);
    if (whitelist.length === 0) return;

    whitelist = _.uniq(whitelist);
    const needs = diffWhitelist(whitelist);
    if (needs.length === 0) return;

    try {
        const passed = await identity.requestWhitelist(needs);
        if (!passed) throw new Error();
    } catch (e) {
        throw new Error(`The required permissions were rejected.`);
    }
    updateWhitelist(whitelist);
};
