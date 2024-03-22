import type { ActorMethod } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';

export type AccountIdentifier = string;
export type AccountIdentifier__1 = string;
export type CandyValue =
    | { Int: bigint }
    | { Nat: bigint }
    | { Empty: null }
    | { Nat16: number }
    | { Nat32: number }
    | { Nat64: bigint }
    | { Blob: Uint8Array | number[] }
    | { Bool: boolean }
    | { Int8: number }
    | { Nat8: number }
    | { Nats: { thawed: Array<bigint> } | { frozen: Array<bigint> } }
    | { Text: string }
    | {
          Bytes: { thawed: Uint8Array | number[] } | { frozen: Uint8Array | number[] };
      }
    | { Int16: number }
    | { Int32: number }
    | { Int64: bigint }
    | { Option: [] | [CandyValue] }
    | { Floats: { thawed: Array<number> } | { frozen: Array<number> } }
    | { Float: number }
    | { Principal: Principal }
    | {
          Array: { thawed: Array<CandyValue> } | { frozen: Array<CandyValue> };
      }
    | { Class: Array<Property> };
export type Category = string;
export interface CollectionInfo {
    url: [] | [string];
    creator: UserId;
    featured: [] | [Img];
    logo: [] | [Img];
    name: string;
    banner: [] | [Img];
    description: [] | [string];
    links: [] | [Links];
    isVisible: boolean;
    royalties: Royality;
    category: [] | [Category];
    standard: Standard;
    releaseTime: [] | [Time];
    canisterId: Principal;
}
export interface CollectionInit {
    url: [] | [string];
    featured: [] | [Img];
    logo: [] | [Img];
    name: [] | [string];
    banner: [] | [Img];
    description: [] | [string];
    links: [] | [Links];
    isVisible: boolean;
    royalties: Royality;
    category: [] | [Category];
    standard: Standard;
    releaseTime: [] | [Time];
    openTime: [] | [Time];
}
export interface ICPSale {
    token: TokenSpec__1;
    memo: bigint;
    user: User__1;
    price: bigint;
    retry: bigint;
}
export interface ICTokenSpec {
    fee: bigint;
    decimals: bigint;
    canister: Principal;
    standard: { ICRC1: null } | { EXTFungible: null } | { DIP20: null } | { Ledger: null };
    symbol: string;
}
export type Img = string;
export interface ImportNFT {
    result: ImportNFTStatus;
    applicant: Principal;
    tokenIdentifier: TokenIdentifier__1;
}
export type ImportNFTStatus =
    | { reject: string }
    | { pending: null }
    | { pass: string }
    | { cancel: string };
export interface Links {
    twitter: [] | [string];
    instagram: [] | [string];
    discord: [] | [string];
    yoursite: [] | [string];
    telegram: [] | [string];
    medium: [] | [string];
}
export interface MintRequest {
    to: User;
    metadata: [] | [Uint8Array | number[]];
}
export interface Notice {
    id: bigint;
    status: NoticeStatus;
    result: NoticeResult;
    minter: AccountIdentifier__1;
    timestamp: Time;
}
export type NoticeResult = { reject: string } | { accept: TokenIdentifier__1 };
export type NoticeStatus = { readed: null } | { unreaded: null };
export interface OgyInfo {
    fee: { rate: bigint; precision: bigint };
    creator: Principal;
    token: TokenSpec;
    owner: Principal;
    totalFee: { rate: bigint; precision: bigint };
}
export interface PageParam {
    page: bigint;
    pageCount: bigint;
}
export interface Property {
    value: CandyValue;
    name: string;
    immutable: boolean;
}
export type Result = { ok: TokenIndex } | { err: string };
export type Result_1 = { ok: Principal } | { err: string };
export type Result_2 = { ok: null } | { err: string };
export interface Royality {
    rate: bigint;
    precision: bigint;
}
export type SettleICPResult =
    | { ok: null }
    | {
          err: { NoSettleICP: null } | { SettleErr: null } | { RetryExceed: null };
      };
export type Standard = { ext: null } | { ogy: OgyInfo };
export type Time = bigint;
export type TokenIdentifier = string;
export type TokenIdentifier__1 = string;
export type TokenIndex = number;
export type TokenSpec = { ic: ICTokenSpec } | { extensible: CandyValue };
export interface TokenSpec__1 {
    fee: bigint;
    canister: string;
    decimal: bigint;
    symbol: string;
}
export type User = { principal: Principal } | { address: AccountIdentifier };
export type UserId = Principal;
export type User__1 = { principal: Principal } | { address: AccountIdentifier };
export default interface _SERVICE {
    addArtist: ActorMethod<[Array<Principal>], undefined>;
    addCanisterController: ActorMethod<[Principal, Principal], undefined>;
    addManager: ActorMethod<[Array<Principal>], undefined>;
    addOperation: ActorMethod<[Array<Principal>], undefined>;
    applyImportNFT: ActorMethod<[TokenIdentifier], Result_2>;
    audit: ActorMethod<[TokenIdentifier, boolean, string], Result_2>;
    batchSettleICP: ActorMethod<[Array<bigint>], Array<SettleICPResult>>;
    createCollection: ActorMethod<[CollectionInit], Result_1>;
    delArtist: ActorMethod<[Array<Principal>], undefined>;
    delManager: ActorMethod<[Array<Principal>], undefined>;
    delNFT: ActorMethod<[Array<TokenIdentifier>], Result_2>;
    delOperation: ActorMethod<[Array<Principal>], undefined>;
    flushICPSettlement: ActorMethod<[], undefined>;
    getArtists: ActorMethod<[], Array<Principal>>;
    getCollection: ActorMethod<[], [] | [Principal]>;
    getCollectionByPid: ActorMethod<[Principal], [] | [Principal]>;
    getCollectionInfo: ActorMethod<[Principal], [] | [CollectionInfo]>;
    getCollectionInfos: ActorMethod<[], Array<CollectionInfo>>;
    getICPSettlements: ActorMethod<[], Array<[bigint, ICPSale]>>;
    getManager: ActorMethod<[], Array<Principal>>;
    getMinter: ActorMethod<[], Principal>;
    getNFTCost: ActorMethod<[], bigint>;
    getNotice: ActorMethod<[], Array<Notice>>;
    getOperations: ActorMethod<[], Array<Principal>>;
    importCollection: ActorMethod<[Principal, Principal, CollectionInfo], Result_1>;
    listAllNFT: ActorMethod<[], Array<[TokenIdentifier, ImportNFT]>>;
    listCollections: ActorMethod<[], Array<string>>;
    listNFT: ActorMethod<[], Array<TokenIdentifier>>;
    listNFTPageable: ActorMethod<[PageParam], Array<TokenIdentifier>>;
    migrateCollection: ActorMethod<[], undefined>;
    mintNFTWithICP: ActorMethod<[bigint, string, MintRequest], Result>;
    setMinter: ActorMethod<[Principal], undefined>;
    setNFTCost: ActorMethod<[bigint], undefined>;
    setNoticesReaded: ActorMethod<[Array<bigint>], undefined>;
    updateCollection: ActorMethod<[Principal, CollectionInfo], undefined>;
    withdraw: ActorMethod<[Principal, bigint, bigint], boolean>;
}
