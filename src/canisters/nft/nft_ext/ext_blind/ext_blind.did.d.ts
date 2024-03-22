import { Principal } from '@dfinity/principal';

// export type AccountIdentifier = string;
// export type AccountIdentifier__1 = string;
// export interface AllowanceRequest {
//     token: TokenIdentifier;
//     owner: User;
//     spender: Principal;
// }
// export interface ApproveRequest {
//     token: TokenIdentifier;
//     subaccount: [] | [SubAccount];
//     allowance: Balance;
//     spender: Principal;
// }
// export type Balance = bigint;
// export interface BalanceRequest {
//     token: TokenIdentifier;
//     user: User;
// }
// export type BalanceResponse = { ok: Balance } | { err: CommonError__1 };
// export type Balance__1 = bigint;
export type CommonError = { InvalidToken: TokenIdentifier } | { Other: string };
// export type CommonError__1 = { InvalidToken: TokenIdentifier } | { Other: string };
// export type Extension = string;
// export type HeaderField = [string, string];
// export interface HttpRequest {
//     url: string;
//     method: string;
//     body: Array<number>;
//     headers: Array<HeaderField>;
// }
// export interface HttpResponse {
//     body: Array<number>;
//     headers: Array<HeaderField>;
//     status_code: number;
// }
// export interface Listing {
//     locked: [] | [Time__1];
//     seller: Principal;
//     price: bigint;
// }
// export type Memo = Array<number>;
export type Metadata =
    | {
          fungible: {
              decimals: number;
              metadata: [] | [Array<number>];
              name: string;
              symbol: string;
          };
      }
    | { nonfungible: { metadata: [] | [Array<number>] } };
