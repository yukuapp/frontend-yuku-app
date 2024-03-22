import { customStringify } from '@/common/data/json';
import { bigint2string } from '@/common/types/bigint';
import { unwrapOption, unwrapOptionMap, wrapOption, wrapOptionMap } from '@/common/types/options';
import { principal2string } from '@/common/types/principal';
import { unwrapVariant2, unwrapVariantKey } from '@/common/types/variant';
import {
    CollectionLinks,
    CollectionStandard,
    CollectionStandardOgyInfoToken,
    CollectionStandardOgyInfoTokenIC,
} from '@/types/yuku';
import { unwrapCandyValue_2f2a0ab9 } from '../nft/nft_ogy/candy';
import {
    ICTokenSpec as CandidICTokenSpec,
    OgyInfo as CandidOgyInfo,
    Standard as CandidStandard,
} from './yuku_core/module_8d3a5afa/core_8d3a5afa.did';
import { Links } from './yuku_core/module_971fd8f8/core_971fd8f8.did';
import {
    ICTokenSpec as CandidICTokenSpec_6f12cd52,
    Standard as CandidStandard_6f12cd52,
} from './yuku_core/module_971fd8f8/core_971fd8f8.did';

export const unwrapCollectionLinks = (links: [] | [Links]): CollectionLinks | undefined => {
    return unwrapOptionMap<Links, CollectionLinks>(links, (l) => ({
        twitter: unwrapOption(l.twitter),
        instagram: unwrapOption(l.instagram),
        discord: unwrapOption(l.discord),
        website: unwrapOption(l.yoursite) /* cspell: disable-line */,
        telegram: unwrapOption(l.telegram),
        medium: unwrapOption(l.medium),
    }));
};

export const wrapCollectionLinks = (links?: CollectionLinks): [] | [Links] => {
    return wrapOptionMap(links, (l) => ({
        twitter: wrapOption(l.twitter),
        instagram: wrapOption(l.instagram),
        discord: wrapOption(l.discord),
        yoursite: wrapOption(l.website) /* cspell: disable-line */,
        telegram: wrapOption(l.telegram),
        medium: wrapOption(l.medium),
    }));
};

export const parseCollectionStandard = (standard: CandidStandard): CollectionStandard => {
    const ext = standard['ext'];
    const ogy: CandidOgyInfo = standard['ogy'];
    if (ext !== undefined) return { ext: null };
    if (ogy !== undefined)
        return {
            ogy: {
                fee: {
                    rate: bigint2string(ogy.fee.rate),
                    precision: bigint2string(ogy.fee.precision),
                },
                creator: principal2string(ogy.creator), // ? principal -> string
                token: unwrapVariant2(
                    ogy.token,
                    [
                        'ic',
                        (ic: CandidICTokenSpec): CollectionStandardOgyInfoTokenIC => ({
                            fee: bigint2string(ic.fee),
                            decimals: bigint2string(ic.decimals),
                            canister: principal2string(ic.canister), // ? principal -> string
                            standard: { type: unwrapVariantKey(ic.standard) },
                            symbol: ic.symbol,
                        }),
                    ],
                    ['extensible', unwrapCandyValue_2f2a0ab9],
                ) as CollectionStandardOgyInfoToken,
                owner: principal2string(ogy.owner), // ? principal -> string
                totalFee: {
                    rate: bigint2string(ogy.totalFee.rate),
                    precision: bigint2string(ogy.totalFee.precision),
                },
            },
        };
    throw new Error(`can not parse standard content`);
};

export const parseCollectionStandard_6f12cd52 = (
    standard: CandidStandard_6f12cd52,
): CollectionStandard => {
    const ext = standard['ext'];
    const ogy: CandidOgyInfo = standard['ogy'];
    if (ext !== undefined) return { ext: null };
    if (ogy !== undefined)
        return {
            ogy: {
                fee: {
                    rate: bigint2string(ogy.fee.rate),
                    precision: bigint2string(ogy.fee.precision),
                },
                creator: principal2string(ogy.creator), // ? principal -> string
                token: unwrapVariant2<
                    CandidICTokenSpec_6f12cd52,
                    CollectionStandardOgyInfoTokenIC,
                    any,
                    any
                >(
                    ogy.token,
                    [
                        'ic',
                        (ic: CandidICTokenSpec_6f12cd52): CollectionStandardOgyInfoTokenIC => ({
                            fee: unwrapOptionMap(ic.fee, bigint2string),
                            decimals: bigint2string(ic.decimals),
                            canister: principal2string(ic.canister), // ? principal -> string
                            standard: (() => {
                                const key = unwrapVariantKey(ic.standard);
                                switch (key) {
                                    case 'Ledger':
                                    case 'ICRC1':
                                    case 'DIP20':
                                    case 'EXTFungible':
                                        return { type: key };
                                    case 'Other':
                                        return {
                                            type: 'Other',
                                            raw: customStringify(ic.standard['Other']),
                                        };
                                }
                                throw new Error(`module_47a7c018 unknown token standard: ${key}`);
                            })(),
                            symbol: ic.symbol,
                        }),
                    ],
                    ['extensible', unwrapCandyValue_2f2a0ab9],
                ) as CollectionStandardOgyInfoToken,
                owner: principal2string(ogy.owner), // ? principal -> string
                totalFee: {
                    rate: bigint2string(ogy.totalFee.rate),
                    precision: bigint2string(ogy.totalFee.precision),
                },
            },
        };
    throw new Error(`can not parse standard content`);
};
