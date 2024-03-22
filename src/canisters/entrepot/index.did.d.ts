import type { ActorMethod } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';

export type AccountIdentifier = string;
export type AccountIdentifier__1 = string;
export type AssetHandle = string;
export type Balance = bigint;
export interface BalanceRequest {
    token: TokenIdentifier;
    user: User;
}
export type BalanceResponse = { ok: Balance } | { err: CommonError__1 };
export type Balance__1 = bigint;
export type CommonError = { InvalidToken: TokenIdentifier } | { Other: string };
export type CommonError__1 = { InvalidToken: TokenIdentifier } | { Other: string };
export type Extension = string;
export type HeaderField = [string, string];
export interface HttpRequest {
    url: string;
    method: string;
    body: Uint8Array | number[];
    headers: Array<HeaderField>;
}
export interface HttpResponse {
    body: Uint8Array | number[];
    headers: Array<HeaderField>;
    streaming_strategy: [] | [HttpStreamingStrategy];
    status_code: number;
}
export interface HttpStreamingCallbackResponse {
    token: [] | [HttpStreamingCallbackToken];
    body: Uint8Array | number[];
}
export interface HttpStreamingCallbackToken {
    key: string;
    sha256: [] | [Uint8Array | number[]];
    index: bigint;
    content_encoding: string;
}
export type HttpStreamingStrategy = {
    Callback: {
        token: HttpStreamingCallbackToken;
        callback: [Principal, string];
    };
};
export interface ListRequest {
    token: TokenIdentifier__1;
    from_subaccount: [] | [SubAccount__1];
    price: [] | [bigint];
}
export interface Listing {
    locked: [] | [Time];
    seller: Principal;
    price: bigint;
}
export type Memo = Uint8Array | number[];
export type Metadata =
    | {
          fungible: {
              decimals: number;
              metadata: [] | [Uint8Array | number[]];
              name: string;
              symbol: string;
          };
      }
    | { nonfungible: { metadata: [] | [Uint8Array | number[]] } };
export type Result =
    | {
          ok: Array<[TokenIndex, [] | [Listing], [] | [Uint8Array | number[]]]>;
      }
    | { err: CommonError };
export type Result_1 = { ok: Uint32Array | number[] } | { err: CommonError };
export type Result_2 = { ok: Balance__1 } | { err: CommonError };
export type Result_3 = { ok: null } | { err: CommonError };
export type Result_4 = { ok: null } | { err: string };
export type Result_5 = { ok: [AccountIdentifier__1, bigint] } | { err: string };
export type Result_6 = { ok: Metadata } | { err: CommonError };
export type Result_7 = { ok: AccountIdentifier__1 } | { err: CommonError };
export type Result_8 = { ok: [AccountIdentifier__1, [] | [Listing]] } | { err: CommonError };
export interface Sale {
    expires: Time;
    subaccount: SubAccount__1;
    tokens: Uint32Array | number[];
    buyer: AccountIdentifier__1;
    price: bigint;
}
export interface SaleSettings {
    startTime: Time;
    whitelist: boolean;
    totalToSell: bigint;
    sold: bigint;
    bulkPricing: Array<[bigint, bigint]>;
    whitelistTime: Time;
    salePrice: bigint;
    remaining: bigint;
    price: bigint;
}
export interface SaleTransaction {
    time: Time;
    seller: Principal;
    tokens: Uint32Array | number[];
    buyer: AccountIdentifier__1;
    price: bigint;
}
export interface Settlement {
    subaccount: SubAccount__1;
    seller: Principal;
    buyer: AccountIdentifier__1;
    price: bigint;
}
export type SubAccount = Uint8Array | number[];
export type SubAccount__1 = Uint8Array | number[];
export type Time = bigint;
export type TokenIdentifier = string;
export type TokenIdentifier__1 = string;
export type TokenIndex = number;
export interface Transaction {
    token: TokenIdentifier__1;
    time: Time;
    seller: Principal;
    buyer: AccountIdentifier__1;
    price: bigint;
}
export interface TransferRequest {
    to: User;
    token: TokenIdentifier;
    notify: boolean;
    from: User;
    memo: Memo;
    subaccount: [] | [SubAccount];
    amount: Balance;
}
export type TransferResponse =
    | { ok: Balance }
    | {
          err:
              | { CannotNotify: AccountIdentifier }
              | { InsufficientBalance: null }
              | { InvalidToken: TokenIdentifier }
              | { Rejected: null }
              | { Unauthorized: AccountIdentifier }
              | { Other: string };
      };
