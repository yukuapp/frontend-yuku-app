import { useCallback, useEffect } from 'react';
import { useInterval } from 'usehooks-ts';
import { useIdentityStore } from '@/stores/identity';

export const watchIdentityProfile = () => {
    const identity = useIdentityStore((s) => s.connectedIdentity);
    const profile = useIdentityStore((s) => s.identityProfile);
    const reloadIdentityProfile = useIdentityStore((s) => s.reloadIdentityProfile);
    useInterval(() => {
        if (identity && !profile) reloadIdentityProfile();
    }, 13000);
};

const useRefreshLedgerBalance = (): (() => void) => {
    const identity = useIdentityStore((s) => s.connectedIdentity);

    const reloadIcpBalance = useIdentityStore((s) => s.reloadIcpBalance);
    const reloadOgyBalance = useIdentityStore((s) => s.reloadOgyBalance);

    const refresh = useCallback(() => {
        if (!identity) return;
        reloadIcpBalance();
        reloadOgyBalance();
    }, [identity]);

    return refresh;
};

let identity_balance_used = 0;
let identity_balance_reloading = false;
export const useQueryIdentityBalance = (delay = 60000) => {
    const refresh = useRefreshLedgerBalance();

    useInterval(() => {
        if (identity_balance_used <= 0) return;
        if (identity_balance_reloading) return;
        identity_balance_reloading = true;
        try {
            refresh();
        } finally {
            identity_balance_reloading = false;
        }
    }, delay);

    useEffect(() => {
        identity_balance_used++;
        return () => {
            identity_balance_used--;
        };
    }, []);
};
