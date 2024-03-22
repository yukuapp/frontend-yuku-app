import { useCallback, useEffect, useState } from 'react';
import { favoriteByCore } from '@/utils/canisters/yuku-old/core';
import { isSameNft } from '@/common/nft/identifier';
import { useIdentityStore } from '@/stores/identity';
import { NftIdentifier } from '@/types/nft';
import { useCheckIdentity } from '../common/identity';

export type FavoritedAction = undefined | 'DOING' | 'CHANGING';

export const useNftFavorite = (
    token_id: NftIdentifier | undefined,
): {
    favorited: boolean | undefined;
    toggle: () => Promise<boolean | undefined>;
    action: FavoritedAction;
} => {
    const checkIdentity = useCheckIdentity();

    const all_favorited = useIdentityStore((s) => s.favorited);
    const addFavorited = useIdentityStore((s) => s.addFavorited);
    const removeFavorited = useIdentityStore((s) => s.removeFavorited);

    const [favorited, setFavorited] = useState<boolean | undefined>(undefined);
    useEffect(() => {
        if (all_favorited === undefined || token_id === undefined) return setFavorited(undefined);
        setFavorited(!!all_favorited.find((c) => isSameNft(c, token_id)));
    }, [all_favorited, token_id]);

    const [action, setAction] = useState<FavoritedAction>(undefined);

    const toggle = useCallback(async (): Promise<boolean | undefined> => {
        const identity = checkIdentity();
        if (favorited === undefined || token_id === undefined) {
            console.error(`favorite can not be undefined`);
            return undefined;
        }
        if (action !== undefined) {
            return undefined;
        }
        setAction('DOING');

        const current = !favorited;
        try {
            setAction('CHANGING');
            favoriteByCore(identity, {
                token_identifier: token_id.token_identifier,
                favorite: current,
            });
        } catch (e) {
            console.debug(`🚀 ~ file: nft.tsx:193 ~ toggle ~ e:`, e);
        } finally {
            setAction(undefined);
        }
        if (current) {
            addFavorited(token_id);
        } else {
            removeFavorited(token_id);
        }
        return current;
    }, [checkIdentity, favorited, token_id]);

    return { favorited, toggle, action };
};
