import { useCallback, useState } from 'react';
import message from '@/components/message';
import { openBlindBox } from '@/canisters/nft/nft_ext/ext_blind';
import { uniqueKey } from '@/common/nft/identifier';
import { Spend } from '@/common/react/spend';
import { ConnectedIdentity } from '@/types/identity';
import { NftIdentifier, NftTokenMetadata } from '@/types/nft';
import { useCheckAction } from '../common/action';
import { checkWhitelist } from '../common/whitelist';

export type OpeningBlindBoxAction = undefined | 'DOING' | 'OPENING';

export type OpenBlindBoxNftExecutor = (
    identity: ConnectedIdentity,
    token_id: NftIdentifier,
) => Promise<NftTokenMetadata | undefined>;

export const useOpenBlindBoxNft = (): {
    open: OpenBlindBoxNftExecutor;
    action: OpeningBlindBoxAction;
} => {
    const checkAction = useCheckAction();

    const [action, setAction] = useState<OpeningBlindBoxAction>(undefined);

    const open = useCallback(
        async (
            identity: ConnectedIdentity,
            token_id: NftIdentifier,
        ): Promise<NftTokenMetadata | undefined> => {
            checkAction(action, `Opening`);

            setAction('DOING');
            try {
                await checkWhitelist(identity, [token_id.collection]);

                const spend = Spend.start(`open blind box nft ${uniqueKey(token_id)}`);

                const metadata = await doOpenBlindBox(setAction, identity, token_id, spend);

                return metadata;
            } catch (e) {
                console.debug(`🚀 ~ file: blind.tsx:46 ~ e:`, e);
                message.error(`Open Blink Box NFT failed: ${e}`);
            } finally {
                setAction(undefined);
            }
        },
        [action],
    );

    return { open, action };
};

export const doOpenBlindBox = async (
    setAction: (action: OpeningBlindBoxAction) => void,
    identity: ConnectedIdentity,
    token_id: NftIdentifier,
    spend: Spend,
): Promise<NftTokenMetadata | undefined> => {
    setAction('OPENING');
    const metadata = await openBlindBox(identity, token_id.collection, token_id.token_identifier);
    spend.mark(`OPENING DONE`);

    return metadata;
};
