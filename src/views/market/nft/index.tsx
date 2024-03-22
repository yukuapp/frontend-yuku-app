import { useCallback, useEffect, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { isMobile } from 'react-device-detect';
import ReactPaginate from 'react-paginate';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Dropdown, Skeleton } from 'antd';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ShowNumber from '@/components/data/number';
import message from '@/components/message';
import { NftDetailFunction } from '@/components/nft/detail_function';
import Empty from '@/components/ui/empty';
import Loading from '@/components/ui/loading';
import { PaginatedNextLabel, PaginatedPreviousLabel } from '@/components/ui/paginated';
import TooltipCN from '@/components/ui/tooltip';
import UserAvatar from '@/components/user/avatar';
import Username from '@/components/user/username';
import { useUsername } from '@/hooks/user/username';
import { useCollectionData, useCollectionNftMetadata } from '@/hooks/views/market';
import { queryActivity } from '@/utils/apis/yuku/api_data';
import { queryCollectionNftMinter } from '@/utils/canisters/nft/nft';
import { viewedNft } from '@/utils/canisters/yuku-old/core';
import { getTokenOwners } from '@/utils/combined/collection';
import { getNameByNftMetadata } from '@/utils/nft/metadata';
import { ActivityResponse } from '@/apis/yuku/api_data';
import { cn } from '@/common/cn';
import { isCanisterIdText, isPrincipalText } from '@/common/ic/principals';
import { parse_token_identifier, parse_token_index } from '@/common/nft/ext';
import { FirstRenderByData } from '@/common/react/render';
import { Spend } from '@/common/react/spend';
import { useIdentityStore } from '@/stores/identity';
import { NftMetadata } from '@/types/nft';
import NftActivities from './components/activity';
import NftDetailMedia from './components/media';
import NftScore from './components/score';
import NftTabs from './components/tabs';

