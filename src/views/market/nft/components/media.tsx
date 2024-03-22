import BlindBoxButton from '@/components/nft-card/functions/blind';
import NftMedia from '@/components/nft/media';
import { useShowBlindBoxButton } from '@/hooks/nft/functions/blind';
import { getMediaUrlByNftMetadata } from '@/utils/nft/metadata';
import { cdn_by_resize } from '@/common/cdn';
import { ConnectedIdentity } from '@/types/identity';
import { NftListingData } from '@/types/listing';
import { NftMetadata } from '@/types/nft';

function NftDetailMedia({
    card,
    listing,
    identity,
    refreshCard,
}: {
    card?: NftMetadata;
    listing?: NftListingData;
    identity?: ConnectedIdentity;
    refreshCard: () => void;
}) {
    const showBlindBoxButton = useShowBlindBoxButton(card, listing);
    return (
        <div className="group relative h-full w-full lg:w-[530px]">
            {showBlindBoxButton && (
                <>
                    <BlindBoxButton
                        card={card!}
                        listing={listing}
                        identity={identity}
                        refreshList={refreshCard}
                        className=" absolute bottom-[15px] left-1/2 z-20 hidden -translate-x-1/2 bg-black px-[20px] py-[8px] text-[16px] text-white group-hover:block"
                    />
                    <div className="absolute bottom-0 left-0 right-0 top-0 z-10 cursor-pointer  from-gray-200/30 to-transparent font-inter-semibold hover:bg-gradient-to-t"></div>
                </>
            )}
            <NftMedia
                src={cdn_by_resize(getMediaUrlByNftMetadata(card), { width: 800 })}
                metadata={card?.metadata}
                className="min-h-[300px] min-w-[300px] flex-shrink-0  rounded-[16px] sm:min-h-[400px] sm:min-w-[400px]"
            />
        </div>
    );
}

export default NftDetailMedia;
