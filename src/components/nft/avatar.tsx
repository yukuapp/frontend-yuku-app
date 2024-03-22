import { useState } from 'react';
import { Skeleton } from 'antd';
import { useUserAvatar } from '@/hooks/user/avatar';
import { cdn } from '@/common/cdn';
import { cn } from '@/common/cn';
import { AssureLink } from '@/common/react/link';
import { NftMetadata } from '@/types/nft';

export const ShowNftOwnerAvatar = ({ card, link }: { card: NftMetadata; link: boolean }) => {
    const { principal, avatar } = useUserAvatar(card.owner.owner);

    const [loading, setLoading] = useState<boolean>(true);

    const onLoad = () => setLoading(false);

    return (
        <AssureLink to={principal && link ? `/profile/${principal}` : undefined}>
            <>
                {loading && (
                    <Skeleton.Image className="absolute top-0 !h-full !w-full !rounded-full" />
                )}
                {
                    <img
                        className={cn(
                            'invisible h-full w-full rounded-full',
                            !loading && 'visible',
                        )}
                        src={cdn(avatar)}
                        alt="avatar"
                        onLoad={onLoad}
                    />
                }
            </>
        </AssureLink>
    );
};
