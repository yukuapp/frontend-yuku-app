import _ from 'lodash';
import { FilterCollectionOption } from '@/components/nft-card/filter/collections';
import { ROWS } from '@/components/nft-card/sliced';
import { getNameByNftMetadata } from '@/utils/nft/metadata';
import { cdn_by_assets } from '@/common/cdn';
import { parseLowerCaseSearch } from '@/common/data/search';
import { sortCardsByPrice } from '@/common/nft/sort';
import { NftIdentifier, NftMetadata } from '@/types/nft';
import { UniqueCollectionData } from '@/types/yuku';

export type ProfileTab = 'collected' | 'created' | 'favorite' | 'activity' | 'auction';

const PROFILE_TABS: ProfileTab[] = ['collected', 'created', 'favorite', 'activity', 'auction'];

export const isValidProfileTab = (tab: string): boolean => PROFILE_TABS.includes(tab as any);

export type UsedProfile = {
    principal: string | undefined;
    account: string;
    avatar: string;
    username: string;
    bio: string;
    created: NftIdentifier[];
    favorited: NftIdentifier[];
};

export type HeaderView = {
    principal: string | undefined;
    account: string;
    avatar: string;
    username: string;
    bio: string;
};

export const profileToView = (profile: UsedProfile): HeaderView => ({
    principal: profile.principal,
    account: profile.account,
    avatar: profile.avatar,
    username: profile.username,
    bio: profile.bio,
});

export const setCollectionOptionsByList = (
    wrappedList: NftMetadata[] | undefined,
    collectionDataList: UniqueCollectionData[],
    setCollectionOptions: (options: FilterCollectionOption[]) => void,
) => {
    if (wrappedList === undefined) return;
    const others: string[] = [];
    const options: FilterCollectionOption[] = [];
    for (const card of wrappedList) {
        const collection = card.metadata.token_id.collection;
        const data = collectionDataList.find((d) => d.info.collection === collection);
        if (data === undefined) {
            others.push(collection);
        } else {
            const name = data.info.name;
            const logo = data.info.logo ?? cdn_by_assets('/svgs/logo/collection-others.svg')!;
            let index = options.findIndex((o) => o.collection === collection);
            if (index === -1) {
                index = options.length;
                options.push({
                    collection,
                    name,
                    collections: [collection],
                    logo,
                    count: 1,
                });
            } else {
                options[index].count += 1;
            }
        }
    }
    if (others.length) {
        options.push({
            collection: 'others',
            name: 'Others',
            collections: others,
            logo: cdn_by_assets('/svgs/logo/collection-others.svg')!,
            count: others.length,
        });
    }
    setCollectionOptions(options);
};

export type ProfileSortOption = 'price_low_to_high' | 'price_high_to_low' | 'viewed' | 'favorited';
export const PROFILE_SORT_OPTIONS: { value: ProfileSortOption; label: string }[] = [
    { value: 'price_low_to_high', label: 'Price: Low to High' },
    { value: 'price_high_to_low', label: 'Price: High to Low' },
    { value: 'viewed', label: 'Most viewed' },
    { value: 'favorited', label: 'Most favorited' },
];

export const profileFilterList = (
    wrappedList: NftMetadata[] | undefined,
    openCollectionFilter: boolean,
    collectionOptions: FilterCollectionOption[],
    search: string,
    sort: ProfileSortOption,
    icp_usd: string | undefined,
    ogy_usd: string | undefined,
) => {
    if (wrappedList === undefined) return wrappedList;
    let list = [...wrappedList];

    if (openCollectionFilter && collectionOptions.length) {
        list = list.filter((c) => {
            for (const option of collectionOptions) {
                if (option.collections.includes(c.owner.token_id.collection)) return true;
            }
            return false;
        });
    }

    const s = parseLowerCaseSearch(search);
    if (s) {
        list = list.filter((c) => getNameByNftMetadata(c).toLowerCase().indexOf(s) > -1);
    }

    if (list.length > 1) {
        switch (sort) {
            case 'price_low_to_high':
                list = sortCardsByPrice(list, sort, icp_usd, ogy_usd);
                break;
            case 'price_high_to_low':
                list = sortCardsByPrice(list, sort, icp_usd, ogy_usd);
                break;
            case 'viewed':
                list = _.sortBy(list, [(s) => s.listing?.views && -s.listing.views]);
                break;
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

export const PROFILE_CARD_SIZE: [number, number][] = [
    [2000, 10 * ROWS],
    [1440, 7 * ROWS],
    [1105, 7 * ROWS],
    [848, 5 * ROWS],
    [0, 2 * ROWS],
];
