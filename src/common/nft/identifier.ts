import { NftIdentifier } from '@/types/nft';
import { parse_token_index_with_checking } from './ext';

export const isSameNft = (a: NftIdentifier, b: NftIdentifier) =>
    a.collection === b.collection && a.token_identifier === b.token_identifier;

export const isSameNftByTokenId = (
    a: { token_id: NftIdentifier },
    b: { token_id: NftIdentifier },
) => isSameNft(a.token_id, b.token_id);

export const uniqueKey = (token_id: NftIdentifier) =>
    `${token_id.collection}/${token_id.token_identifier}`;

export const parseTokenIndex = (token_id: NftIdentifier): number =>
    parse_token_index_with_checking(token_id.collection, token_id.token_identifier);
