import { anonymous } from '@/utils/connect/anonymous';
import * as entrepot from '@/canisters/entrepot/';
import { string2bigint } from '@/common/types/bigint';
import { Listings } from '@/types/yuku';

export const queryListings = async (collection: string): Promise<Listings[]> => {
    const r = await entrepot.queryListings(anonymous, collection);
    return r;
};

export const queryFloorPrice = async (collection: string): Promise<string> => {
    const r = await queryListings(collection);
    const min = r.reduce((min, l) => {
        return string2bigint(l.price) < string2bigint(min.price) ? l : min;
    });
    return min.price;
};
