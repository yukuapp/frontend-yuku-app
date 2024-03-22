import { MutableRefObject, useEffect, useRef, useState } from 'react';
import { isMobile } from 'react-device-detect';
import ReactPaginate from 'react-paginate';
import { Affix } from 'antd';
import Fuse from 'fuse.js';
import Price from '@/components/data/price';
import FilterButton from '@/components/nft-card/filter/button';
import FilterSearch from '@/components/nft-card/filter/search';
import CloseIcon from '@/components/ui/close-icon';
import Empty from '@/components/ui/empty';
import { PaginatedNextLabel, PaginatedPreviousLabel } from '@/components/ui/paginated';
import { CollectibleCollection, useExploreCollectiblesDataList } from '@/hooks/views/explore';
import { getCollectionStatistics, queryActivity } from '@/utils/apis/yuku/api_data';
import { getLedgerIcpDecimals } from '@/utils/canisters/ledgers/special';
import { CollectionStatistics, NFTEvent } from '@/apis/yuku/api_data';
import { cn } from '@/common/cn';
import { shrinkText } from '@/common/data/text';
import { List, ListSkeleton } from './List';

type ACTIVITY_TYPE = 'ALL' | 'SALES' | 'LIST' | 'CLAIM';

const activity_types: ACTIVITY_TYPE[] = ['ALL', 'SALES', 'LIST', 'CLAIM'];

