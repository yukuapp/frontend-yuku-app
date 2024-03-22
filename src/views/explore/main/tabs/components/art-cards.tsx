import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Skeleton } from 'antd';
import _ from 'lodash';
import { useWindowSize } from 'usehooks-ts';
import TokenPrice from '@/components/data/price';
import { IconLogoLedgerIcp } from '@/components/icons';
import BuyModal from '@/components/nft-card/components/buy';
import { ShowNftOwnerAvatar } from '@/components/nft/avatar';
import { ShowNftThumbnail } from '@/components/nft/thumbnail';
import AspectRatio from '@/components/ui/aspect-ratio';
import { useBuyNftByTransaction } from '@/hooks/exchange/single/buy';
import { useNftListing } from '@/hooks/interval/nft/listing';
import { useTokenRate } from '@/hooks/interval/token_rate';
import { useNftPath } from '@/hooks/nft/link';
import { useExportArtCards } from '@/hooks/views/explore';
import { getNameByNftMetadata } from '@/utils/nft/metadata';
import { cn } from '@/common/cn';
import { parseLowerCaseSearch } from '@/common/data/search';
import { uniqueKey } from '@/common/nft/identifier';
import { sortCardsByPrice } from '@/common/nft/sort';
import { justPreventLink, preventLink } from '@/common/react/link';
import { NftListingData } from '@/types/listing';
import { NftMetadata } from '@/types/nft';

export type ExploreArtSortOption = 'price_low_to_high' | 'price_high_to_low' | 'favorited';
export const EXPLORE_ART_SORT_OPTIONS: { value: ExploreArtSortOption; label: string }[] = [
    { value: 'price_low_to_high', label: 'Price: Low to High' },
    { value: 'price_high_to_low', label: 'Price: High to Low' },
    { value: 'favorited', label: 'Most favorited' },
];

function ArtLoading() {
    return (
        <div className="flex flex-col overflow-hidden rounded-[8px] shadow-lg">
            <Skeleton.Image className="!h-[160px] !w-full !rounded-[0px] md:!h-[300px]" />
            <div className="w-full bg-[#283047] px-[10px] pb-[23px] pt-[12px]">
                <div className="flex w-full items-center">
                    <Skeleton.Button className="!h-[20px] !w-[20px] !min-w-0 !rounded-[4px] md:!rounded-[8px] lg:!h-[25px] lg:!w-[25px] xl:!h-[33px] xl:!w-[33px]" />
                    <Skeleton.Input className="ml-1 !h-4 !w-[50%] !min-w-0" />
                </div>
                <div className="mt-[6px] flex items-center justify-between">
                    <Skeleton.Input className="!h-4 !w-[50%] !min-w-0" />
                    <Skeleton.Button className="!h-[30px] !rounded-[4px]" />
                </div>
            </div>
        </div>
    );
}

function ArtCard({
    card,
    updateItem,
}: {
    card: NftMetadata;
    updateItem: (card: NftMetadata) => void;
}) {
    const path = useNftPath(card);

    const { listing, refresh } = useNftListing(card, 25000);
    useEffect(() => updateItem(card), [listing]);

    const { buy, action: buyAction } = useBuyNftByTransaction();
    const [buyNft, setBuyNft] = useState<
        { card: NftMetadata; listing: NftListingData } | undefined
    >(undefined);
    const onBuy = () => {
        if (card === undefined || card.listing === undefined) return;
        setBuyNft({
            card,
            listing: card.listing,
        });
    };
    const onCleanBuyNft = () => setBuyNft(undefined);

    const update = () => refresh();

    return (
        <Link
            to={path}
            className="flex flex-col overflow-hidden rounded-[8px] border border-[#283047] shadow-lg"
        >
            <AspectRatio ratio={1} className="relative flex w-full items-center justify-center">
                <ShowNftThumbnail card={card} />
            </AspectRatio>
            <div className="bg-[#191E2E] px-[10px] pb-[15px] pt-[12px] md:pb-[23px]">
                <div className="flex items-center">
                    <div
                        className="relative flex h-[20px] w-[20px] items-center lg:h-[25px] lg:w-[25px] xl:h-[33px] xl:w-[33px]"
                        onClick={justPreventLink}
                    >
                        <ShowNftOwnerAvatar card={card} link={false} />
                    </div>
                    <p className="ml-[6px] flex text-[12px] text-[#fff] md:text-[14px]">
                        {getNameByNftMetadata(card)}
                    </p>
                </div>
                <div
                    className="mt-[6px] flex items-center justify-between"
                    onClick={justPreventLink}
                >
                    {listing?.listing.type === 'listing' && (
                        <>
                            <div className="flex items-center gap-x-[10px]">
                                <IconLogoLedgerIcp className="h-[18px] w-[18px]" />
                                <TokenPrice
                                    className="ml-0 text-[12px] text-white md:text-[16px]"
                                    value={{
                                        value: listing.listing.price,
                                        token: listing.listing.token,
                                        symbol: '',
                                    }}
                                />
                            </div>
                            <strong
                                className={cn(
                                    'hidden h-[25px] cursor-pointer items-center rounded-[4px] bg-[#36F] px-1.5 text-[14px] font-semibold text-white md:h-[30px] md:px-3',
                                    'flex',
                                )}
                                onClick={preventLink(onBuy)}
                            >
                                Buy Now
                            </strong>
                        </>
                    )}
                </div>
                {buyNft && (
                    <BuyModal
                        card={buyNft.card}
                        listing={buyNft.listing}
                        buy={buy}
                        action={buyAction}
                        refreshListing={update}
                        onClose={onCleanBuyNft}
                    />
                )}
            </div>
        </Link>
    );
}

