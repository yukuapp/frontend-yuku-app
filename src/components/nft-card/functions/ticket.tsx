import { useCallback, useState } from 'react';
import YukuIcon from '@/components/ui/yuku-icon';
import { useShowTicketButton } from '@/hooks/nft/functions/ticket';
import { queryNftTicketStatus } from '@/canisters/nft/nft_ext/ext_ticket';
import { preventLink } from '@/common/react/link';
import { unwrapVariantKey } from '@/common/types/variant';
import { ConnectedIdentity } from '@/types/identity';
import { NftMetadata } from '@/types/nft';
import { NFTOwnable, NftTicketOwnedData } from '@/types/yuku-standard/ticket';
import message from '../../message';
import TicketModal from '../components/ticket';

function TicketButton({
    card,
    identity,
    className,
}: {
    card: NftMetadata;
    identity?: ConnectedIdentity;
    className?: string;
}) {
    const tickedData = useShowTicketButton(card);

    const [owned, setOwned] = useState<NftTicketOwnedData | undefined>(undefined);

    const [loading, setLoading] = useState<boolean>(false);
    const onOpen = useCallback(() => {
        if (!identity) return;
        if (!tickedData) return;
        if (loading) return;

        setLoading(true);

        queryNftTicketStatus(identity, card.owner.token_id.collection, card.owner.token_id)
            .then((data) => {
                const status = unwrapVariantKey<
                    'NoBody' | 'InvalidToken' | 'Forbidden' | 'Owner' | 'Anonymous'
                >(data);
                if (['Owner', 'Anonymous'].includes(status)) {
                    const ownable: { List: Array<NFTOwnable> } = data[status][1];

                    let owned: string | undefined = undefined;
                    if (ownable.List.length === 0) owned = '';
                    else if (tickedData.project === 'ICP x EthCC NFT')
                        owned = (ownable.List[1] as { Text: string }).Text;
                    else owned = (ownable.List[0] as { Text: string }).Text;
                    return setOwned({
                        type: tickedData.type,
                        project: tickedData.project,
                        owned,
                        status,
                        data,
                    });
                }
                throw new Error('can not find data');
            })
            .catch((e) => {
                message.destroy();
                console.error('queryNftTicketStatus', e);
                message.error('query ticket data failed');
            })
            .finally(() => setLoading(false));
    }, [identity, tickedData, loading]);

    const onCleanOwned = () => setOwned(undefined);

    if (!tickedData || !identity) return <></>;
    return (
        <>
            <YukuIcon
                name="nft-ticket"
                color="#999999"
                size={15}
                className={className}
                onClick={preventLink(onOpen)}
            />
            {owned && <TicketModal data={owned} onClose={onCleanOwned} />}
        </>
    );
}

export default TicketButton;