const CollectionItem = ({
    collection,
    data,
    collections,
    collectionChange,
}: {
    collection: string;
    data: CollectibleCollection;
    collections: MutableRefObject<string>;
    collectionChange: (c: CollectibleCollection) => void;
}) => {
    const [innerStatistic, setInnerStatistic] = useState<CollectionStatistics | undefined>(
        undefined,
    );
    useEffect(() => {
        getCollectionStatistics(collection).then(setInnerStatistic);
    }, [collection]);
    const rate = -1;
    return (
        <div key={data.data.info.name}>
            {
                <div
                    onClick={() => collectionChange(data)}
                    className={cn(
                        'group relative h-[65px] w-full cursor-pointer grid-cols-3 justify-between overflow-x-visible font-inter-semibold text-sm text-white/70',
                    )}
                >
                    <div
                        className={cn(
                            'absolute -left-[12px] -right-[12px] bottom-0 top-0 z-0 rounded-[8px] transition-all duration-200 group-hover:bg-[#283047]',
                            data.data.info.collection === collections.current && 'bg-[#283047]',
                        )}
                    ></div>
                    <div
                        className="absolute grid h-full w-full grid-cols-3 items-center gap-x-[10px]"
                        style={{
                            gridTemplateColumns: '3fr 1fr 1fr',
                        }}
                    >
                        <div className="flex w-full items-center justify-start gap-x-3">
                            <img
                                className="w-[41px] rounded-[8px]"
                                src={data.data.info.logo}
                                alt=""
                            />
                            <div className="truncate">{shrinkText(data.data.info.name, 4, 4)}</div>
                        </div>
                        <div className="text-sm">
                            <Price
                                value={{
                                    value: innerStatistic?.floor,
                                    decimals: {
                                        type: 'exponent',
                                        value: getLedgerIcpDecimals(),
                                    },
                                    symbol: '',
                                    scale: 2,
                                    paddingEnd: undefined,
                                }}
                                className="text-sm lg:text-sm"
                            ></Price>
                            &nbsp;ICP
                        </div>
                        <div
                            className={cn(
                                'flex w-full text-right text-[14px] font-semibold text-[#00AC4F]',
                                rate < 0 && 'text-[#be3636]',
                            )}
                        >
                            <div className="ml-auto w-full max-w-[60px] overflow-hidden text-right">
                                {' '}
                                {(rate < 0 ? '' : '+') + (rate.toFixed(1) + '%')}
                            </div>
                        </div>
                    </div>
                </div>
            }
        </div>
    );
};
const options = {
    keys: ['data.info.name'],
    threshold: 0.2,
};
const FilterBox = ({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) => {
    const { list } = useExploreCollectiblesDataList();

    const [search, setSearch] = useState('');

    const [idOrName, setIdOrName] = useState<string>();
    // console.debug('🚀 ~ FilterBox ~ setIdOrName:', setIdOrName);
    setIdOrName;

    // loading
    const [loading, setLoading] = useState<boolean>(false);

    const [curPage, setCurPage] = useState<number>(1);

    const [pageCount, setPageCount] = useState<number>(10);

    const collections = useRef<string>('');

    const eventTypes = useRef<ACTIVITY_TYPE>('ALL');

    const pageSize = 20;

    const [maxPage, setMaxPage] = useState<number>(10);

    const eventList = useRef<NFTEvent[] | undefined>(undefined);
    const getQueryAllActivity = () => {
        eventList.current = [];
        setLoading(true);
        const str = {
            id_or_name: idOrName,
            page: curPage,
            limit: pageSize,
            eventTypes:
                eventTypes.current === 'ALL'
                    ? ''
                    : eventTypes.current === 'SALES'
                    ? 'sold'
                    : eventTypes.current.toLocaleLowerCase(),
            collections: collections.current,
        };
        queryActivity(str)
            .then((res) => {
                setMaxPage(res.page.page_count);
                setPageCount(res.page.all_count / pageSize);
                eventList.current = res.data;
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        getQueryAllActivity();
    }, [curPage]);

    const eventTypesChange = (t: ACTIVITY_TYPE) => {
        eventTypes.current = t;
        setCurPage(1);
        getQueryAllActivity();
    };

    const handlePageClick = ({ selected }: { selected: number }) => {
        setCurPage(selected + 1);
    };

    const collectionChange = (c: CollectibleCollection) => {
        if (collections.current === c.data.info.collection) {
            collections.current = '';
            setCurPage(1);
            getQueryAllActivity();
        } else {
            collections.current = c.data.info.collection;
            setCurPage(1);
            getQueryAllActivity();
        }
    };
    let filterList;
    if (list === undefined) {
        filterList = undefined;
    } else {
        if (search !== '') {
            const fuse = new Fuse(list, options);
            filterList = fuse.search(search).map((f) => f.item);
        } else {
            filterList = list;
        }
    }
    return (
        <>
            <div className="relative flex w-full overflow-visible">
                <Affix offsetTop={50}>
                    <div
                        className={cn(
                            'invisible fixed left-0 top-[0px] z-10 mr-[0] mt-[30px] box-border h-full w-0 border-common bg-[#101522] pb-9 pt-6 opacity-0 transition-all duration-200  lg:sticky  lg:h-[calc(100vh-100px)] lg:rounded-[16px] lg:border-[2px]',
                            open && 'visible mr-[30px] w-full opacity-100 lg:w-[357px]',
                        )}
                    >
                        <div className="relative px-5">
                            <div className="font-inter-semibold text-base ">Event Type</div>
                            <CloseIcon
                                className="absolute right-[20px] top-0 flex lg:hidden"
                                onClick={() => setOpen(false)}
                            />
                            <div className="mt-[19px] flex w-full justify-between font-inter-semibold text-sm">
                                {activity_types.map((t, index) => (
                                    <div
                                        key={index}
                                        onClick={() => eventTypesChange(t)}
                                        className={cn(
                                            'h-9 w-fit min-w-[68px] cursor-pointer rounded-lg border bg-[#283047] px-[15px] text-center capitalize leading-9 transition-all duration-300 hover:bg-[#3366FF]',
                                            eventTypes.current === t && 'bg-[#3366FF] text-white',
                                        )}
                                    >
                                        {t.toLocaleLowerCase()}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-[30px] font-inter-semibold text-base">
                                Collections
                            </div>
                            <FilterSearch
                                search={search}
                                setSearch={setSearch}
                                className="mt-[10px] w-full"
                            ></FilterSearch>
                        </div>

                        <div className="mt-[31px]">
                            <div
                                style={{ gridTemplateColumns: '3fr 1fr 1fr' }}
                                className="grid w-full grid-cols-3 justify-between gap-x-[10px] px-5 font-inter-semibold text-sm text-white/70"
                            >
                                <div>Collection</div>
                                <div>Floor</div>
                                <div className="text-right">24H</div>
                            </div>

                            <div className="mt-[20px] h-[calc(100vh-350px)] w-full overflow-x-hidden overflow-y-scroll px-5 lg:h-[calc(100vh-390px)]">
                                {filterList?.map((c) => (
                                    <CollectionItem
                                        collection={c.data.info.collection}
                                        data={c}
                                        collections={collections}
                                        collectionChange={collectionChange}
                                    ></CollectionItem>
                                ))}
                            </div>
                        </div>
                    </div>
                </Affix>

                <div className="ml-0 mt-[30px] flex flex-1 flex-col duration-300">
                    <div className="flex w-full">
                        <div className="mr-[15px] hidden w-[90px] flex-shrink-0 font-['Inter'] text-sm font-semibold text-white text-opacity-70 md:w-[100px] lg:flex">
                            Action
                        </div>
                        <div className="mr-[15px] flex-[1] flex-shrink-0 font-['Inter'] text-sm font-semibold text-white text-opacity-70">
                            Item
                        </div>
                        <div className="flex flex-shrink-0 md:min-w-[150px]">
                            <div className="flex flex-shrink-0 font-['Inter'] text-sm font-semibold text-white text-opacity-70 md:mr-[15px] md:w-[150px] 2xl:w-[230px] 3xl:w-[350px]">
                                Price
                                <div className="mx-[5px] flex md:hidden">/</div>
                            </div>
                            <div className="mr-[15px] hidden w-[150px] flex-shrink-0 font-['Inter'] text-sm font-semibold text-white text-opacity-70 xl:flex 2xl:w-[230px] 3xl:w-[350px]">
                                From
                            </div>
                            <div className="mr-[15px] hidden w-[150px] flex-shrink-0 font-['Inter'] text-sm font-semibold text-white text-opacity-70 xl:flex 2xl:w-[230px] 3xl:w-[350px]">
                                To
                            </div>
                            <div className="flex flex-shrink-0 justify-end font-['Inter'] text-sm font-semibold text-white text-opacity-70 md:mr-[15px] md:w-[90px] xl:w-[100px]">
                                Time
                            </div>
                        </div>
                    </div>

                    {typeof eventList === 'undefined' || loading
                        ? new Array(20).fill('').map((_, index) => <ListSkeleton key={index} />)
                        : eventList.current?.map((item, index) => (
                              <List itemData={item} key={index}></List>
                          ))}

                    <div className="mb-[30px] mt-[30px] flex w-full items-center justify-center">
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
                </div>
            </div>
        </>
    );
};

export default function ActivityMainPage({ show }: { show: boolean }) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!isMobile) {
            setOpen(true);
        }
    }, []);

    if (!show) {
        return <></>;
    }

    return (
        <>
            <FilterButton open={open} setOpen={setOpen} />
            <FilterBox open={open} setOpen={setOpen}></FilterBox>
        </>
    );
}