function MarketNftDetailPage() {
    const navigate = useNavigate();

    const identity = useIdentityStore((s) => s.connectedIdentity);

    const { collection, token_identifier_or_index } = useParams();

    const { state }: { state?: { card?: NftMetadata } } = useLocation();

    const [token_identifier, setTokenIdentifier] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (!isCanisterIdText(collection)) return navigate('/', { replace: true });
        if (isPrincipalText(token_identifier_or_index)) {
            return setTokenIdentifier(token_identifier_or_index);
        }
        if (token_identifier_or_index) {
            try {
                const token_index = parseInt(token_identifier_or_index);
                if (isNaN(token_index) || `${token_index}` !== token_identifier_or_index)
                    throw new Error(`can not parse to token_index: ${token_identifier_or_index}`);
                return setTokenIdentifier(parse_token_identifier(collection!, token_index));
            } catch (e) {
                console.debug(`🚀 ~ file: index.tsx:66 ~ useEffect ~ e:`, e);
            }
        }
        return navigate(`/market/${collection}`, { replace: true });
    }, [collection, token_identifier_or_index]);

    useEffect(() => {
        if (collection === undefined) return;
        if (token_identifier === undefined) return;
        getTokenOwners(collection, 'stored_remote').then((token_owners) => {
            if (token_owners) {
                const owner = token_owners.find(
                    (o) => o.token_id.token_identifier === token_identifier,
                );
                if (owner === undefined) {
                    message.error(`wrong token_identifier`);
                    return navigate(`/market/${collection}`, { replace: true });
                }
            }
        });
    }, [collection, token_identifier]);

    const data = useCollectionData(collection);
    const [once_check_data_spend] = useState(new FirstRenderByData());
    const [spend_data] = useState(Spend.start(`market nft index !!!!!!!!!!!!!!!`));
    useEffect(() => {
        once_check_data_spend.once([!!data], () => {
            spend_data.mark(`data is ${data ? 'exist' : 'not exist'}`);
        });
    }, [data]);

    const { card, refreshCard, score, scores, listing, refreshListing, metadata } =
        useCollectionNftMetadata(collection, data, token_identifier);
    if (card) card.listing = listing;

    useEffect(() => {
        if (card === undefined || identity === undefined) return;
        viewedNft(identity, card.owner.token_id.token_identifier);
    }, [card, identity]);

    const [minter, setMinter] = useState<string | undefined>(undefined);
    useEffect(() => {
        if (!collection || !token_identifier) return;
        queryCollectionNftMinter(collection)
            .then(setMinter)
            .catch(() => {
                setMinter(card?.data?.creator?.userId ?? card?.data?.info.creator);
            });
    }, [collection, token_identifier]);
    const {
        principal: artistPrincipal,
        // username: artistUsername,
        accountId: artistAccountId,
    } = useUsername(minter);

    const {
        principal: ownerPrincipal,
        // username: ownerUsername,
        accountId: ownerAccountId,
    } = useUsername(card?.owner.owner);

    const [copied, setCopied] = useState(false);

    const [curPage, setCurPage] = useState<number>(1);
    const limit = 10;
    const queryClient = useQueryClient();
    const token_index = card?.metadata.token_id.token_identifier
        ? `${parse_token_index(card?.metadata.token_id.token_identifier)}`
        : undefined;
    const {
        status,
        data: activity,
        error,
        isPlaceholderData,
        isFetching,
    } = useQuery<ActivityResponse, Error>({
        queryKey: [
            'collection/activity',
            card?.metadata.token_id.collection,
            curPage,
            limit,
            token_index,
        ],
        queryFn: () =>
            queryActivity({
                canister: collection,
                page: curPage,
                limit,
                token_id: token_index,
            }),
        keepPreviousData: true,
        staleTime: 5000,
        enabled: !!token_index,
    });
    const events = activity?.data;
    const all_page = activity?.page.page_count;

    // Prefetch the next page!
    useEffect(() => {
        if (!isPlaceholderData && all_page !== curPage && token_index) {
            queryClient.prefetchQuery({
                queryKey: ['collection/activity', collection, curPage + 1, limit, token_index],
                queryFn: () =>
                    queryActivity({
                        canister: collection,
                        page: curPage + 1,
                        limit,

                        token_id: token_index,
                    }),
            });
        }
    }, [
        data,
        isPlaceholderData,
        curPage,
        all_page,
        queryClient,
        card?.metadata.token_id.token_identifier,
    ]);
    const copyText = useCallback(({ text, onSuccess }) => {
        const _input = document.createElement('input');
        try {
            document.body.appendChild(_input);
            _input.setAttribute('value', text);
            if (navigator.userAgent.match(/(iPhone|iPod|iPad);?/i)) {
                _input.select();
                _input.setSelectionRange(0, _input.value.length);
                document.execCommand('copy');
                onSuccess && onSuccess();
            } else {
                _input.select();
                document.execCommand('copy');
                onSuccess && onSuccess();
            }
            document.body.removeChild(_input);
        } catch (err) {
            console.log(err);
            document.body.removeChild(_input);
        }
    }, []);

    const handleShareMenu = useCallback((e: string) => {
        const { origin } = window.location;
        const _href = `${origin}/market/${collection}/${token_identifier}`;
        switch (e) {
            case 'twitter':
                window.open(
                    `https://twitter.com/intent/tweet?text=Check out this item on Yuku&url=${_href}`,
                );
                break;
            case 'link':
                copyText({
                    text: _href,
                    onSuccess: () => {
                        message.success('Copy Success!');
                    },
                });
                break;
            default:
                break;
        }
    }, []);

    const handlePageClick = ({ selected }: { selected: number }) => {
        setCurPage(selected + 1);

        // setOffset(newOffset);
    };
    return (
        <div className="nft-detail-wrapper !mt-[60px] w-full px-[21px] text-white md:!mt-[85px] lg:m-auto lg:w-[1440px]">
            <div className="mt-[34px] flex flex-wrap lg:justify-between">
                <div className="w-full lg:ml-[155px] lg:w-[530px]">
                    <NftDetailMedia
                        card={card ?? state?.card}
                        listing={listing}
                        identity={identity}
                        refreshCard={refreshCard}
                    />
                </div>
                <div className="mt-[20px] w-full lg:mr-[40px] lg:mt-[7px] lg:w-[618px]">
                    <div className="flex lg:justify-between">
                        <div className="flex items-start">
                            <Link
                                to={`/market/${collection}`}
                                className=" mr-[10px] font-inter-medium text-[12px] leading-[15px] text-[#7355FF] hover:underline lg:mr-[24px] lg:text-[18px] lg:leading-[25px]"
                            >
                                {data?.info.name || <Skeleton.Input className="!h-[25px]" active />}
                            </Link>
                            <NftScore score={card?.score ?? score} scores={scores} />
                        </div>
                        <div className="hidden items-center text-[12px] text-[#8D8D8D] lg:flex">
                            <div className="mr-[32px] flex cursor-pointer items-center  ">
                                <img
                                    className="mr-[5px] block h-[14px] w-[14px] opacity-[0.5]"
                                    src={'/img/market/icon-view.svg'}
                                    alt=""
                                />
                                <span className=" mr-[6px] leading-[23px]">View</span>
                                <ShowNumber
                                    className=" font-inter-regular text-[12px] leading-none"
                                    value={{
                                        value: card?.listing?.views,
                                        thousand: {
                                            symbol: ['M'],
                                            comma: true,
                                        },
                                    }}
                                />
                            </div>
                            <div>
                                <Dropdown
                                    menu={{
                                        items: [
                                            { key: 'twitter', label: 'Share on twitter' },
                                            { key: 'link', label: 'Copy Link' },
                                        ],
                                        onClick: (e) => handleShareMenu(e.key),
                                    }}
                                    getPopupContainer={() =>
                                        document.getElementById('nft-detail-wrapper') as HTMLElement
                                    }
                                    placement="bottomRight"
                                >
                                    <div className=" flex items-center">
                                        <img
                                            className="mr-[5px] block h-[14px] w-[14px] opacity-[0.5]"
                                            src={'/img/market/icon-share.svg'}
                                            alt=""
                                        />
                                        <span className=" cursor-pointer leading-[23px]">
                                            Share
                                        </span>
                                    </div>
                                </Dropdown>
                            </div>
                        </div>
                    </div>
                    <div className="mb-[20px] h-[40px] truncate text-left font-inter-semibold text-[26px] leading-[40px] lg:mb-[36px] lg:mt-[17px]">
                        {card ? getNameByNftMetadata(card) : <Skeleton.Input className="!h-full" />}
                    </div>
                    <div className="flex gap-x-[50px]">
                        <div className="mr-[16px] flex lg:mr-[25px]">
                            <div className="relative mr-[7px] h-[23px] w-[23px] overflow-hidden rounded-full lg:mr-[15px] lg:h-[44px] lg:w-[44px]">
                                <UserAvatar
                                    className="rounded-full"
                                    principal_or_account={
                                        card?.data?.creator?.userId ?? card?.data?.info.creator
                                    }
                                />
                            </div>
                            <div>
                                <div className="font-inter-normal mb-[4px] text-[12px] leading-[11px] lg:leading-none">
                                    Creator
                                </div>
                                <CopyToClipboard
                                    text={artistPrincipal ?? artistAccountId ?? ''}
                                    onCopy={() => setCopied(true)}
                                >
                                    <div
                                        className="relative flex  shrink-0 cursor-pointer items-center text-sm leading-4 "
                                        onMouseLeave={() => setCopied(false)}
                                    >
                                        <div className="peer flex h-[32px] items-center  leading-normal">
                                            <TooltipCN
                                                placement="top"
                                                title={copied ? 'Copied' : 'Copy'}
                                                overlayInnerStyle={{
                                                    width: '80px',
                                                    textAlign: 'center',
                                                }}
                                            >
                                                {' '}
                                                <span>
                                                    <Username
                                                        openLink={false}
                                                        principal_or_account={
                                                            artistPrincipal || artistAccountId
                                                        }
                                                        className="item-center group relative left-0 cursor-pointer truncate  px-[7px] text-center font-inter-bold text-[12px] font-bold leading-[11px] lg:rounded-[4px]  lg:text-[16px] lg:leading-[32px]"
                                                    />
                                                </span>
                                            </TooltipCN>
                                        </div>
                                    </div>
                                </CopyToClipboard>
                            </div>
                        </div>
                        <div className="mr-[16px] flex lg:mr-[25px]">
                            <div className="relative mr-[7px] h-[23px] w-[23px] rounded-full lg:mr-[15px] lg:h-[44px] lg:w-[44px]">
                                <UserAvatar
                                    className="!min-w-0 !rounded-full"
                                    principal_or_account={
                                        ownerPrincipal ?? ownerAccountId ?? card?.owner.owner
                                    }
                                />
                            </div>
                            <div>
                                <div className="font-inter-normal mb-[4px] text-[12px] leading-[11px] lg:leading-none">
                                    Owner
                                </div>
                                <CopyToClipboard
                                    text={ownerPrincipal ?? ownerAccountId ?? ''}
                                    onCopy={() => setCopied(true)}
                                >
                                    <div
                                        className="relative flex  shrink-0 cursor-pointer items-center text-sm leading-4 "
                                        onMouseLeave={() => setCopied(false)}
                                    >
                                        <TooltipCN
                                            placement="top"
                                            title={copied ? 'Copied' : 'Copy'}
                                            overlayInnerStyle={{
                                                width: '80px',
                                                textAlign: 'center',
                                                backgroundColor: '#283047 !important',
                                            }}
                                        >
                                            <div className="peer flex h-[32px] items-center  leading-normal">
                                                <Username
                                                    principal_or_account={
                                                        ownerPrincipal ?? ownerAccountId
                                                    }
                                                    openLink={false}
                                                    className="item-center group relative left-0 cursor-pointer truncate rounded-[4px] px-[7px] text-center font-inter-bold text-[12px] font-bold leading-[11px] lg:rounded-[4px]  lg:text-[16px] lg:leading-[32px]"
                                                />
                                            </div>
                                        </TooltipCN>
                                    </div>
                                </CopyToClipboard>
                            </div>
                        </div>
                    </div>
                    <NftDetailFunction
                        card={card}
                        refreshCard={refreshCard}
                        refreshListing={refreshListing}
                    />
                </div>
            </div>
            <div className="mb-[20px] mt-[19px] flex items-center md:hidden">
                <div className="mr-[32px] flex cursor-pointer items-center font-inter-medium text-[12px] text-[#8D8D8D]">
                    <img
                        className="mr-[5px] block h-[12px] w-[14px]"
                        src={'/img/market/icon-view.svg'}
                        alt=""
                    />
                    <ShowNumber
                        value={{
                            value: card?.listing?.views,
                            thousand: {
                                symbol: ['M'],
                                comma: true,
                            },
                        }}
                    />
                </div>
            </div>
            <div className="w-full lg:ml-[155px] lg:w-[530px]">
                <NftTabs collection={collection} card={card} metadata={metadata} />
            </div>
            <div className="mb-[13px] font-inter-bold text-[14px] lg:mb-[38px]  lg:text-[22px]">
                Activity
            </div>
            <div className="mb-[20px] block w-full border border-solid border-[#E9E9E9] md:hidden"></div>
            <div className="w-full overflow-scroll lg:m-auto  lg:overflow-hidden">
                <ul className="list-0 mb-[17px] flex w-full text-left lg:px-[48px]">
                    <li className="mr-[10px] min-w-[100px] text-[#999] lg:w-[20%]">Event</li>
                    <li className="mr-[10px] min-w-[100px] font-inter-semibold text-[14px] text-[#999] lg:w-[20%]  lg:text-[#999]">
                        Price
                    </li>
                    <li className="mr-[10px] min-w-[100px] font-inter-semibold text-[14px] text-[#999] lg:w-[20%]  lg:text-[#999]">
                        From
                    </li>
                    <li className="mr-[10px] min-w-[100px] font-inter-semibold text-[14px] text-[#999] lg:w-[20%]  lg:text-[#999]">
                        To
                    </li>
                    <li className="mr-[10px] min-w-[100px] font-inter-semibold text-[14px] text-[#999] lg:w-[20%]  lg:text-[#999]">
                        Time
                    </li>
                </ul>
                {status === 'loading' ? (
                    <Loading />
                ) : status === 'error' ? (
                    <div>Error: {error.message}</div>
                ) : (
                    <NftActivities current={events || []}></NftActivities>
                )}

                <div className={cn(['mt-3 flex w-full justify-center'])}>
                    <ReactPaginate
                        className="flex items-center gap-x-3"
                        previousLabel={
                            <PaginatedPreviousLabel
                                className={cn(curPage === 1 && 'cursor-not-allowed opacity-30')}
                            />
                        }
                        breakLabel="..."
                        nextLabel={
                            <PaginatedNextLabel
                                className={cn(
                                    curPage === all_page && 'cursor-not-allowed opacity-30',
                                )}
                            />
                        }
                        onPageChange={handlePageClick}
                        pageRangeDisplayed={isMobile ? 2 : 5}
                        marginPagesDisplayed={isMobile ? 1 : 5}
                        pageCount={Math.ceil(all_page || 0)}
                        pageClassName="text-sm text-white border h-[24px] min-w-[24px] border-[#36F]/0 flex items-center justify-center cursor-pointer"
                        activeClassName="!border-[#36F] rounded-[4px]"
                        renderOnZeroPageCount={() => !isFetching && !events?.length && <Empty />}
                    />
                </div>
            </div>
        </div>
    );
}

export default MarketNftDetailPage;
