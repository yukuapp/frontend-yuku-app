import { useCallback, useState } from 'react';
import message from '@/components/message';
import { addShoppingCartItems, removeShoppingCartItems } from '@/utils/canisters/yuku-old/core';
import { getNameByNftMetadata, getThumbnailByNftMetadata } from '@/utils/nft/metadata';
import { uniqueKey } from '@/common/nft/identifier';
import { Spend } from '@/common/react/spend';
import { useIdentityStore } from '@/stores/identity';
import { ConnectedIdentity } from '@/types/identity';
import { NftIdentifier, NftMetadata } from '@/types/nft';
import { ShoppingCartItem } from '@/types/yuku';
import { useCheckAction } from '../common/action';
import { useCheckIdentity } from '../common/identity';

export type ShoppingCartAction = undefined | 'DOING' | 'CHANGING';

export type AddShoppingCartExecutor = (card: NftMetadata) => Promise<void>;
export type RemoveShoppingCartExecutor = (token_id: NftIdentifier) => Promise<void>;

export const useShoppingCart = (): {
    add: AddShoppingCartExecutor;
    remove: RemoveShoppingCartExecutor;
    action: ShoppingCartAction;
} => {
    const checkIdentity = useCheckIdentity();
    const checkAction = useCheckAction();

    const [action, setAction] = useState<ShoppingCartAction>(undefined);

    const addShoppingCartItem = useIdentityStore((s) => s.addShoppingCartItem);
    const removeShoppingCartItem = useIdentityStore((s) => s.removeShoppingCartItem);

    const addShoppingCart = addShoppingCartItem;
    const removeShoppingCart = removeShoppingCartItem;

    const add = useCallback(
        async (card: NftMetadata): Promise<void> => {
            const identity = checkIdentity();
            checkAction(action, `Adding`);

            setAction('DOING');
            try {
                const spend = Spend.start(
                    `add nft to shopping cart nft ${uniqueKey(card.owner.token_id)}`,
                );

                await doAdd(setAction, identity, card, addShoppingCart, spend);
            } catch (e) {
                message.error(`Add NFT to Shopping Cart failed: ${e}`);
            } finally {
                setAction(undefined);
            }
        },
        [checkIdentity, action, addShoppingCart],
    );

    const remove = useCallback(
        async (token_id: NftIdentifier): Promise<void> => {
            const identity = checkIdentity();
            checkAction(action, `Removing`);

            setAction('DOING');
            try {
                const spend = Spend.start(`remove nft to shopping cart nft ${uniqueKey(token_id)}`);

                await doRemove(setAction, identity, token_id, removeShoppingCart, spend);
            } catch (e) {
                console.debug(`🚀 ~ file: cart.tsx:86 ~ e:`, e);
                message.error(`Remove NFT from Shopping Cart failed: ${e}`);
            } finally {
                setAction(undefined);
            }
        },
        [checkIdentity, action, addShoppingCart],
    );

    return { add, remove, action };
};

const doAdd = async (
    setAction: (action: ShoppingCartAction) => void,
    identity: ConnectedIdentity,
    card: NftMetadata,
    addShoppingCart: (item: ShoppingCartItem) => void,
    spend: Spend,
): Promise<void> => {
    setAction('CHANGING');
    addShoppingCartItems(identity!, [
        {
            token_identifier: card.metadata.token_id.token_identifier,
            url: getThumbnailByNftMetadata(card),
            name: getNameByNftMetadata(card),
        },
    ]).catch((e) => message.error(`${e}`));
    addShoppingCart({
        token_id: card.metadata.token_id,
        card,
        listing: card.listing?.listing,
    });
    spend.mark(`CHANGING DONE`);
};

const doRemove = async (
    setAction: (action: ShoppingCartAction) => void,
    identity: ConnectedIdentity,
    token_id: NftIdentifier,
    removeShoppingCart: (token: NftIdentifier) => void,
    spend: Spend,
): Promise<void> => {
    setAction('CHANGING');
    removeShoppingCartItems(identity!, token_id.token_identifier).catch((e) =>
        message.error(`${e}`),
    );
    removeShoppingCart(token_id);
    spend.mark(`CHANGING DONE`);
};
