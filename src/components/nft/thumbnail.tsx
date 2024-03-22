import { useState } from 'react';
import { Skeleton } from 'antd';
import { useCollectionDataList } from '@/hooks/nft/collection';
import { loadTokenMetadata } from '@/utils/nft/common';
import { getThumbnailByNftMetadata } from '@/utils/nft/metadata';
import { cdn, cdn_by_resize } from '@/common/cdn';
import { cn } from '@/common/cn';
import { NftIdentifier, NftMetadata } from '@/types/nft';
import AspectRatio from '../ui/aspect-ratio';

function NftThumbnail({
    token_id,
    metadata,
    cdn_width,
    width,
    imgClass,
}: {
    token_id: NftIdentifier;
    metadata?: NftMetadata;
    cdn_width?: number;
    width?: string;
    imgClass?: string;
}) {
    // const [loading, setLoading] = useState(false);
    const thumbnail = metadata !== undefined ? getThumbnailByNftMetadata(metadata) : undefined;

    const collectionDataList = useCollectionDataList();

    const selfMetadata: NftMetadata | undefined =
        metadata === undefined ? loadTokenMetadata(token_id, collectionDataList) : undefined;
    const selfThumbnail =
        selfMetadata !== undefined ? getThumbnailByNftMetadata(selfMetadata) : undefined;

    const wrappedThumbnail = thumbnail ?? selfThumbnail;
    const wrappedLoading = wrappedThumbnail === undefined;

    return (
        <div className={`${width}`}>
            <AspectRatio>
                {wrappedLoading && (
                    <Skeleton.Input
                        className={cn('!h-full !w-full !min-w-0 !rounded-md', imgClass)}
                    />
                )}
                {!wrappedLoading && wrappedThumbnail === undefined && <></>}
                {!wrappedLoading && wrappedThumbnail !== undefined && (
                    <div
                        className={cn(
                            'h-full w-full rounded-md bg-contain bg-center bg-no-repeat',
                            imgClass,
                        )}
                        style={{
                            backgroundImage: `url('${
                                cdn_width
                                    ? cdn_by_resize(wrappedThumbnail, { width: cdn_width })
                                    : cdn(wrappedThumbnail)
                            }')`,
                        }}
                    />
                )}
            </AspectRatio>
        </div>
    );
}

export default NftThumbnail;

export const ShowNftThumbnail = ({ card }: { card: NftMetadata }) => {
    const thumbnail = getThumbnailByNftMetadata(card);

    const [loading, setLoading] = useState<boolean>(true);

    const [aspectRatio, setAspectRatio] = useState<number>(1);
    const onLoad = (image: any) => {
        setLoading(false);
        setAspectRatio(image.naturalWidth / image.naturalHeight);
    };

    return (
        <>
            {loading && <Skeleton.Image className="absolute !h-full !w-full" />}
            {
                <img
                    src={cdn(thumbnail)}
                    className={cn(
                        '"rounded-[0px] bg-contain bg-center bg-no-repeat',
                        aspectRatio > 1 ? 'w-full' : 'h-full',
                        loading ? 'invisible' : 'visible',
                    )}
                    onLoad={onLoad}
                />
            }
        </>
    );
};
