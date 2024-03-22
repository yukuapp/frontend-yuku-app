import dayjs from 'dayjs';
import _ from 'lodash';
import { parse_nft_identifier, parse_token_identifier } from '@/common/nft/ext';
import { NftIdentifier } from '@/types/nft';

// Get the price of ICP on a specific date
export const getICPPriceOnDate = async (date: string): Promise<number> => {
    try {
        const r = await fetch(
            `https://api.coingecko.com/api/v3/coins/internet-computer/history?date=${date}&localization=false`,
        );
        const json = await r.json();
        if (json.market_data) {
            const priceUSD = json.market_data.current_price.usd;
            return priceUSD;
        } else {
            throw new Error(`can't get ICP price`);
        }
    } catch (error) {
        throw new Error(`${error}`);
    }
};

export type HomeBanner = {
    name: string;
    image: string;
    link:
        | {
              type: 'outside';
              url: string; // Any URL link, full path
              target?: '_blank'; // Whether to open in a new page
          }
        | {
              type: 'market';
              collection: string; // Collection canister ID
              target?: '_blank'; // Whether to open in a new page
          }
        | {
              type: 'launchpad';
              collection: string; // Collection canister ID
              target?: '_blank'; // Whether to open in a new page
          };
};

export const queryHomeBanners = async (backend_host: string): Promise<HomeBanner[]> => {
    const r = await fetch(`${backend_host}/home_banner`);
    const json = await r.json();
    return json.data;
};

// =================== Home Hot NFT Collections ===================
export type HomeHotCollection = {
    info: {
        collection: string; // ? canisterId ->
        name: string;
        description: string;
        logo: string;
        banner: string;
        featured: string;
    };
};

export const queryHomeHotCollections = async (
    backend_host: string,
): Promise<HomeHotCollection[]> => {
    const r = await fetch(`${backend_host}/hot_collection`);
    const json = await r.json();
    return json?.data.map((d: any) => ({
        info: {
            collection: d.info.canisterId,
            name: d.info.name,
            description: d.info.description,
            logo: d.info.logo,
            banner: d.info.banner,
            featured: d.info.featured,
        },
    }));
};

// =================== Home Featured Artworks ===================

export type HomeFeaturedArtwork = {
    token_id: NftIdentifier;
    metadata: {
        metadata: {
            name: string;
            url: string;
            description: string;
        };
    };
    creator: {
        principal: string;
        username: string;
        avatar: string;
    };
};

export const queryHomeFeaturedArtworks = async (
    backend_host: string,
): Promise<HomeFeaturedArtwork[]> => {
    const r = await fetch(`${backend_host}/featured_artwork`);
    const json = await r.json();
    return json.map((d: any) => ({
        token_id: {
            collection: d.collectionData.canisterId,
            token_identifier: parse_token_identifier(
                d.collectionData.canisterId,
                d.collectionData.tokenIndex,
            ),
        },
        metadata: {
            metadata: {
                name: d.metadata.name,
                url: d.metadata.url,
                description: d.metadata.description,
            },
        },
        creator: {
            principal: d.creator.userId,
            username: d.creator.userName,
            avatar: d.creator.avatar,
        },
    }));
};

// ================================= Query Token Exchange Price =================================

export type TokenExchangePrice = {
    symbol: string;
    price: string;
    priceChange: string | number;
    priceChangePercent: string | number;
};

export const queryTokenExchangePriceList = async (
    backend_host: string,
): Promise<TokenExchangePrice[]> => {
    const usdPrice = await fetch(`${backend_host}/exchange/price`);
    const json = await usdPrice.json();
    if (json.code === 200 && json.msg === 'success') {
        return json.data;
    } else {
        console.error(json.msg, 'queryExchangePrice failed');
        return [];
    }
};

// ================================= Query USD Rate of a Specific Token =================================
// ICP OGY
export const queryTokenUsdRate = async (
    backend_host: string,
    symbol: string,
): Promise<string | undefined> => {
    const r = await fetch(`${backend_host}/exchange/price?symbol=${symbol}`);
    const json = await r.json();
    if (json.code === 200 && json.msg === 'success') {
        return `${json.data}`;
    }
    console.error('can not get ICP price', json);
    return undefined;
};

// ================================= Whitelist JWT Token Functionality =================================
export const queryWhitelistJwtToken = async (
    backend_host: string,
    collection: string,
): Promise<string> => {
    const r = await fetch(
        `${backend_host}/qrcode/get_token?canister_id=${collection}` /* cspell: disable-line */,
    );
    const json = await r.json();
    if (json.code === 200) return json.data.data.jwt_token;
    console.error('can not get queryWhitelistJwtToken', json);
    throw new Error(`query token failed`);
};

// =================== Launchpad Whitelist ===================
export const doLaunchpadAddWhitelist = async (
    backend_host: string,
    collection: string,
    account: string,
): Promise<void> => {
    const token = await queryWhitelistJwtToken(backend_host, collection);
    const r = await fetch(`${backend_host}/qrcode/whitelist` /* cspell: disable-line */, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jwt_token: token,
            canister_id: collection,
            account_id: account,
        }),
    });
    const json = await r.json();
    if (json.code === 200) return json.data.data.jwt_token;
    console.error('can not get doLaunchpadAddWhitelist', json);
    throw new Error(`add launchpad whitelist failed`);
};

