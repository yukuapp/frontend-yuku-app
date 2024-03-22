import YukuIcon from '@/components/ui/yuku-icon';
import { useShoppingCart } from '@/hooks/nft/cart';
import { useShowCartButton } from '@/hooks/nft/functions/cart';
import { isSameNftByTokenId } from '@/common/nft/identifier';
import { preventLink } from '@/common/react/link';
import { useDeviceStore } from '@/stores/device';
import { useIdentityStore } from '@/stores/identity';
import { NftListingData } from '@/types/listing';
import { NftMetadata } from '@/types/nft';
import { ShoppingCartItem } from '@/types/yuku';
import { IconCartWhiteForbidden } from '../../icons';
import message from '../../message';

function CartButton({
    card,
    listing,
    className,
    isMarket = false,
}: {
    card: NftMetadata;
    listing: NftListingData | undefined;
    className?: string;
    isMarket?: boolean;
}) {
    const { isMobile } = useDeviceStore((s) => s.deviceInfo);

    const showCartButton = useShowCartButton(card, listing);

    const shoppingCartItems = useIdentityStore((s) => s.shoppingCartItems);
    const items: ShoppingCartItem[] = shoppingCartItems ?? [];
    const item = items.find((i) => isSameNftByTokenId(i, card.metadata));

    const { add, remove, action } = useShoppingCart();

    const onChange = async () => {
        if (action !== undefined) return;

        const added = !!item;
        if (added) remove(item.token_id).then(() => message.successRemoveCart());
        else add(card).then(() => message.successAddCart());
    };

    if (!showCartButton) return <></>;
    return (
        <>
            <button className={className} onClick={preventLink(onChange)}>
                {isMarket && (
                    <div className="relative">
                        <YukuIcon name="action-cart" size={18} color="white" />
                        {item && (
                            <IconCartWhiteForbidden className="absolute bottom-0 left-0 right-0 top-0" />
                        )}
                    </div>
                )}
                {action === undefined && (!isMarket || (isMarket && isMobile)) && (
                    <span>{item ? 'Remove' : 'Add'}</span>
                )}
                {action === 'DOING' && <span></span>}
                {action === 'CHANGING' && <span></span>}
            </button>
        </>
    );
}

export default CartButton;
