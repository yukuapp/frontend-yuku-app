import { useEffect, useState } from 'react';
import React from 'react';
import { isMobile } from 'react-device-detect';
import ReactPaginate from 'react-paginate';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import ShowNumber from '@/components/data/number';
import TokenPrice from '@/components/data/price';
import Empty from '@/components/ui/empty';
import Loading from '@/components/ui/loading';
import { PaginatedNextLabel, PaginatedPreviousLabel } from '@/components/ui/paginated';
import Username from '@/components/user/username';
import { DashBoard } from '@/views/market/collection/components/dash-board';
import { usePersistentQueryIcpPriceUsd } from '@/hooks/common/price';
import { queryActivity } from '@/utils/apis/yuku/api_data';
import { getLedgerIcpDecimals } from '@/utils/canisters/ledgers/special';
import { ActivityResponse, NFTEvent } from '@/apis/yuku/api_data';
import { cn } from '@/common/cn';
import { sinceNowByByNano } from '@/common/data/dates';
import { exponentNumber } from '@/common/data/numbers';
import { bigint2string, string2bigint } from '@/common/types/bigint';

dayjs.extend(utc);

const Item = ({ activity }: { activity: NFTEvent }) => {
    const icp_price_usd = usePersistentQueryIcpPriceUsd(
        dayjs(Number(bigint2string(string2bigint(activity.created_at) / string2bigint('1000000'))))
            .utc()
            .format('DD-MM-YYYY'),
    );
    const price_usd =
        Number(exponentNumber(activity.token_amount, -getLedgerIcpDecimals())) *
        (icp_price_usd || 0);
    return (
        <div
            className="flex h-[69px] cursor-pointer items-center justify-between gap-x-3 border-b border-[#262E47] md:px-[23px] md:py-[13px] md:hover:shadow-[0_2px_15px_1px_rgba(105,105,105,0.25)] lg:min-w-[900px]"
            key={activity.id}
        >
            <div className="flex flex-1 text-white lg:w-[10%] lg:flex-none">
                {activity.eventType === 'sold' && 'sale'}
                {activity.eventType === 'claim' && 'claim'}
                {activity.eventType === 'list' && 'list'}
            </div>
            <Link
                to={`/market/${activity.canister}/${activity.token_id}`}
                className="flex flex-[2] items-center gap-x-2 overflow-hidden text-white lg:w-[30%] lg:flex-none"
            >
                <div
                    className={cn('h-[41px] w-[41px] rounded-md bg-contain bg-center bg-no-repeat')}
                    style={{
                        backgroundImage: `url('${activity.nft_info.thumbnail_url}')`,
                    }}
                />
                <span
                    className={cn(
                        'overflow-hidden truncate whitespace-nowrap font-inter-semibold text-[14px] text-white',
                    )}
                >
                    {activity.nft_info.token_name}
                </span>
            </Link>
            <div className="flex flex-1 lg:w-[20%] lg:flex-none">
                {activity.token_amount ? (
                    activity.token_amount === '0' ? (
                        <span>--</span>
                    ) : (
                        <div className="flex h-fit flex-col items-start justify-center">
                            <div className="text-white">
                                <TokenPrice
                                    className="font-inter-semibold text-[14px] leading-none "
                                    value={{
                                        value: `${activity.token_amount}` ?? '0',
                                        paddingEnd: 2,
                                        decimals: {
                                            type: 'exponent',
                                            value: getLedgerIcpDecimals(),
                                        },
                                        scale: (v) => (v < 0.01 ? 4 : 2),
                                    }}
                                />
                                <span className="ml-[3px] font-inter-bold text-[14px] text-white md:text-[16px]">
                                    ICP
                                </span>
                            </div>
                            <span className="font-inter-medium text-[14px] text-white/60">
                                $
                                <ShowNumber
                                    className="text-[14px]"
                                    value={{
                                        value: `${price_usd}` ?? '0',
                                        scale: 2,
                                    }}
                                />
                            </span>
                        </div>
                    )
                ) : (
                    <span>--</span>
                )}
            </div>

            <div className="hidden w-[15%] lg:flex">
                <Username
                    className=" font-inter-medium text-[14px] text-white"
                    principal_or_account={activity.from}
                />
            </div>

            <div className="hidden w-[15%] lg:flex">
                <Username
                    className="font-inter-medium text-[14px]"
                    principal_or_account={activity.to}
                />
            </div>

            <div className="hidden w-[10%] font-inter-medium text-[14px] text-white lg:flex">
                {sinceNowByByNano(activity.created_at)}
            </div>
        </div>
    );
};
const Items = ({ current }: { current: NFTEvent[] | undefined }) => {
    return (
        <div className="flex flex-col pt-[20px]">
            {current && current.map((activity) => <Item activity={activity}></Item>)}
        </div>
    );
};

