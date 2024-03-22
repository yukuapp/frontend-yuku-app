import { Principal } from '@dfinity/principal';
import { NftIdentifier } from '@/types/nft';
import { principal2string, string2principal } from '../types/principal';

const TDS = [10, 116, 105, 100]; //b"\x0Atid"

export const parse_token_identifier = (collection: string, token_index: number): string => {
    const buffer: number[] = [
        ...TDS,
        ...string2principal(collection).toUint8Array(),
        (token_index >> 24) & 0xff,
        (token_index >> 16) & 0xff,
        (token_index >> 8) & 0xff,
        token_index & 0xff,
    ];

    return principal2string(Principal.fromUint8Array(new Uint8Array(buffer)));
};

export const parse_token_index_with_checking = (
    collection: string,
    token_identifier: string,
): number => {
    const buffer = string2principal(token_identifier).toUint8Array();

    if (buffer.length != 18)
        throw new Error(
            `can not parse token index by token identifier 1: ${collection} | ${token_identifier}`,
        );

    if (buffer[0] != TDS[0] || buffer[1] != TDS[1] || buffer[2] != TDS[2] || buffer[3] != TDS[3]) {
        throw new Error(
            `can not parse token index by token identifier 2: ${collection} | ${token_identifier}`,
        );
    }

    const inner_collection = principal2string(
        Principal.fromUint8Array(buffer.subarray(4, buffer.length - 4)),
    );
    if (inner_collection !== collection) {
        throw new Error(
            `can not parse token index by token identifier 3: ${collection} | ${token_identifier}`,
        );
    }

    const index = buffer.subarray(buffer.length - 4, buffer.length);

    return (
        ((index[0] & 0xff) << 24) |
        ((index[1] & 0xff) << 16) |
        ((index[2] & 0xff) << 8) |
        ((index[3] & 0xff) << 0)
    );
};

export const parse_token_index = (token_identifier: string): number => {
    const buffer = string2principal(token_identifier).toUint8Array();

    if (buffer.length != 18)
        throw new Error(`can not parse token index by token identifier 1: ${token_identifier}`);

    if (buffer[0] != TDS[0] || buffer[1] != TDS[1] || buffer[2] != TDS[2] || buffer[3] != TDS[3]) {
        throw new Error(`can not parse token index by token identifier 2: ${token_identifier}`);
    }

    const inner_collection = principal2string(
        Principal.fromUint8Array(buffer.subarray(4, buffer.length - 4)),
    );
    if (inner_collection.length !== 27) {
        throw new Error(`can not parse token index by token identifier 3: ${token_identifier}`);
    }

    const index = buffer.subarray(buffer.length - 4, buffer.length);

    return (
        ((index[0] & 0xff) << 24) |
        ((index[1] & 0xff) << 16) |
        ((index[2] & 0xff) << 8) |
        ((index[3] & 0xff) << 0)
    );
};

export const parse_nft_identifier = (token_identifier: string): NftIdentifier => {
    const buffer = string2principal(token_identifier).toUint8Array();

    if (buffer.length != 18)
        throw new Error(`can not parse token index by token identifier 1: ${token_identifier}`);

    if (buffer[0] != TDS[0] || buffer[1] != TDS[1] || buffer[2] != TDS[2] || buffer[3] != TDS[3]) {
        throw new Error(`can not parse token index by token identifier 2:  ${token_identifier}`);
    }

    const collection = principal2string(
        Principal.fromUint8Array(buffer.subarray(4, buffer.length - 4)),
    );

    return { collection, token_identifier };
};