// =================== OAT Whitelist ===================
export const doOatAddWhitelist = async (
    backend_host: string,
    collection: string,
    event_id: string,
    account: string,
): Promise<void> => {
    const token = await queryWhitelistJwtToken(backend_host, collection);
    const r = await fetch(`${backend_host}/qrcode/oat_whitelist` /* cspell: disable-line */, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jwt_token: token,
            event_id: event_id,
            account_id: account,
        }),
    });
    const json = await r.json();
    if (json.code === 200) return json.data.data.jwt_token;
    console.error('can not get doOatAddWhitelist', json);
    throw new Error(`add oat whitelist failed`);
};

// =================== Query Floor Price of a Specific Collection ===================
export type CollectionStatistics = {
    supply: number; // Total supply
    owners: number; // Number of owners
    floor: string; // Floor price
    volume: string; // Total trading volume
    rate: number; // Price change
};

export const getCollectionStatistics = async (
    backend_host: string,
    collection: string,
): Promise<CollectionStatistics | undefined> => {
    return new Promise((resolve, reject) => {
        fetch(`${backend_host}/collection/${collection}`)
            .then((r) => r.json())
            .then((json) => {
                resolve({
                    supply: json.data?.supply ?? 0,
                    owners: json.data?.owner_count ?? 0,
                    floor: `${json.data?.floor_price ?? 0}`,
                    volume: `${json.data?.volume ?? 0}`,
                    rate: json.data?.change_rate,
                });
            })
            .catch((e) => {
                console.error('getCollectionStatistics failed', collection, e);
                if ('Unexpected token ' < ', "<?xml vers"... is not valid JSON' === e.message) {
                    return resolve(undefined);
                }
                reject(e);
            });
    });
};

// =================== Explore Art ===================

export type ExploreArtCard = {
    token_id: NftIdentifier;
    name: string;
    url: string;
    thumb: string;
};

export const queryExploreArtList = async (backend_host: string): Promise<ExploreArtCard[]> => {
    const r = await fetch(`${backend_host}/artist_carousel`);
    const json = await r.json();
    return json?.data.map((d: any) => ({
        token_id: parse_nft_identifier(d.tokenId),
        name: d.name,
        url: d.url,
        thumb: d.thumb,
    }));
};

export type EVENT_TYPE = 'sold' | 'list' | 'claim' | undefined;
export type EVENT = {
    canister: string;
    name: string;
    eventType: string;
    price: number;
    from: string;
    to?: string;
    fromName: string;
    toName: string;
    created_at: number;
};
export type ActivityParams = {
    canister?: string;
    page?: number;
    limit?: number;
    eventTypes?: string;
    collections?: string;
    user?: string;
    token_id?: string;
};
export type NFTEvent = {
    id: number;
    canister: string;
    token_id: string;
    caller?: string;
    eventType: string;
    from: string;
    to?: string;
    fromAid: string;
    toAid?: string;
    token_symbol: string;
    token_amount: string;
    usd_price: number;
    created_at: string;
    nft_info: {
        id: number;
        nft_collection_id: number;
        canister: string;
        token_id: string;
        token_name: string;
        mime_type: string;
        owner_of?: string;
        token_uri?: string;
        metadata: string; // This could be further detailed into a structured object if the metadata structure is consistent.
        minter_address?: string;
        media_url: string;
        thumbnail_url: string;
        properties?: any; // This could be typed more specifically if the structure of properties is known.
        updated_at: string;
    };
};
export type ActivityResponse = {
    data: NFTEvent[];
    message: string;
    page: { all_count: number; limit: number; page: number; page_count: number };
};
export const queryActivity = async (
    backend_host: string,
    args: ActivityParams,
): Promise<ActivityResponse> => {
    const r = await fetch(`${backend_host}/activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(args),
    });
    const json = await r.json();
    if (json.code === 200) {
        return json.data;
    }
    console.error('can not get queryAllActivity', json);
    throw new Error(`query all activity failed`);
};

// ================================= Trading Volume Statistics of a Specific Collection =================================

export type NftCollectionVolume = {
    day: number; // Time // ! In milliseconds
    volume: string; // Total trading volume // value
    count: number; // Total number of trades // count
};
// ! Sorted by time in ascending order
export const queryCollectionRecentDaysVolume = async (
    backend_host: string,
    args: { collection: string; days: number },
): Promise<NftCollectionVolume[]> => {
    return new Promise((resolve, reject) => {
        fetch(
            `${backend_host}/collection/stats/${args.collection}/${args.days}` /* cspell: disable-line */,
        )
            .then((r) => r.json())
            .then((json) => {
                if (!_.isArray(json)) {
                    return resolve([]);
                }
                for (const d of json) {
                    if (d.collectionId === args.collection) {
                        return resolve(
                            d.tradingVolume.map((dd: any) => ({
                                /* cspell: disable-next-line */
                                day: dayjs(dd.date, 'YYYY-MM-DDTHH:mm:ss.SSSZ').toDate().getTime(),
                                volume: `${dd.value}`,
                                count: dd.count,
                            })),
                        );
                    }
                }
                return resolve([]);
            })
            .catch((e) => {
                if (`${e}`.endsWith('Failed to fetch')) return resolve([]); // ! Only the production environment has this data, return empty for other environments
                reject(e);
            });
    });
};
