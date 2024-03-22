import YukuIcon from '@/components/ui/yuku-icon';
import { useNftFavorite } from '@/hooks/nft/favorited';
import { preventLink } from '@/common/react/link';
import { ConnectedIdentity } from '@/types/identity';
import { NftMetadata } from '@/types/nft';

function FavoriteButton({ card }: { card: NftMetadata; identity?: ConnectedIdentity }) {
    const { favorited, toggle, action } = useNftFavorite(card.metadata.token_id);

    const onChange = async () => {
        toggle();
    };

    return (
        <div className="absolute bottom-[7px] right-[7px] z-40 hidden h-[18px] w-[18px] cursor-pointer items-center justify-center rounded-[18px] bg-black/25  group-hover:flex ">
            <span onClick={preventLink(onChange)}>
                {action === undefined && favorited ? (
                    <YukuIcon
                        name="heart-fill"
                        size={14}
                        color="white"
                        className="visible h-auto w-full scale-75 rounded-[8px]"
                    />
                ) : (
                    <YukuIcon
                        name="heart"
                        size={14}
                        color="white"
                        className="visible h-auto w-full scale-75 rounded-[8px]"
                    />
                )}
                {action === 'DOING' && <span></span>}
                {action === 'CHANGING' && !favorited && <span></span>}
                {action === 'CHANGING' && favorited && <span></span>}
            </span>
        </div>
    );
}

export default FavoriteButton;
