import { useCallback, useEffect, useState } from 'react';
import { useInterval } from 'usehooks-ts';
import TokenPrice from '@/components/data/price';
import Usd from '@/components/data/usd';
import NftName from '@/components/nft/name';
import NftThumbnail from '@/components/nft/thumbnail';
import Empty from '@/components/ui/empty';
import Loading from '@/components/ui/loading';
import PaginatedItems from '@/components/ui/paginated';
import { queryAllAuctionOfferList } from '@/utils/canisters/yuku-old/core';
import { AuctionOffer } from '@/canisters/yuku-old/yuku_core';
import { cdn } from '@/common/cdn';
import { cn } from '@/common/cn';
import { sinceNowByByNano } from '@/common/data/dates';
import { isPrincipalText } from '@/common/ic/principals';
import { uniqueKey } from '@/common/nft/identifier';
import { FirstRenderByData } from '@/common/react/render';
import { Spend } from '@/common/react/spend';

type AuctionType = 'ALL' | 'ICP' | 'OGY';

const auctionTypes: AuctionType[] = ['ALL', 'ICP', 'OGY'];

const loadUserActivityList = (
    principal: string | undefined,
    setList: (list: AuctionOffer[]) => void,
    setLoading?: (loading: boolean) => void,
) => {
    if (!principal) return setList([]);

    setLoading && setLoading(true);

    const spend = Spend.start(`profile auction`);
    queryAllAuctionOfferList(principal)
        .then((list) => {
            // console.warn(`🚀 ~ file: auction.tsx:16 ~ .then ~ list:`, list);
            spend.mark(`${list.length}`);
            list.reverse();
            setList(list);
        })
        .catch((e) => {
            console.error('queryAllAuctionOfferList failed', e);
            if (isPrincipalText(principal)) setList([]);
            else throw e;
        })
        .finally(() => {
            setLoading && setLoading(false);
        });
};

const showPrice = (price: string, offer: AuctionOffer) => {
    return price ? (
        offer.price === '0' ? (
            <span>--</span>
        ) : (
            <>
                <TokenPrice
                    className="font-inter-semibold text-[14px] text-white"
                    value={{
                        value: offer.price ?? '0',
                        decimals: {
                            type: 'exponent',
                            value: offer.token.decimals === '8' ? 8 : 8,
                        },
                        scale: (v) => (v < 0.01 ? 4 : 2),
                        symbol: offer.token.symbol,
                    }}
                />
                {offer.token.symbol && (
                    <span className="font-inter-medium text-[14px] text-white/60">
                        &nbsp;≈&nbsp;
                        <Usd
                            value={{
                                value: offer.price ?? '0',
                                decimals: {
                                    type: 'exponent',
                                    value: offer.token.decimals === '8' ? 8 : 8,
                                },
                                symbol: offer.token.symbol,
                                scale: 2,
                            }}
                        />
                    </span>
                )}
            </>
        )
    ) : (
        <span>--</span>
    );
};

const Items = ({ current }: { current: AuctionOffer[] | undefined }) => {
    return (
        <div className="px-3">
            {current &&
                current.map((offer) => (
                    <div
                        className="grid grid-cols-6 items-center gap-x-3"
                        key={uniqueKey(offer.token_id)}
                    >
                        <div className="flex items-center gap-x-2">
                            <NftThumbnail
                                width="w-[41px]"
                                token_id={offer.token_id}
                                cdn_width={100}
                            />
                            <NftName token_id={offer.token_id} />
                        </div>
                        <div>{showPrice(offer.price, offer)}</div>
                        <div>
                            {offer.status === 'accepted' ? (
                                showPrice(offer.price, offer)
                            ) : (
                                <span>--</span>
                            )}
                        </div>{' '}
                        <div className="font-inter-medium text-xs text-white/60">
                            {sinceNowByByNano(offer.time)}
                        </div>
                        <div className="font-inter-regular text-xs text-white">{offer.status}</div>
                    </div>
                ))}
        </div>
    );
};

function ProfileAuction({ showed, principal }: { showed: boolean; principal: string | undefined }) {
    // console.debug('profile auction', principal);
    // const [start] = useState(Date.now());

    const [loading, setLoading] = useState(false);
    const [list, setList] = useState<AuctionOffer[] | undefined>(undefined);
    const [filterList, setFilterList] = useState<AuctionOffer[] | undefined>(undefined);

    const [once_load] = useState(new FirstRenderByData());
    useEffect(() => {
        once_load.once([principal], () => loadUserActivityList(principal, setList, setLoading));
    }, [principal]);
    const silenceRefreshList = useCallback(() => {
        if (!showed) return;
        loadUserActivityList(principal, setList);
    }, [showed, principal]);
    useInterval(silenceRefreshList, 15000);

    const wrappedLoading = list === undefined || (list.length === 0 && loading);

    if (!wrappedLoading) {
        // const end = Date.now();
        // console.debug('Profile Auction spend', `${end - start}ms`);
    }
    const [activeTab, setActiveTab] = useState<AuctionType>('ALL');
    //list filter
    useEffect(() => {
        if (activeTab === 'ALL') {
            setFilterList(list);
            return;
        } else {
            const newList = list?.filter((item) => {
                return item.token.symbol.toLocaleLowerCase() === activeTab.toLocaleLowerCase();
            });
            setFilterList(newList);
        }
    }, [activeTab, list]);
    // img
    const auctionTab = {
        all: '',
        icp: '',
        ogy: '',
    };

    if (!showed) return <></>;
    return (
        <div className="pt-3">
            <div className="flex gap-x-2">
                {auctionTypes.map((type) => (
                    <div
                        key={type}
                        onClick={() => setActiveTab(type)}
                        className={cn([
                            'flex cursor-pointer items-center gap-x-1 rounded-lg border border-gray-300 px-2 py-1 text-sm font-medium',
                            type === activeTab && 'bg-black text-white',
                        ])}
                    >
                        <img
                            className="h-4 w-4 "
                            src={cdn(auctionTab[type.toLocaleLowerCase()])}
                            alt=""
                        />
                        <div className="text-white">{type}</div>
                    </div>
                ))}
            </div>
            {wrappedLoading && <Loading />}
            {!wrappedLoading && filterList === undefined && <></>}
            {!wrappedLoading && filterList !== undefined && filterList.length === 0 && <Empty />}
            {!wrappedLoading && filterList !== undefined && filterList.length !== 0 && (
                <>
                    <div className="w-full">
                        <div className="grid w-full grid-cols-6 gap-x-3  px-3 text-sm font-semibold leading-10 text-[#999]">
                            <div>Item</div>
                            <div className="text-left">Price</div>
                            <div className="text-left">Bid price</div>
                            <div className="text-left">Date</div>
                            <div className="text-left">Stats</div>
                            <div className="text-left">Option</div>
                        </div>

                        <PaginatedItems
                            className="mt-[65px]"
                            size={10}
                            list={filterList}
                            Items={Items}
                        />
                    </div>
                </>
            )}
        </div>
    );
}

export default ProfileAuction;
