import { useCollectionDataList } from '@/hooks/nft/collection';
import { loadTokenMetadata } from '@/utils/nft/common';
import { getNameByNftMetadata } from '@/utils/nft/metadata';
import { cn } from '@/common/cn';
import { shrinkText } from '@/common/data/text';
import { NftIdentifier, NftMetadata } from '@/types/nft';
import { UniqueCollectionData } from '@/types/yuku';
import SkeletonTW from '../ui/skeleton';

function NftName({
    token_id,
    metadata,
    data,
    shrink_text,
    className,
}: {
    token_id: NftIdentifier;
    metadata?: NftMetadata;
    data?: UniqueCollectionData;
    shrink_text?: { prefix: number; suffix: number };
    className?: string;
}) {
    // const [loading, setLoading] = useState(false);
    const name = metadata !== undefined ? getNameByNftMetadata(metadata) : undefined;

    const collectionDataList = useCollectionDataList();

    const selfMetadata: NftMetadata | undefined =
        metadata === undefined
            ? loadTokenMetadata(token_id, [...collectionDataList, ...(data ? [data] : [])])
            : undefined;
    const selfName = selfMetadata !== undefined ? getNameByNftMetadata(selfMetadata) : undefined;

    const wrappedName = name ?? selfName;
    const wrappedLoading = wrappedName === undefined;
    return (
        <>
            {wrappedLoading && <SkeletonTW className={cn('!h-[20px] !w-full', className)} />}
            {!wrappedLoading && wrappedName === undefined && <></>}
            {!wrappedLoading && wrappedName !== undefined && (
                <span
                    className={cn(
                        'overflow-hidden truncate whitespace-nowrap font-inter-semibold text-[14px] text-white',
                        className,
                    )}
                >
                    {shrink_text
                        ? shrinkText(wrappedName, shrink_text.prefix, shrink_text.suffix)
                        : wrappedName}
                </span>
            )}
        </>
    );
}

export default NftName;
