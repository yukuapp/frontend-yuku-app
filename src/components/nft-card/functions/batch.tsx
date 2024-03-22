import { useShowBatchListingButton } from '@/hooks/nft/functions/batch';
import { getLedgerTokenIcp } from '@/utils/canisters/ledgers/special';
import { cdn } from '@/common/cdn';
import { isSameNft } from '@/common/nft/identifier';
import { justPreventLink, preventLink } from '@/common/react/link';
import { useIdentityStore } from '@/stores/identity';
import { ConnectedIdentity } from '@/types/identity';
import { NftListingData } from '@/types/listing';
import { NftIdentifier } from '@/types/nft';
import { NftMetadata } from '@/types/nft';

function BatchListingButton({
    card,
    listing,
    identity,
}: {
    card: NftMetadata;
    listing: NftListingData | undefined;
    identity?: ConnectedIdentity;
}) {
    const showBatchListingButton = useShowBatchListingButton(card, listing);

    // const showBatchSellSidebar = useIdentityStore((s) => s.showBatchSellSidebar);
    // const toggleShowBatchSellSidebar = useIdentityStore((s) => s.toggleShowBatchSellSidebar);
    const batchSales = useIdentityStore((s) => s.batchSales);
    const addBatchNftSale = useIdentityStore((s) => s.addBatchNftSale);
    const removeBatchNftSale = useIdentityStore((s) => s.removeBatchNftSale);

    const token_id: NftIdentifier = card.metadata.token_id;

    const item = batchSales.find((l) => isSameNft(l.token_id, token_id));

    const onChange = () => {
        if (item === undefined) {
            addBatchNftSale({
                token_id,
                card,
                owner: card.owner,
                token: getLedgerTokenIcp(),
                last:
                    card.listing?.listing.type === 'listing'
                        ? card.listing?.listing.price
                        : undefined,
                price: '',
            });
        } else {
            removeBatchNftSale(token_id);
        }
    };

    if (!identity || !showBatchListingButton) return <></>;
    return (
        <div
            onClick={justPreventLink}
            className="absolute right-[6px] top-[7px] z-40  h-[18px] w-[18px] rounded-[18px] bg-black/25 backdrop-blur-sm group-hover:block"
        >
            <span onClick={preventLink(onChange)}>
                <img
                    className="ml-[4px] mt-[4px] block h-[10px] w-[10px]"
                    src={cdn(item === undefined ? '' : '')}
                    alt=""
                />
            </span>
        </div>
    );
}

export default BatchListingButton;
