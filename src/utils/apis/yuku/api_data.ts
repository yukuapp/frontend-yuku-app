import * as api_data from '@/apis/yuku/api_data';
import {
    CollectionStatistics,
    HomeBanner,
    HomeFeaturedArtwork,
    HomeHotCollection,
    TokenExchangePrice,
} from '@/apis/yuku/api_data';
import { getYukuDataHost } from './special';

export const queryHomeBanners = async (): Promise<HomeBanner[]> => {
    const backend_host = getYukuDataHost();
    return api_data.queryHomeBanners(backend_host);
};

export const queryHomeHotCollections = async (): Promise<HomeHotCollection[]> => {
    const backend_host = getYukuDataHost();
    return api_data.queryHomeHotCollections(backend_host);
};

export const queryHomeFeaturedArtworks = async (): Promise<HomeFeaturedArtwork[]> => {
    const backend_host = getYukuDataHost();
    return api_data.queryHomeFeaturedArtworks(backend_host);
};

export const queryTokenExchangePriceList = async (): Promise<TokenExchangePrice[]> => {
    const backend_host = getYukuDataHost();
    return api_data.queryTokenExchangePriceList(backend_host);
};

export const queryTokenUsdRate = async (symbol: string): Promise<string | undefined> => {
    const backend_host = getYukuDataHost();
    return api_data.queryTokenUsdRate(backend_host, symbol);
};

export const queryWhitelistJwtToken = async (collection: string): Promise<string> => {
    const backend_host = getYukuDataHost();
    return api_data.queryWhitelistJwtToken(backend_host, collection);
};

export const doLaunchpadAddWhitelist = async (
    collection: string,
    account: string,
): Promise<void> => {
    const backend_host = getYukuDataHost();
    return api_data.doLaunchpadAddWhitelist(backend_host, collection, account);
};

export const doOatAddWhitelist = async (
    collection: string,
    event_id: string,
    account: string,
): Promise<void> => {
    const backend_host = getYukuDataHost();
    return api_data.doOatAddWhitelist(backend_host, collection, event_id, account);
};

export const getCollectionStatistics = async (
    collection: string,
): Promise<CollectionStatistics | undefined> => {
    const backend_host = getYukuDataHost();
    return api_data.getCollectionStatistics(backend_host, collection);
};
// =================== Explore art ===================

export const queryExploreArtList = async (): Promise<api_data.ExploreArtCard[]> => {
    const backend_host = getYukuDataHost();
    return api_data.queryExploreArtList(backend_host);
};

export const queryActivity = async (
    args: api_data.ActivityParams,
): Promise<api_data.ActivityResponse> => {
    const backend_host = getYukuDataHost();
    return api_data.queryActivity(backend_host, args);
};

export const queryCollectionRecentDaysVolume = async (args: {
    collection: string;
    days: number;
}): Promise<api_data.NftCollectionVolume[]> => {
    const backend_host = getYukuDataHost();
    return api_data.queryCollectionRecentDaysVolume(backend_host, args);
};
