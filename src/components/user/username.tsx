import { useUsername } from '@/hooks/user/username';
import { cn } from '@/common/cn';
import { shrinkPrincipal } from '@/common/data/text';
import { AssureLink } from '@/common/react/link';

function Username({
    principal_or_account,
    className,
    openLink = true,
}: {
    principal_or_account?: string;
    className?: string;
    openLink?: boolean;
}) {
    const { principal, username, accountId } = useUsername(principal_or_account);

    return (
        <AssureLink
            to={openLink && principal ? `/profile/${principal}` : ''}
            className={cn([
                'w-full cursor-pointer truncate overflow-ellipsis text-[14px] text-white',
                principal && className,
            ])}
        >
            {shrinkPrincipal(username ?? principal ?? accountId ?? '--')}
        </AssureLink>
    );
}

export default Username;