export type User = { principal: Principal } | { address: AccountIdentifier };
export interface _SERVICE {
    acceptCycles: ActorMethod<[], undefined>;
    addAsset: ActorMethod<[AssetHandle, number, string, string, string], undefined>;
    addThumbnail: ActorMethod<[AssetHandle, Uint8Array | number[]], undefined>;
    adminKillHeartbeat: ActorMethod<[], undefined>;
    adminKillHeartbeatExtra: ActorMethod<[string], undefined>;
    adminStartHeartbeat: ActorMethod<[], undefined>;
    adminStartHeartbeatExtra: ActorMethod<[string], undefined>;
    allPayments: ActorMethod<[], Array<[Principal, Array<SubAccount__1>]>>;
    allSettlements: ActorMethod<[], Array<[TokenIndex, Settlement]>>;
    assetTokenMap: ActorMethod<[], Array<[AssetHandle, TokenIndex]>>;
    assetsToTokens: ActorMethod<[Array<AssetHandle>], Uint32Array | number[]>;
    availableCycles: ActorMethod<[], bigint>;
    balance: ActorMethod<[BalanceRequest], BalanceResponse>;
    bearer: ActorMethod<[TokenIdentifier__1], Result_7>;
    clearPayments: ActorMethod<[Principal, Array<SubAccount__1>], undefined>;
    cronCapEvents: ActorMethod<[], undefined>;
    cronDisbursements: ActorMethod<[], undefined>;
    cronSettlements: ActorMethod<[], undefined>;
    details: ActorMethod<[TokenIdentifier__1], Result_8>;
    extensions: ActorMethod<[], Array<Extension>>;
    failedSales: ActorMethod<[], Array<[AccountIdentifier__1, SubAccount__1]>>;
    getMinter: ActorMethod<[], Principal>;
    getRegistry: ActorMethod<[], Array<[TokenIndex, AccountIdentifier__1]>>;
    getTokens: ActorMethod<[], Array<[TokenIndex, Metadata]>>;
    heartbeat_external: ActorMethod<[], undefined>;
    heartbeat_pending: ActorMethod<[], Array<[string, bigint]>>;
    historicExport: ActorMethod<[], boolean>;
    http_request: ActorMethod<[HttpRequest], HttpResponse>;
    initCap: ActorMethod<[], undefined>;
    list: ActorMethod<[ListRequest], Result_3>;
    listings: ActorMethod<[], Array<[TokenIndex, Listing, Metadata]>>;
    lock: ActorMethod<[TokenIdentifier__1, bigint, AccountIdentifier__1, SubAccount__1], Result_7>;
    metadata: ActorMethod<[TokenIdentifier__1], Result_6>;
    payments: ActorMethod<[], [] | [Array<SubAccount__1>]>;
    reserve: ActorMethod<[bigint, bigint, AccountIdentifier__1, SubAccount__1], Result_5>;
    retreive: ActorMethod<[AccountIdentifier__1], Result_4>;
    saleTransactions: ActorMethod<[], Array<SaleTransaction>>;
    salesSettings: ActorMethod<[AccountIdentifier__1], SaleSettings>;
    salesSettlements: ActorMethod<[], Array<[AccountIdentifier__1, Sale]>>;
    setMinter: ActorMethod<[Principal], undefined>;
    settle: ActorMethod<[TokenIdentifier__1], Result_3>;
    settlements: ActorMethod<[], Array<[TokenIndex, AccountIdentifier__1, bigint]>>;
    stats: ActorMethod<[], [bigint, bigint, bigint, bigint, bigint, bigint, bigint]>;
    supply: ActorMethod<[TokenIdentifier__1], Result_2>;
    toAddress: ActorMethod<[string, bigint], AccountIdentifier__1>;
    tokens: ActorMethod<[AccountIdentifier__1], Result_1>;
    tokens_ext: ActorMethod<[AccountIdentifier__1], Result>;
    transactions: ActorMethod<[], Array<Transaction>>;
    transfer: ActorMethod<[TransferRequest], TransferResponse>;
}
