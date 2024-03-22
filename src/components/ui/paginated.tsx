import { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import ReactPaginate from 'react-paginate';
import _ from 'lodash';
import { useWindowSize } from 'usehooks-ts';
import { cn } from '@/common/cn';
import Empty from './empty';

export const PaginatedNextLabel = ({ className }: { className?: string }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="11"
            height="8"
            viewBox="0 0 11 8"
            fill="none"
            className={cn('h-3 w-3', className)}
        >
            <g clip-path="url(#clip0_2288_8492)">
                <path
                    d="M3.05502 7.25343C3.00705 7.29378 2.96889 7.3422 2.94282 7.39577C2.91676 7.44935 2.90332 7.50697 2.90332 7.5652C2.90332 7.62343 2.91676 7.68105 2.94282 7.73463C2.96889 7.7882 3.00705 7.83662 3.05502 7.87697C3.15353 7.95997 3.28495 8.00633 3.4217 8.00633C3.55844 8.00633 3.68987 7.95997 3.78837 7.87697L7.93454 4.34997C7.9825 4.30962 8.02066 4.2612 8.04673 4.20763C8.0728 4.15406 8.08623 4.09643 8.08623 4.03821C8.08623 3.97998 8.0728 3.92235 8.04673 3.86878C8.02066 3.81521 7.9825 3.76679 7.93454 3.72644L3.78838 0.199428C3.68988 0.116434 3.55845 0.0700684 3.42171 0.0700684C3.28496 0.0700684 3.15353 0.116434 3.05503 0.199428C3.00706 0.239785 2.9689 0.288201 2.94283 0.341774C2.91677 0.395347 2.90333 0.452975 2.90333 0.511201C2.90333 0.569428 2.91677 0.627055 2.94283 0.680629C2.9689 0.734202 3.00706 0.782618 3.05503 0.822975L6.83582 4.03821L3.05566 7.25343L3.05502 7.25343Z"
                    fill="white"
                />
            </g>
            <defs>
                <clipPath id="clip0_2288_8492">
                    <rect
                        width="9.07001"
                        height="7.93626"
                        fill="white"
                        transform="translate(0.959961 0.0700684)"
                    />
                </clipPath>
            </defs>
        </svg>
    );
};

export const PaginatedPreviousLabel = ({ className }: { className?: string }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="10"
            height="8"
            viewBox="0 0 10 8"
            fill="none"
            className={cn('h-3 w-3', className)}
        >
            <g clip-path="url(#clip0_2288_8490)">
                <path
                    d="M6.97476 7.25343C7.02273 7.29378 7.06089 7.3422 7.08696 7.39577C7.11303 7.44935 7.12647 7.50697 7.12647 7.5652C7.12647 7.62343 7.11303 7.68105 7.08696 7.73463C7.06089 7.7882 7.02273 7.83662 6.97476 7.87697C6.87626 7.95997 6.74483 8.00633 6.60809 8.00633C6.47134 8.00633 6.33992 7.95997 6.24141 7.87697L2.09525 4.34997C2.04728 4.30962 2.00912 4.2612 1.98305 4.20763C1.95699 4.15406 1.94355 4.09643 1.94355 4.03821C1.94355 3.97998 1.95699 3.92235 1.98305 3.86878C2.00912 3.81521 2.04728 3.76679 2.09525 3.72644L6.2414 0.199428C6.33991 0.116434 6.47133 0.0700684 6.60808 0.0700684C6.74482 0.0700684 6.87625 0.116434 6.97475 0.199428C7.02272 0.239785 7.06088 0.288201 7.08695 0.341774C7.11302 0.395347 7.12646 0.452975 7.12646 0.511201C7.12646 0.569428 7.11302 0.627055 7.08695 0.680629C7.06088 0.734202 7.02272 0.782618 6.97475 0.822975L3.19397 4.03821L6.97413 7.25343L6.97476 7.25343Z"
                    fill="#C6C6C6"
                />
            </g>
            <defs>
                <clipPath id="clip0_2288_8490">
                    <rect
                        width="9.07001"
                        height="7.93626"
                        fill="white"
                        transform="matrix(-1 8.74228e-08 8.74228e-08 1 9.06982 0.0700684)"
                    />
                </clipPath>
            </defs>
        </svg>
    );
};

function PaginatedItems<T>({
    size,
    list,
    Items,
    refreshList,
    updateItem,
    className,
}: {
    size: number | ((width: number) => number) | [number, number][];
    list: T[] | undefined;
    Items: React.FunctionComponent<{
        current: T[] | undefined;
        refreshList?: () => void;
        updateItem?: (item: T) => void;
        size?: number;
        curPage?: number;
    }>;
    refreshList?: () => void;
    updateItem?: (item: T) => void;
    className?: string;
}) {
    const { width } = useWindowSize();

    const [pageSize, setPageSize] = useState(10);
    useEffect(() => {
        if (typeof size === 'number') return setPageSize(size);
        if (typeof size === 'function') return setPageSize(size(width));
        if (_.isArray(size)) {
            return setPageSize(() => {
                for (const item of size) {
                    if (item[0] <= width) return item[1];
                }
                return 10;
            });
        }
        setPageSize(10);
    }, [size, width]);

    const wrappedList = list ?? [];

    const [offset, setOffset] = useState(0);

    const endOffset = offset + pageSize;
    const current = wrappedList.slice(offset, endOffset);
    const pageCount = Math.ceil(wrappedList.length / pageSize);
    const [curPage, setCurPage] = useState(0);
    const maxPage = Math.ceil(wrappedList.length / pageSize) - 1;

    const handlePageClick = ({ selected }: { selected: number }) => {
        setCurPage(selected);
        const newOffset = (selected * pageSize) % wrappedList.length;
        setOffset(newOffset);
    };

    useEffect(() => {
        if (!list) return;
        if (offset < list.length) return;
        setOffset(0);
        setCurPage(0);
    }, [list, offset]);

    return (
        <>
            <Items
                current={list ? current : undefined}
                refreshList={refreshList}
                updateItem={updateItem}
                size={pageSize}
                curPage={curPage}
            />
            {list && (
                <div className={cn(['mt-3 flex w-full justify-center'], className)}>
                    <ReactPaginate
                        className="flex items-center gap-x-3"
                        previousLabel={
                            <PaginatedPreviousLabel
                                className={cn(curPage === 0 && 'cursor-not-allowed opacity-30')}
                            />
                        }
                        breakLabel="..."
                        nextLabel={
                            <PaginatedNextLabel
                                className={cn(
                                    curPage === maxPage && 'cursor-not-allowed opacity-30',
                                )}
                            />
                        }
                        onPageChange={handlePageClick}
                        pageRangeDisplayed={isMobile ? 2 : 5}
                        marginPagesDisplayed={isMobile ? 1 : 5}
                        pageCount={Math.ceil(pageCount)}
                        pageClassName="text-sm text-white border h-[24px] min-w-[24px] border-[#36F]/0 flex items-center justify-center cursor-pointer"
                        activeClassName="!border-[#36F] rounded-[4px]"
                        renderOnZeroPageCount={() => <Empty />}
                    />
                </div>
            )}
        </>
    );
}

export default PaginatedItems;
