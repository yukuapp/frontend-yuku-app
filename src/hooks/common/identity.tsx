import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIdentityStore } from '@/stores/identity';
import { ConnectedIdentity } from '@/types/identity';

export const useCheckIdentity = (): (() => ConnectedIdentity) => {
    const navigate = useNavigate();

    const identity = useIdentityStore((s) => s.connectedIdentity);

    const checkIdentity = useCallback(() => {
        if (!identity) {
            navigate('/connect');
            throw new Error(`please connect your identity`);
        }
        return identity;
    }, [identity]);

    return checkIdentity;
};
