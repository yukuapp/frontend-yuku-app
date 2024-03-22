import { useCallback, useState } from 'react';
import message from '@/components/message';
import { cancelListing } from '@/utils/canisters/yuku-old/core';
import { retrieveNftFromListingByOgy } from '@/canisters/nft/nft_ogy';
import { uniqueKey } from '@/common/nft/identifier';
import { Spend } from '@/common/react/spend';
import { HoldingAction, HoldingNftExecutor } from '@/types/exchange/single-hold';
import { ConnectedIdentity } from '@/types/identity';
import { NftTokenOwner } from '@/types/nft';
import { useCheckAction } from '../../common/action';
import { checkWhitelist } from '../../common/whitelist';

export const useHoldNft = (): {
    hold: HoldingNftExecutor;
    action: HoldingAction;
} => {
    const checkAction = useCheckAction();

    const [action, setAction] = useState<HoldingAction>(undefined);

    const hold = useCallback(
        async (identity: ConnectedIdentity, owner: NftTokenOwner): Promise<boolean> => {
            checkAction(action, `Holding`);

            setAction('DOING');
            try {
                await checkWhitelist(identity, [
                    owner.raw.standard === 'ogy' ? owner.token_id.collection : '',
                ]);

                const spend = Spend.start(`hold nft ${uniqueKey(owner.token_id)}`);

                await doCancel(setAction, identity, owner, spend);
                if (owner.raw.standard === 'ogy') return true;

                await doHold(setAction, identity, owner, spend);

                return true;
            } catch (e) {
                console.debug(`🚀 ~ file: hold.tsx:54 ~ e:`, e);
                message.error(`Hold NFT failed: ${e}`);
            } finally {
                setAction(undefined);
            }
            return false;
        },
        [action],
    );

    return { hold, action };
};

const doCancel = async (
    setAction: (action: HoldingAction) => void,
    identity: ConnectedIdentity,
    owner: NftTokenOwner,
    spend: Spend,
): Promise<void> => {
    setAction('CANCELLING');
    await cancel(identity, owner, setAction, spend);
    spend.mark(`CANCELLING DONE`);
};

const cancel = async (
    identity: ConnectedIdentity,
    owner: NftTokenOwner,
    setAction: (action: HoldingAction) => void,
    spend: Spend,
): Promise<void> => {
    if (owner.raw.standard === 'ogy') {
        // ? OGY
        setAction('CANCELLING_OGY');
        const cancel = await retrieveNftFromListingByOgy(
            identity,
            owner.token_id.collection,
            owner.token_id.token_identifier,
        );
        spend.mark(`CANCELLING_OGY DONE`);
        if (!cancel) throw new Error('Cancel last order failed.');
    }
};

const doHold = async (
    setAction: (action: HoldingAction) => void,
    identity: ConnectedIdentity,
    owner: NftTokenOwner,
    spend: Spend,
): Promise<void> => {
    setAction('HOLDING');
    await cancelListing(identity, owner.token_id.token_identifier);
    spend.mark(`HOLDING DONE`);
};