const artFilterList = (
    cards: NftMetadata[] | undefined,
    search: string,
    sort: ExploreArtSortOption,
    icp_usd: string | undefined,
    ogy_usd: string | undefined,
) => {
    if (cards === undefined) return cards;
    let list = [...cards];

    const s = parseLowerCaseSearch(search);
    if (s) {
        list = list.filter((c) => c.metadata.metadata.name.toLowerCase().indexOf(s) > -1);
    }

    if (list.length > 1) {
        switch (sort) {
            case 'price_low_to_high':
                list = sortCardsByPrice(list, sort, icp_usd, ogy_usd);
                break;
            case 'price_high_to_low':
                list = sortCardsByPrice(list, sort, icp_usd, ogy_usd);
                break;
            // case 'viewed':
            //     list = _.sortBy(list, [(s) => s.listing?.views && -s.listing.views]);
            //     break;
            case 'favorited':
                list = _.sortBy(list, [
                    (s) => s.listing?.favorited?.length && -s.listing.favorited.length,
                ]);
                break;
            default:
                break;
        }
    }

    return list;
};

const ARTIST_ROWS = 3;

export function ArtCardList({ search, sort }: { search: string; sort: ExploreArtSortOption }) {
    // view more count
    // back to top anchor
    const artistListElement = useRef<HTMLDivElement>(null);

    const [resort, setResort] = useState(0);
    const doResort = useCallback(() => setResort((resort) => resort + 1), []);

    const cards = useExportArtCards();

    const { icp_usd, ogy_usd } = useTokenRate();

    const filteredCards = useMemo(
        () => artFilterList(cards, search, sort, icp_usd, ogy_usd),
        [cards, search, sort, resort],
    );

    const [step, setStep] = useState<number>(6);
    const [currentAmount, setCurrentAmount] = useState<number>(step);

    const size = useWindowSize();

    useEffect(() => {
        const width = size.width;

        if (!width) {
            return;
        }
        if (width < 1024) {
            setStep(2 * ARTIST_ROWS);
            setCurrentAmount(2 * ARTIST_ROWS);
            return;
        }
        if (width < 1440) {
            setStep(3 * ARTIST_ROWS);
            setCurrentAmount(3 * ARTIST_ROWS);
            return;
        }
        if (width < 1920) {
            setStep(4 * ARTIST_ROWS);
            setCurrentAmount(4 * ARTIST_ROWS);
            return;
        }
        setStep(5 * ARTIST_ROWS);
        setCurrentAmount(5 * ARTIST_ROWS);
        // sm: '640px',
        //     // => @media (min-width: 640px) { ... }

        //     md: '768px',
        //     // => @media (min-width: 768px) { ... }

        //     lg: '1024px',
        //     // => @media (min-width: 1024px) { ... }

        //     xl: '1440px',
        //     // => @media (min-width: 1280px) { ... }
        //     '2xl': '1920px',
        //     '3xl': '2550px',
    }, [size]);
    const spliced =
        filteredCards !== undefined
            ? [...filteredCards].splice(0, Math.min(currentAmount, filteredCards.length))
            : undefined;

    return (
        <>
            <div
                ref={artistListElement}
                className="mt-[30px] grid w-full max-w-[1440px] grid-cols-2 gap-x-[15px] gap-y-[15px] md:mx-auto md:mt-[100px] md:gap-x-[32px] md:gap-y-[25px] lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
            >
                {spliced === undefined
                    ? new Array(currentAmount)
                          .fill('')
                          .map((_, index) => <ArtLoading key={index} />)
                    : spliced
                          ?.slice(0, currentAmount)
                          .map((card) => (
                              <ArtCard
                                  key={uniqueKey(card.owner.token_id)}
                                  card={card}
                                  updateItem={doResort}
                              />
                          ))}
            </div>
            <div className="relative mt-[40px] flex w-full justify-center font-inter">
                {filteredCards && spliced && spliced.length < filteredCards.length && (
                    <div
                        onClick={() => {
                            spliced?.length && setCurrentAmount((current) => current + step);
                        }}
                        className={cn(
                            'mx-auto  block cursor-pointer rounded-[8px] border border-white px-[30px] text-center text-xl font-bold leading-[48px] text-white',
                        )}
                    >
                        View More
                    </div>
                )}

                <div
                    className={cn(
                        'absolute right-0 top-0 ml-auto hidden h-[24px] w-[24px] cursor-pointer bg-no-repeat hover:opacity-50',
                        spliced?.length === currentAmount && 'block',
                    )}
                    onClick={() => {
                        window.scrollTo({
                            top: artistListElement.current?.clientTop || 0,
                            behavior: 'smooth',
                        });
                    }}
                    style={{
                        backgroundImage: ``,
                    }}
                ></div>
            </div>
        </>
    );
}