// export interface MetadataStorageInfo {
//     url: string;
//     thumb: string;
// }
// export type MetadataStorageType =
//     | { S3: null }
//     | { Last: null }
//     | { Fleek: null }
//     | { MetaBox: null };
// export interface MintRequest {
//     to: User;
//     metadata: [] | [Array<number>];
// }
// export interface Property {
//     trait_type: string;
//     value: string;
// }
// export type Result =
//     | {
//           ok: Array<[TokenIndex, [] | [Listing], [] | [Array<number>]]>;
//       }
//     | { err: CommonError };
// export type Result_1 = { ok: Array<TokenIndex> } | { err: CommonError };
// export type Result_2 = { ok: Balance__1 } | { err: CommonError };
export type Result_3 = { ok: Metadata } | { err: CommonError };
// export type Result_4 = { ok: boolean } | { err: CommonError };
// export type Result__1 = { ok: Metadata } | { err: CommonError };
// export type Result__1_1 = { ok: AccountIdentifier__1 } | { err: CommonError };
// export type Result__1_2 = { ok: Balance__1 } | { err: CommonError };
// export type SubAccount = Array<number>;
export type Time = bigint;
// export type Time__1 = bigint;
export type TokenIdentifier = string;
export type TokenIdentifier__1 = string;
// export type TokenIndex = number;
// export interface TransferRequest {
//     to: User;
//     token: TokenIdentifier;
//     notify: boolean;
//     from: User;
//     memo: Memo;
//     subaccount: [] | [SubAccount];
//     amount: Balance;
// }
// export type TransferResponse =
//     | { ok: Balance }
//     | {
//           err:
//               | { CannotNotify: AccountIdentifier }
//               | { InsufficientBalance: null }
//               | { InvalidToken: TokenIdentifier }
//               | { Rejected: null }
//               | { Unauthorized: AccountIdentifier }
//               | { Other: string };
//       };
// export type User = { principal: Principal } | { address: AccountIdentifier };
export default interface _SERVICE {
    // acceptCycles: () => Promise<undefined>;
    // addMetadataStorageType: (arg_0: string) => Promise<undefined>;
    // addMetadataUrlMany: (
    //     arg_0: Array<[MetadataStorageType, TokenIndex, MetadataStorageInfo]>,
    // ) => Promise<undefined>;
    // allowance: (arg_0: AllowanceRequest) => Promise<Result__1_2>;
    // approve: (arg_0: ApproveRequest) => Promise<boolean>;
    // approveAll: (arg_0: Array<ApproveRequest>) => Promise<Array<TokenIndex>>;
    // availableCycles: () => Promise<bigint>;
    // balance: (arg_0: BalanceRequest) => Promise<BalanceResponse>;
    // batchMintNFT: (arg_0: Array<MintRequest>) => Promise<Array<TokenIndex>>;
    // batchTransfer: (arg_0: Array<TransferRequest>) => Promise<Array<TransferResponse>>;
    // bearer: (arg_0: TokenIdentifier__1) => Promise<Result__1_1>;
    // deleteMetadataStorageType: (arg_0: string) => Promise<undefined>;
    // extensions: () => Promise<Array<Extension>>;
    // getAllowances: () => Promise<Array<[TokenIndex, Principal]>>;
    // getIsOpen: (arg_0: TokenIdentifier__1) => Promise<Result_4>;
    // getMedataStorageType: () => Promise<Array<string>>;
    // getMinter: () => Promise<Principal>;
    // getNFTMetadata: () => Promise<Array<Metadata>>;
    getOpenTime: () => Promise<Time>;
    // getProperties: () => Promise<Array<[string, Array<[string, bigint]>]>>;
    // getRegistry: () => Promise<Array<[TokenIndex, AccountIdentifier__1]>>;
    // getRootBucketId: () => Promise<[] | [string]>;
    // getScore: () => Promise<Array<[TokenIndex, number]>>;
    // getStorageMetadataUrl: (
    //     arg_0: MetadataStorageType,
    //     arg_1: TokenIndex,
    // ) => Promise<[string, string]>;
    // getTokens: () => Promise<Array<[TokenIndex, Metadata]>>;
    // getTokensByIds: (arg_0: Array<TokenIndex>) => Promise<Array<[TokenIndex, Metadata]>>;
    // getTokensByProperties: (
    //     arg_0: Array<[string, Array<string>]>,
    // ) => Promise<Array<[TokenIndex, Metadata]>>;
    // getTokenspageable: (
    //     arg_0: TokenIndex,
    //     arg_1: TokenIndex,
    // ) => Promise<Array<[TokenIndex, Metadata]>>;
    // http_request: (arg_0: HttpRequest) => Promise<HttpResponse>;
    // initCap: () => Promise<[] | [string]>;
    // initLastMetadata: (arg_0: TokenIndex, arg_1: TokenIndex) => Promise<undefined>;
    // initproperties: (arg_0: Array<TokenIndex>) => Promise<undefined>;
    // lookProperties: () => Promise<Array<[Property, Array<TokenIndex>]>>;
    // lookPropertyScoreByTokenId: () => Promise<Array<[TokenIndex, Array<[Property, bigint]>]>>;
    // metadata: (arg_0: TokenIdentifier__1) => Promise<Result__1>;
    // mintNFT: (arg_0: MintRequest) => Promise<TokenIndex>;
    open: (arg_0: TokenIdentifier__1) => Promise<Result_3>;
    // putNFTMetadata: (arg_0: Array<Metadata>) => Promise<undefined>;
    // replaceMetadata: (
    //     arg_0: MetadataStorageType,
    //     arg_1: TokenIndex,
    //     arg_2: TokenIndex,
    // ) => Promise<undefined>;
    // setMinter: (arg_0: Principal) => Promise<undefined>;
    // setOpenTime: (arg_0: Time) => Promise<undefined>;
    // setScoreOfTokenId: (arg_0: bigint) => Promise<undefined>;
    // supply: (arg_0: TokenIdentifier__1) => Promise<Result_2>;
    // tokens: (arg_0: AccountIdentifier__1) => Promise<Result_1>;
    // tokens_ext: (arg_0: AccountIdentifier__1) => Promise<Result>;
    // transfer: (arg_0: TransferRequest) => Promise<TransferResponse>;
    // updateNFTMetadata: (arg_0: Array<Metadata>) => Promise<undefined>;
}