function MarketActivity({ collection }: { collection: string }) {
    const [curPage, setCurPage] = useState<number>(1);
    const limit = 30;
    const queryClient = useQueryClient();

    const { status, data, isFetching, error, isPlaceholderData } = useQuery<
        ActivityResponse,
        Error
    >({
        queryKey: ['collection/activity', collection, curPage, limit],
        queryFn: () =>
            queryActivity({
                canister: collection,
                page: curPage,
                limit,
                collections: collection,
            }),
        keepPreviousData: true,
        staleTime: 5000,
    });
    const list = data?.data;
    const all_page = data?.page.page_count;
    // Prefetch the next page!
    useEffect(() => {
        if (!isPlaceholderData && all_page !== curPage) {
            queryClient.prefetchQuery({
                queryKey: ['collection/activity', collection, curPage + 1, limit],
                queryFn: () =>
                    queryActivity({
                        canister: collection,
                        page: curPage + 1,
                        limit,
                        collections: collection,
                    }),
            });
        }
    }, [data, isPlaceholderData, curPage, all_page, queryClient]);

    const handlePageClick = ({ selected }: { selected: number }) => {
        setCurPage(selected + 1);

        // setOffset(newOffset);
    };

    return (
        <div className="w-full pt-[30px]">
            {status === 'loading' ? (
                <Loading />
            ) : status === 'error' ? (
                <div>Error: {error.message}</div>
            ) : (
                <div className="mt-[80px] w-full overflow-x-scroll px-[15px] md:overflow-x-hidden lg:px-[40px]">
                    <div className="flex w-full items-center justify-between gap-x-3 font-inter-semibold text-[12px] text-[#fff]/60 md:px-[23px] md:text-[14px] lg:min-w-[900px]">
                        <div className="flex flex-1 lg:w-[10%] lg:flex-none">Event</div>
                        <div className="flex flex-[2] lg:w-[30%] lg:flex-none">Item</div>
                        <div className="flex flex-1 lg:w-[20%] lg:flex-none">Price</div>
                        <div className="hidden w-[15%] lg:flex">From</div>
                        <div className="hidden w-[15%] lg:flex">To</div>
                        <div className="hidden w-[10%] lg:flex">Time</div>
                    </div>
                    <div className="mt-[10px] w-auto">{<Items current={list} />}</div>
                    {/* {isFetching ? <span> Loading...</span> : null} */}
                </div>
            )}
            <div className="mt-5 flex items-center">
                <ReactPaginate
                    className="mx-auto flex items-center"
                    previousLabel={
                        <PaginatedPreviousLabel
                            className={cn(curPage === 1 && 'cursor-not-allowed opacity-30')}
                        />
                    }
                    breakLabel="..."
                    nextLabel={
                        <PaginatedNextLabel
                            className={cn(curPage === all_page && 'cursor-not-allowed opacity-30')}
                        />
                    }
                    onPageChange={handlePageClick}
                    pageRangeDisplayed={isMobile ? 2 : 5}
                    marginPagesDisplayed={isMobile ? 1 : 5}
                    pageCount={Math.ceil(all_page || 0)}
                    pageClassName="text-sm text-white border h-[24px] min-w-[24px] border-[#36F]/0 flex items-center justify-center cursor-pointer"
                    activeClassName="!border-[#36F] rounded-[4px]"
                    renderOnZeroPageCount={() => !isFetching && !data?.data.length && <Empty />}
                />
            </div>
        </div>
    );
}
function MarketCollectionActivity({ collection }: { collection: string }) {
    return (
        <div className="flex w-full flex-col justify-center">
            <div className="flex w-full flex-col justify-center">
                <DashBoard collection={collection} />
            </div>
            <MarketActivity collection={collection} />
        </div>
    );
}

export default MarketCollectionActivity;
