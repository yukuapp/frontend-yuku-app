import { Principal } from '@dfinity/principal';

export type Account =
    | { account_id: string }
    | { principal: Principal }
    | { extensible: CandyShared }
    | { account: { owner: Principal; sub_account: [] | [Array<number>] } };
// export interface AllocationRecordStable {
//     allocated_space: bigint;
//     token_id: string;
//     available_space: bigint;
//     canister: Principal;
//     chunks: Array<bigint>;
//     library_id: string;
// }
export interface AuctionConfig {
    start_price: bigint;
    token: TokenSpec;
    reserve: [] | [bigint];
    start_date: bigint;
    min_increase: { amount: bigint } | { percentage: number };
    allow_list: [] | [Array<Principal>];
    buy_now: [] | [bigint];
    ending:
        | {
              waitForQuiet: {
                  max: bigint;
                  date: bigint;
                  fade: number;
                  extention: bigint;
              };
          }
        | { date: bigint };
}
export interface AuctionStateStable {
    status: { closed: null } | { open: null } | { not_started: null };
    participants: Array<[Principal, bigint]>;
    current_bid_amount: bigint;
    winner: [] | [Account];
    end_date: bigint;
    wait_for_quiet_count: [] | [bigint];
    current_escrow: [] | [EscrowReceipt];
    allow_list: [] | [Array<[Principal, boolean]>];
    current_broker_id: [] | [Principal];
    min_next_bid: bigint;
    config: PricingConfig;
}
// export interface BalanceResponse {
//     nfts: Array<string>;
//     offers: Array<EscrowRecord>;
//     sales: Array<EscrowRecord>;
//     stake: Array<StakeRecord>;
//     multi_canister: [] | [Array<Principal>];
//     escrow: Array<EscrowRecord>;
// }
// export type BalanceResult = { ok: BalanceResponse } | { err: OrigynError };
export type BearerResult = { ok: Account } | { err: OrigynError };
export interface BidRequest {
    broker_id: [] | [Principal];
    escrow_receipt: EscrowReceipt;
    sale_id: string;
}
export interface BidResponse {
    token_id: string;
    txn_type:
        | {
              escrow_deposit: {
                  token: TokenSpec;
                  token_id: string;
                  trx_id: TransactionID;
                  seller: Account;
                  extensible: CandyShared;
                  buyer: Account;
                  amount: bigint;
              };
          }
        | {
              canister_network_updated: {
                  network: Principal;
                  extensible: CandyShared;
              };
          }
        | {
              escrow_withdraw: {
                  fee: bigint;
                  token: TokenSpec;
                  token_id: string;
                  trx_id: TransactionID;
                  seller: Account;
                  extensible: CandyShared;
                  buyer: Account;
                  amount: bigint;
              };
          }
        | {
              canister_managers_updated: {
                  managers: Array<Principal>;
                  extensible: CandyShared;
              };
          }
        | {
              auction_bid: {
                  token: TokenSpec;
                  extensible: CandyShared;
                  buyer: Account;
                  amount: bigint;
                  sale_id: string;
              };
          }
        | { burn: { from: [] | [Account]; extensible: CandyShared } }
        | {
              data: {
                  hash: [] | [Array<number>];
                  extensible: CandyShared;
                  data_dapp: [] | [string];
                  data_path: [] | [string];
              };
          }
        | {
              sale_ended: {
                  token: TokenSpec;
                  seller: Account;
                  extensible: CandyShared;
                  buyer: Account;
                  amount: bigint;
                  sale_id: [] | [string];
              };
          }
        | {
              mint: {
                  to: Account;
                  from: Account;
                  sale: [] | [{ token: TokenSpec; amount: bigint }];
                  extensible: CandyShared;
              };
          }
        | {
              royalty_paid: {
                  tag: string;
                  token: TokenSpec;
                  seller: Account;
                  extensible: CandyShared;
                  buyer: Account;
                  amount: bigint;
                  receiver: Account;
                  sale_id: [] | [string];
              };
          }
        | { extensible: CandyShared }
        | {
              owner_transfer: {
                  to: Account;
                  from: Account;
                  extensible: CandyShared;
              };
          }
        | {
              sale_opened: {
                  pricing: PricingConfig;
                  extensible: CandyShared;
                  sale_id: string;
              };
          }
        | {
              canister_owner_updated: {
                  owner: Principal;
                  extensible: CandyShared;
              };
          }
        | {
              sale_withdraw: {
                  fee: bigint;
                  token: TokenSpec;
                  token_id: string;
                  trx_id: TransactionID;
                  seller: Account;
                  extensible: CandyShared;
                  buyer: Account;
                  amount: bigint;
              };
          }
        | {
              deposit_withdraw: {
                  fee: bigint;
                  token: TokenSpec;
                  trx_id: TransactionID;
                  extensible: CandyShared;
                  buyer: Account;
                  amount: bigint;
              };
          };
    timestamp: bigint;
    index: bigint;
}
// export type Caller = [] | [Principal];
export type CandyShared =
    | { Int: bigint }
    | { Map: Array<[CandyShared, CandyShared]> }
    | { Nat: bigint }
    | { Set: Array<CandyShared> }
    | { Nat16: number }
    | { Nat32: number }
    | { Nat64: bigint }
    | { Blob: Array<number> }
    | { Bool: boolean }
    | { Int8: number }
    | { Ints: Array<bigint> }
    | { Nat8: number }
    | { Nats: Array<bigint> }
    | { Text: string }
    | { Bytes: Array<number> }
    | { Int16: number }
    | { Int32: number }
    | { Int64: bigint }
    | { Option: [] | [CandyShared] }
    | { Floats: Array<number> }
    | { Float: number }
    | { Principal: Principal }
    | { Array: Array<CandyShared> }
    | { Class: Array<PropertyShared> };
// export type CanisterCyclesAggregatedData = Array<bigint>;
// export type CanisterHeapMemoryAggregatedData = Array<bigint>;
// export type CanisterLogFeature = { filterMessageByContains: null } | { filterMessageByRegex: null };
// export interface CanisterLogMessages {
//     data: Array<LogMessagesData>;
//     lastAnalyzedMessageTimeNanos: [] | [Nanos];
// }
// export interface CanisterLogMessagesInfo {
//     features: Array<[] | [CanisterLogFeature]>;
//     lastTimeNanos: [] | [Nanos];
//     count: number;
//     firstTimeNanos: [] | [Nanos];
// }
// export type CanisterLogRequest =
//     | { getMessagesInfo: null }
//     | { getMessages: GetLogMessagesParameters }
//     | { getLatestMessages: GetLatestLogMessagesParameters };
// export type CanisterLogResponse =
//     | { messagesInfo: CanisterLogMessagesInfo }
//     | { messages: CanisterLogMessages };
// export type CanisterMemoryAggregatedData = Array<bigint>;
// export interface CanisterMetrics {
//     data: CanisterMetricsData;
// }
// export type CanisterMetricsData =
//     | { hourly: Array<HourlyMetricsData> }
//     | { daily: Array<DailyMetricsData> };
// export type ChunkContent =
//     | {
//           remote: { args: ChunkRequest; canister: Principal };
//       }
//     | {
//           chunk: {
//               total_chunks: bigint;
//               content: Array<number>;
//               storage_allocation: AllocationRecordStable;
//               current_chunk: [] | [bigint];
//           };
//       };
// export interface ChunkRequest {
//     token_id: string;
//     chunk: [] | [bigint];
//     library_id: string;
// }
// export type ChunkResult = { ok: ChunkContent } | { err: OrigynError };
export interface CollectionInfo {
    multi_canister_count: [] | [bigint];
    managers: [] | [Array<Principal>];
    owner: [] | [Principal];
    metadata: [] | [CandyShared];
    logo: [] | [string];
    name: [] | [string];
    network: [] | [Principal];
    created_at: [] | [bigint];
    fields: [] | [Array<[string, [] | [bigint], [] | [bigint]]>];
    upgraded_at: [] | [bigint];
    token_ids_count: [] | [bigint];
    available_space: [] | [bigint];
    multi_canister: [] | [Array<Principal>];
    token_ids: [] | [Array<string>];
    transaction_count: [] | [bigint];
    unique_holders: [] | [bigint];
    total_supply: [] | [bigint];
    symbol: [] | [string];
    allocated_storage: [] | [bigint];
}
export type CollectionResult = { ok: CollectionInfo } | { err: OrigynError };
// export type DIP721BoolResult = { Ok: boolean } | { Err: NftError };
// export interface DIP721Metadata {
//     logo: [] | [string];
//     name: [] | [string];
//     created_at: bigint;
//     upgraded_at: bigint;
//     custodians: Array<Principal>;
//     symbol: [] | [string];
// }
// export type DIP721NatResult = { Ok: bigint } | { Err: NftError };
// export interface DIP721Stats {
//     cycles: bigint;
//     total_transactions: bigint;
//     total_unique_holders: bigint;
//     total_supply: bigint;
// }
// export type DIP721SupportedInterface =
//     | { Burn: null }
//     | { Mint: null }
//     | { Approval: null }
//     | { TransactionHistory: null };
// export type DIP721TokenMetadata = { Ok: TokenMetadata } | { Err: NftError };
// export type DIP721TokensListMetadata = { Ok: Array<bigint> } | { Err: NftError };
// export type DIP721TokensMetadata = { Ok: Array<TokenMetadata> } | { Err: NftError };
// export interface DailyMetricsData {
//     updateCalls: bigint;
//     canisterHeapMemorySize: NumericEntity;
//     canisterCycles: NumericEntity;
//     canisterMemorySize: NumericEntity;
//     timeMillis: bigint;
// }
// export type Data =
//     | { Int: bigint }
//     | { Map: Array<[CandyShared, CandyShared]> }
//     | { Nat: bigint }
//     | { Set: Array<CandyShared> }
//     | { Nat16: number }
//     | { Nat32: number }
//     | { Nat64: bigint }
//     | { Blob: Array<number> }
//     | { Bool: boolean }
//     | { Int8: number }
//     | { Ints: Array<bigint> }
//     | { Nat8: number }
//     | { Nats: Array<bigint> }
//     | { Text: string }
//     | { Bytes: Array<number> }
//     | { Int16: number }
//     | { Int32: number }
//     | { Int64: bigint }
//     | { Option: [] | [CandyShared] }
//     | { Floats: Array<number> }
//     | { Float: number }
//     | { Principal: Principal }
//     | { Array: Array<CandyShared> }
//     | { Class: Array<PropertyShared> };
export interface DepositDetail {
    token: TokenSpec;
    trx_id: [] | [TransactionID];
    seller: Account;
    buyer: Account;
    amount: bigint;
    sale_id: [] | [string];
}
export interface DepositWithdrawDescription {
    token: TokenSpec;
    withdraw_to: Account;
    buyer: Account;
    amount: bigint;
}
export interface DistributeSaleRequest {
    seller: [] | [Account];
}
export type DistributeSaleResponse = Array<Result>;
// export interface DutchConfig {
//     start_price: bigint;
//     token: TokenSpec;
//     reserve: [] | [bigint];
//     start_date: bigint;
//     allow_list: [] | [Array<Principal>];
//     decay_per_hour: { flat: bigint } | { percent: number };
// }
export interface DutchStateStable {
    status: { closed: null } | { open: null } | { not_started: null };
    winner: [] | [Account];
    end_date: [] | [bigint];
    allow_list: [] | [Array<[Principal, boolean]>];
    current_broker_id: [] | [Principal];
    config: PricingConfig;
}
export type EXTAccountIdentifier = string;
// export type EXTBalance = bigint;
// export interface EXTBalanceRequest {
//     token: EXTTokenIdentifier;
//     user: EXTUser;
// }
// export type EXTBalanceResult = { ok: EXTBalance } | { err: EXTCommonError };
export type EXTBearerResult = { ok: EXTAccountIdentifier } | { err: EXTCommonError };
export type EXTCommonError = { InvalidToken: EXTTokenIdentifier } | { Other: string };
// export type EXTMemo = Array<number>;
// export type EXTMetadata =
//     | {
//           fungible: {
//               decimals: number;
//               metadata: [] | [Array<number>];
//               name: string;
//               symbol: string;
//           };
//       }
//     | { nonfungible: { metadata: [] | [Array<number>] } };
// export type EXTMetadataResult = { ok: EXTMetadata } | { err: EXTCommonError };
// export type EXTSubAccount = Array<number>;
export type EXTTokenIdentifier = string;
// export type EXTTokensResponse = [
//     number,
//     [] | [{ locked: [] | [bigint]; seller: Principal; price: bigint }],
//     [] | [Array<number>],
// ];
// export type EXTTokensResult = { ok: Array<EXTTokensResponse> } | { err: EXTCommonError };
// export interface EXTTransferRequest {
//     to: EXTUser;
//     token: EXTTokenIdentifier;
//     notify: boolean;
//     from: EXTUser;
//     memo: EXTMemo;
//     subaccount: [] | [EXTSubAccount];
//     amount: EXTBalance;
// }
// export type EXTTransferResponse =
//     | { ok: EXTBalance }
//     | {
//           err:
//               | { CannotNotify: EXTAccountIdentifier }
//               | { InsufficientBalance: null }
//               | { InvalidToken: EXTTokenIdentifier }
//               | { Rejected: null }
//               | { Unauthorized: EXTAccountIdentifier }
//               | { Other: string };
//       };
// export type EXTUser = { principal: Principal } | { address: string };
export interface EndSaleResponse {
    token_id: string;
    txn_type:
        | {
              escrow_deposit: {
                  token: TokenSpec;
                  token_id: string;
                  trx_id: TransactionID;
                  seller: Account;
                  extensible: CandyShared;
                  buyer: Account;
                  amount: bigint;
              };
          }
        | {
              canister_network_updated: {
                  network: Principal;
                  extensible: CandyShared;
              };
          }
        | {
              escrow_withdraw: {
                  fee: bigint;
                  token: TokenSpec;
                  token_id: string;
                  trx_id: TransactionID;
                  seller: Account;
                  extensible: CandyShared;
                  buyer: Account;
                  amount: bigint;
              };
          }
        | {
              canister_managers_updated: {
                  managers: Array<Principal>;
                  extensible: CandyShared;
              };
          }
        | {
              auction_bid: {
                  token: TokenSpec;
                  extensible: CandyShared;
                  buyer: Account;
                  amount: bigint;
                  sale_id: string;
              };
          }
        | { burn: { from: [] | [Account]; extensible: CandyShared } }
        | {
              data: {
                  hash: [] | [Array<number>];
                  extensible: CandyShared;
                  data_dapp: [] | [string];
                  data_path: [] | [string];
              };
          }
        | {
              sale_ended: {
                  token: TokenSpec;
                  seller: Account;
                  extensible: CandyShared;
                  buyer: Account;
                  amount: bigint;
                  sale_id: [] | [string];
              };
          }
        | {
              mint: {
                  to: Account;
                  from: Account;
                  sale: [] | [{ token: TokenSpec; amount: bigint }];
                  extensible: CandyShared;
              };
          }
        | {
              royalty_paid: {
                  tag: string;
                  token: TokenSpec;
                  seller: Account;
                  extensible: CandyShared;
                  buyer: Account;
                  amount: bigint;
                  receiver: Account;
                  sale_id: [] | [string];
              };
          }
        | { extensible: CandyShared }
        | {
              owner_transfer: {
                  to: Account;
                  from: Account;
                  extensible: CandyShared;
              };
          }
        | {
              sale_opened: {
                  pricing: PricingConfig;
                  extensible: CandyShared;
                  sale_id: string;
              };
          }
        | {
              canister_owner_updated: {
                  owner: Principal;
                  extensible: CandyShared;
              };
          }
        | {
              sale_withdraw: {
                  fee: bigint;
                  token: TokenSpec;
                  token_id: string;
                  trx_id: TransactionID;
                  seller: Account;
                  extensible: CandyShared;
                  buyer: Account;
                  amount: bigint;
              };
          }
        | {
              deposit_withdraw: {
                  fee: bigint;
                  token: TokenSpec;
                  trx_id: TransactionID;
                  extensible: CandyShared;
                  buyer: Account;
                  amount: bigint;
              };
          };
    timestamp: bigint;
    index: bigint;
}
export type Errors =
    | { nyi: null }
    | { storage_configuration_error: null }
    | { escrow_withdraw_payment_failed: null }
    | { token_not_found: null }
    | { owner_not_found: null }
    | { content_not_found: null }
    | { auction_ended: null }
    | { out_of_range: null }
    | { sale_id_does_not_match: null }
    | { sale_not_found: null }
    | { kyc_fail: null }
    | { item_not_owned: null }
    | { property_not_found: null }
    | { validate_trx_wrong_host: null }
    | { withdraw_too_large: null }
    | { content_not_deserializable: null }
    | { bid_too_low: null }
    | { validate_deposit_wrong_amount: null }
    | { existing_sale_found: null }
    | { asset_mismatch: null }
    | { escrow_cannot_be_removed: null }
    | { deposit_burned: null }
    | { cannot_restage_minted_token: null }
    | { cannot_find_status_in_metadata: null }
    | { receipt_data_mismatch: null }
    | { validate_deposit_failed: null }
    | { unreachable: null }
    | { unauthorized_access: null }
    | { item_already_minted: null }
    | { no_escrow_found: null }
    | { escrow_owner_not_the_owner: null }
    | { improper_interface: null }
    | { app_id_not_found: null }
    | { token_non_transferable: null }
    | { kyc_error: null }
    | { sale_not_over: null }
    | { update_class_error: null }
    | { malformed_metadata: null }
    | { token_id_mismatch: null }
    | { id_not_found_in_metadata: null }
    | { auction_not_started: null }
    | { library_not_found: null }
    | { attempt_to_stage_system_data: null }
    | { validate_deposit_wrong_buyer: null }
    | { not_enough_storage: null }
    | { sales_withdraw_payment_failed: null };
export interface EscrowReceipt {
    token: TokenSpec;
    token_id: string;
    seller: Account;
    buyer: Account;
    amount: bigint;
}
export interface EscrowRecord {
    token: TokenSpec;
    token_id: string;
    seller: Account;
    lock_to_date: [] | [bigint];
    buyer: Account;
    amount: bigint;
    sale_id: [] | [string];
    account_hash: [] | [Array<number>];
}
export interface EscrowRequest {
    token_id: string;
    deposit: DepositDetail;
    lock_to_date: [] | [bigint];
}
export interface EscrowResponse {
    balance: bigint;
    receipt: EscrowReceipt;
    transaction: TransactionRecord;
}
// export type GenericValue =
//     | { Nat64Content: bigint }
//     | { Nat32Content: number }
//     | { BoolContent: boolean }
//     | { Nat8Content: number }
//     | { Int64Content: bigint }
//     | { IntContent: bigint }
//     | { NatContent: bigint }
//     | { Nat16Content: number }
//     | { Int32Content: number }
//     | { Int8Content: number }
//     | { FloatContent: number }
//     | { Int16Content: number }
//     | { BlobContent: Array<number> }
//     | { NestedContent: Vec }
//     | { Principal: Principal }
//     | { TextContent: string };
// export interface GetLatestLogMessagesParameters {
//     upToTimeNanos: [] | [Nanos];
//     count: number;
//     filter: [] | [GetLogMessagesFilter];
// }
// export interface GetLogMessagesFilter {
//     analyzeCount: number;
//     messageRegex: [] | [string];
//     messageContains: [] | [string];
// }
// export interface GetLogMessagesParameters {
//     count: number;
//     filter: [] | [GetLogMessagesFilter];
//     fromTimeNanos: [] | [Nanos];
// }
// export interface GetMetricsParameters {
//     dateToMillis: bigint;
//     granularity: MetricsGranularity;
//     dateFromMillis: bigint;
// }
// export type GovernanceRequest =
//     | {
//           update_system_var: {
//               key: string;
//               val: CandyShared;
//               token_id: string;
//           };
//       }
//     | { clear_shared_wallets: string };
// export type GovernanceResponse = { update_system_var: boolean } | { clear_shared_wallets: boolean };
// export type GovernanceResult = { ok: GovernanceResponse } | { err: OrigynError };
// export interface HTTPResponse {
//     body: Array<number>;
//     headers: Array<HeaderField>;
//     streaming_strategy: [] | [StreamingStrategy];
//     status_code: number;
// }
// export type HeaderField = [string, string];
// export type HistoryResult = { ok: Array<TransactionRecord> } | { err: OrigynError };
// export interface HourlyMetricsData {
//     updateCalls: UpdateCallsAggregatedData;
//     canisterHeapMemorySize: CanisterHeapMemoryAggregatedData;
//     canisterCycles: CanisterCyclesAggregatedData;
//     canisterMemorySize: CanisterMemoryAggregatedData;
//     timeMillis: bigint;
// }
// export interface HttpRequest {
//     url: string;
//     method: string;
//     body: Array<number>;
//     headers: Array<HeaderField>;
// }
export interface ICTokenSpec {
    id: [] | [bigint];
    fee: [] | [bigint];
    decimals: bigint;
    canister: Principal;
    standard:
        | { ICRC1: null }
        | { EXTFungible: null }
        | { DIP20: null }
        | { Other: CandyShared }
        | { Ledger: null };
    symbol: string;
}
// export interface LogMessagesData {
//     data: Data;
//     timeNanos: Nanos;
//     message: string;
//     caller: Caller;
// }
// export type ManageCollectionCommand =
//     | { UpdateOwner: Principal }
//     | { UpdateManagers: Array<Principal> }
//     | { UpdateMetadata: [string, [] | [CandyShared], boolean] }
//     | { UpdateAnnounceCanister: [] | [Principal] }
//     | { UpdateNetwork: [] | [Principal] }
//     | { UpdateSymbol: [] | [string] }
//     | { UpdateLogo: [] | [string] }
//     | { UpdateName: [] | [string] };
export type ManageSaleRequest =
    | { bid: BidRequest }
    | { escrow_deposit: EscrowRequest }
    | { withdraw: WithdrawRequest }
    | { end_sale: string }
    | { refresh_offers: [] | [Account] }
    | { distribute_sale: DistributeSaleRequest }
    | { open_sale: string };
export type ManageSaleResponse =
    | { bid: BidResponse }
    | { escrow_deposit: EscrowResponse }
    | { withdraw: WithdrawResponse }
    | { end_sale: EndSaleResponse }
    | { refresh_offers: Array<EscrowRecord> }
    | { distribute_sale: DistributeSaleResponse }
    | { open_sale: boolean };
export type ManageSaleResult = { ok: ManageSaleResponse } | { err: OrigynError };
// export type ManageStorageRequest =
//     | {
//           add_storage_canisters: Array<[Principal, bigint, [bigint, bigint, bigint]]>;
//       }
//     | {
//           configure_storage: { stableBtree: [] | [bigint] } | { heap: [] | [bigint] };
//       };
// export type ManageStorageResponse =
//     | {
//           add_storage_canisters: [bigint, bigint];
//       }
//     | { configure_storage: [bigint, bigint] };
// export type ManageStorageResult = { ok: ManageStorageResponse } | { err: OrigynError };
export interface MarketTransferRequest {
    token_id: string;
    sales_config: SalesConfig;
}
export interface MarketTransferRequestReponse {
    token_id: string;
    txn_type:
        | {
              escrow_deposit: {
                  token: TokenSpec;
                  token_id: string;
                  trx_id: TransactionID;
                  seller: Account;
                  extensible: CandyShared;
                  buyer: Account;
                  amount: bigint;
              };
          }
        | {
              canister_network_updated: {
                  network: Principal;
                  extensible: CandyShared;
              };
          }
        | {
              escrow_withdraw: {
                  fee: bigint;
                  token: TokenSpec;
                  token_id: string;
                  trx_id: TransactionID;
                  seller: Account;
                  extensible: CandyShared;
                  buyer: Account;
                  amount: bigint;
              };
          }
        | {
              canister_managers_updated: {
                  managers: Array<Principal>;
                  extensible: CandyShared;
              };
          }
        | {
              auction_bid: {
                  token: TokenSpec;
                  extensible: CandyShared;
                  buyer: Account;
                  amount: bigint;
                  sale_id: string;
              };
          }
        | { burn: { from: [] | [Account]; extensible: CandyShared } }
        | {
              data: {
                  hash: [] | [Array<number>];
                  extensible: CandyShared;
                  data_dapp: [] | [string];
                  data_path: [] | [string];
              };
          }
        | {
              sale_ended: {
                  token: TokenSpec;
                  seller: Account;
                  extensible: CandyShared;
                  buyer: Account;
                  amount: bigint;
                  sale_id: [] | [string];
              };
          }
        | {
              mint: {
                  to: Account;
                  from: Account;
                  sale: [] | [{ token: TokenSpec; amount: bigint }];
                  extensible: CandyShared;
              };
          }
        | {
              royalty_paid: {
                  tag: string;
                  token: TokenSpec;
                  seller: Account;
                  extensible: CandyShared;
                  buyer: Account;
                  amount: bigint;
                  receiver: Account;
                  sale_id: [] | [string];
              };
          }
        | { extensible: CandyShared }
        | {
              owner_transfer: {
                  to: Account;
                  from: Account;
                  extensible: CandyShared;
              };
          }
        | {
              sale_opened: {
                  pricing: PricingConfig;
                  extensible: CandyShared;
                  sale_id: string;
              };
          }
        | {
              canister_owner_updated: {
                  owner: Principal;
                  extensible: CandyShared;
              };
          }
        | {
              sale_withdraw: {
                  fee: bigint;
                  token: TokenSpec;
                  token_id: string;
                  trx_id: TransactionID;
                  seller: Account;
                  extensible: CandyShared;
                  buyer: Account;
                  amount: bigint;
              };
          }
        | {
              deposit_withdraw: {
                  fee: bigint;
                  token: TokenSpec;
                  trx_id: TransactionID;
                  extensible: CandyShared;
                  buyer: Account;
                  amount: bigint;
              };
          };
    timestamp: bigint;
    index: bigint;
}
export type MarketTransferResult = { ok: MarketTransferRequestReponse } | { err: OrigynError };
// export type MetricsGranularity = { hourly: null } | { daily: null };
// export interface NFTBackupChunk {
//     sales_balances: StableSalesBalances;
//     offers: StableOffers;
//     collection_data: StableCollectionData;
//     nft_ledgers: StableNftLedger;
//     canister: Principal;
//     allocations: Array<[[string, string], AllocationRecordStable]>;
//     nft_sales: Array<[string, SaleStatusStable]>;
//     buckets: Array<[Principal, StableBucketData]>;
//     escrow_balances: StableEscrowBalances;
// }
export type NFTInfoResult = { ok: NFTInfoStable } | { err: OrigynError };
export interface NFTInfoStable {
    metadata: CandyShared;
    current_sale: [] | [SaleStatusStable];
}
// export type NFTUpdateRequest =
//     | {
//           update: {
//               token_id: string;
//               update: UpdateRequestShared;
//               app_id: string;
//           };
//       }
//     | { replace: { token_id: string; data: CandyShared } };
export type NFTUpdateResponse = boolean;
// export type NFTUpdateResult = { ok: NFTUpdateResponse } | { err: OrigynError };
// export type Nanos = bigint;
// export type NftError =
//     | { UnauthorizedOperator: null }
//     | { SelfTransfer: null }
//     | { TokenNotFound: null }
//     | { UnauthorizedOwner: null }
//     | { TxNotFound: null }
//     | { SelfApprove: null }
//     | { OperatorNotFound: null }
//     | { ExistedNFT: null }
//     | { OwnerNotFound: null }
//     | { Other: string };
// export interface NiftyConfig {
//     fixed: boolean;
//     interestRatePerSecond: number;
//     token: TokenSpec;
//     duration: [] | [bigint];
//     expiration: [] | [bigint];
//     amount: bigint;
//     lenderOffer: boolean;
// }
export interface NiftyStateStable {
    status: { closed: null } | { open: null } | { not_started: null };
    min_bid: bigint;
    winner: [] | [Account];
    end_date: bigint;
    allow_list: [] | [Array<[Principal, boolean]>];
    current_broker_id: [] | [Principal];
    config: PricingConfig;
}
// export interface NumericEntity {
//     avg: bigint;
//     max: bigint;
//     min: bigint;
//     first: bigint;
//     last: bigint;
// }
// export type OrigynBoolResult = { ok: boolean } | { err: OrigynError };
export interface OrigynError {
    text: string;
    error: Errors;
    number: number;
    flag_point: string;
}
// export type OrigynTextResult = { ok: string } | { err: OrigynError };
// export type OwnerOfResponse = { Ok: [] | [Principal] } | { Err: NftError };
// export interface OwnerTransferResponse {
//     transaction: TransactionRecord;
//     assets: Array<CandyShared>;
// }
// export type OwnerUpdateResult = { ok: OwnerTransferResponse } | { err: OrigynError };
export type PricingConfig =
    | {
          flat: { token: TokenSpec; amount: bigint };
      }
    | { extensible: CandyShared }
    | { instant: null }
    | { nifty: NiftyConfig }
    | { auction: AuctionConfig }
    | { dutch: DutchConfig };
export interface PropertyShared {
    value: CandyShared;
    name: string;
    immutable: boolean;
}
export interface RejectDescription {
    token: TokenSpec;
    token_id: string;
    seller: Account;
    buyer: Account;
}
export type Result = { ok: ManageSaleResponse } | { err: OrigynError };
export type SaleInfoRequest =
    | { status: string }
    | { active: [] | [[bigint, bigint]] }
    | { deposit_info: [] | [Account] }
    | { history: [] | [[bigint, bigint]] };
export type SaleInfoResponse =
    | { status: [] | [SaleStatusStable] }
    | {
          active: {
              eof: boolean;
              records: Array<[string, [] | [SaleStatusStable]]>;
              count: bigint;
          };
      }
    | { deposit_info: SubAccountInfo }
    | {
          history: {
              eof: boolean;
              records: Array<[] | [SaleStatusStable]>;
              count: bigint;
          };
      };
export type SaleInfoResult = { ok: SaleInfoResponse } | { err: OrigynError };
export interface SaleStatusStable {
    token_id: string;
    sale_type:
        | { nifty: NiftyStateStable }
        | { auction: AuctionStateStable }
        | { dutch: DutchStateStable };
    broker_id: [] | [Principal];
    original_broker_id: [] | [Principal];
    sale_id: string;
}
export interface SalesConfig {
    broker_id: [] | [Principal];
    pricing: PricingConfig;
    escrow_receipt: [] | [EscrowReceipt];
}
// export interface ShareWalletRequest {
//     to: Account;
//     token_id: string;
//     from: Account;
// }
// export interface StableBucketData {
//     principal: Principal;
//     allocated_space: bigint;
//     date_added: bigint;
//     version: [bigint, bigint, bigint];
//     b_gateway: boolean;
//     available_space: bigint;
//     allocations: Array<[[string, string], bigint]>;
// }
// export interface StableCollectionData {
//     active_bucket: [] | [Principal];
//     managers: Array<Principal>;
//     owner: Principal;
//     metadata: [] | [CandyShared];
//     logo: [] | [string];
//     name: [] | [string];
//     network: [] | [Principal];
//     available_space: bigint;
//     symbol: [] | [string];
//     allocated_storage: bigint;
// }
// export type StableEscrowBalances = Array<[Account, Account, string, EscrowRecord]>;
// export type StableNftLedger = Array<[string, TransactionRecord]>;
// export type StableOffers = Array<[Account, Account, bigint]>;
// export type StableSalesBalances = Array<[Account, Account, string, EscrowRecord]>;
// export interface StageChunkArg {
//     content: Array<number>;
//     token_id: string;
//     chunk: bigint;
//     filedata: CandyShared;
//     library_id: string;
// }
// export interface StageLibraryResponse {
//     canister: Principal;
// }
// export type StageLibraryResult = { ok: StageLibraryResponse } | { err: OrigynError };
// export interface StakeRecord {
//     staker: Account;
//     token_id: string;
//     amount: bigint;
// }
// export interface StateSize {
//     sales_balances: bigint;
//     offers: bigint;
//     nft_ledgers: bigint;
//     allocations: bigint;
//     nft_sales: bigint;
//     buckets: bigint;
//     escrow_balances: bigint;
// }
// export interface StorageMetrics {
//     gateway: Principal;
//     available_space: bigint;
//     allocations: Array<AllocationRecordStable>;
//     allocated_storage: bigint;
// }
// export type StorageMetricsResult = { ok: StorageMetrics } | { err: OrigynError };
// export interface StreamingCallbackResponse {
//     token: [] | [StreamingCallbackToken];
//     body: Array<number>;
// }
// export interface StreamingCallbackToken {
//     key: string;
//     index: bigint;
//     content_encoding: string;
// }
// export type StreamingStrategy = {
//     Callback: {
//         token: StreamingCallbackToken;
//         callback: [Principal, string];
//     };
// };
export interface SubAccountInfo {
    account_id: Array<number>;
    principal: Principal;
    account_id_text: string;
    account: { principal: Principal; sub_account: Array<number> };
}
// export interface TokenMetadata {
//     transferred_at: [] | [bigint];
//     transferred_by: [] | [Principal];
//     owner: [] | [Principal];
//     operator: [] | [Principal];
//     approved_at: [] | [bigint];
//     approved_by: [] | [Principal];
//     properties: Array<[string, GenericValue]>;
//     is_burned: boolean;
//     token_identifier: bigint;
//     burned_at: [] | [bigint];
//     burned_by: [] | [Principal];
//     minted_at: bigint;
//     minted_by: Principal;
// }
export type TokenSpec = { ic: ICTokenSpec } | { extensible: CandyShared };
export type TransactionID = { nat: bigint } | { text: string } | { extensible: CandyShared };
export interface TransactionRecord {
    token_id: string;
    txn_type:
        | {
              escrow_deposit: {
                  token: TokenSpec;
                  token_id: string;
                  trx_id: TransactionID;
                  seller: Account;
                  extensible: CandyShared;
                  buyer: Account;
                  amount: bigint;
              };
          }
        | {
              canister_network_updated: {
                  network: Principal;
                  extensible: CandyShared;
              };
          }
        | {
              escrow_withdraw: {
                  fee: bigint;
                  token: TokenSpec;
                  token_id: string;
                  trx_id: TransactionID;
                  seller: Account;
                  extensible: CandyShared;
                  buyer: Account;
                  amount: bigint;
              };
          }
        | {
              canister_managers_updated: {
                  managers: Array<Principal>;
                  extensible: CandyShared;
              };
          }
        | {
              auction_bid: {
                  token: TokenSpec;
                  extensible: CandyShared;
                  buyer: Account;
                  amount: bigint;
                  sale_id: string;
              };
          }
        | { burn: { from: [] | [Account]; extensible: CandyShared } }
        | {
              data: {
                  hash: [] | [Array<number>];
                  extensible: CandyShared;
                  data_dapp: [] | [string];
                  data_path: [] | [string];
              };
          }
        | {
              sale_ended: {
                  token: TokenSpec;
                  seller: Account;
                  extensible: CandyShared;
                  buyer: Account;
                  amount: bigint;
                  sale_id: [] | [string];
              };
          }
        | {
              mint: {
                  to: Account;
                  from: Account;
                  sale: [] | [{ token: TokenSpec; amount: bigint }];
                  extensible: CandyShared;
              };
          }
        | {
              royalty_paid: {
                  tag: string;
                  token: TokenSpec;
                  seller: Account;
                  extensible: CandyShared;
                  buyer: Account;
                  amount: bigint;
                  receiver: Account;
                  sale_id: [] | [string];
              };
          }
        | { extensible: CandyShared }
        | {
              owner_transfer: {
                  to: Account;
                  from: Account;
                  extensible: CandyShared;
              };
          }
        | {
              sale_opened: {
                  pricing: PricingConfig;
                  extensible: CandyShared;
                  sale_id: string;
              };
          }
        | {
              canister_owner_updated: {
                  owner: Principal;
                  extensible: CandyShared;
              };
          }
        | {
              sale_withdraw: {
                  fee: bigint;
                  token: TokenSpec;
                  token_id: string;
                  trx_id: TransactionID;
                  seller: Account;
                  extensible: CandyShared;
                  buyer: Account;
                  amount: bigint;
              };
          }
        | {
              deposit_withdraw: {
                  fee: bigint;
                  token: TokenSpec;
                  trx_id: TransactionID;
                  extensible: CandyShared;
                  buyer: Account;
                  amount: bigint;
              };
          };
    timestamp: bigint;
    index: bigint;
}
// export type UpdateCallsAggregatedData = Array<bigint>;
// export type UpdateModeShared =
//     | { Set: CandyShared }
//     | { Lock: CandyShared }
//     | { Next: Array<UpdateShared> };
// export interface UpdateRequestShared {
//     id: string;
//     update: Array<UpdateShared>;
// }
// export interface UpdateShared {
//     mode: UpdateModeShared;
//     name: string;
// }
// export type Vec = Array<
//     [
//         string,
//         (
//             | { Nat64Content: bigint }
//             | { Nat32Content: number }
//             | { BoolContent: boolean }
//             | { Nat8Content: number }
//             | { Int64Content: bigint }
//             | { IntContent: bigint }
//             | { NatContent: bigint }
//             | { Nat16Content: number }
//             | { Int32Content: number }
//             | { Int8Content: number }
//             | { FloatContent: number }
//             | { Int16Content: number }
//             | { BlobContent: Array<number> }
//             | { NestedContent: Vec }
//             | { Principal: Principal }
//             | { TextContent: string }
//         ),
//     ]
// >;
export interface WithdrawDescription {
    token: TokenSpec;
    token_id: string;
    seller: Account;
    withdraw_to: Account;
    buyer: Account;
    amount: bigint;
}
export type WithdrawRequest =
    | { reject: RejectDescription }
    | { sale: WithdrawDescription }
    | { deposit: DepositWithdrawDescription }
    | { escrow: WithdrawDescription };
export interface WithdrawResponse {
    token_id: string;
    txn_type:
        | {
              escrow_deposit: {
                  token: TokenSpec;
                  token_id: string;
                  trx_id: TransactionID;
                  seller: Account;
                  extensible: CandyShared;
                  buyer: Account;
                  amount: bigint;
              };
          }
        | {
              canister_network_updated: {
                  network: Principal;
                  extensible: CandyShared;
              };
          }
        | {
              escrow_withdraw: {
                  fee: bigint;
                  token: TokenSpec;
                  token_id: string;
                  trx_id: TransactionID;
                  seller: Account;
                  extensible: CandyShared;
                  buyer: Account;
                  amount: bigint;
              };
          }
        | {
              canister_managers_updated: {
                  managers: Array<Principal>;
                  extensible: CandyShared;
              };
          }
        | {
              auction_bid: {
                  token: TokenSpec;
                  extensible: CandyShared;
                  buyer: Account;
                  amount: bigint;
                  sale_id: string;
              };
          }
        | { burn: { from: [] | [Account]; extensible: CandyShared } }
        | {
              data: {
                  hash: [] | [Array<number>];
                  extensible: CandyShared;
                  data_dapp: [] | [string];
                  data_path: [] | [string];
              };
          }
        | {
              sale_ended: {
                  token: TokenSpec;
                  seller: Account;
                  extensible: CandyShared;
                  buyer: Account;
                  amount: bigint;
                  sale_id: [] | [string];
              };
          }
        | {
              mint: {
                  to: Account;
                  from: Account;
                  sale: [] | [{ token: TokenSpec; amount: bigint }];
                  extensible: CandyShared;
              };
          }
        | {
              royalty_paid: {
                  tag: string;
                  token: TokenSpec;
                  seller: Account;
                  extensible: CandyShared;
                  buyer: Account;
                  amount: bigint;
                  receiver: Account;
                  sale_id: [] | [string];
              };
          }
        | { extensible: CandyShared }
        | {
              owner_transfer: {
                  to: Account;
                  from: Account;
                  extensible: CandyShared;
              };
          }
        | {
              sale_opened: {
                  pricing: PricingConfig;
                  extensible: CandyShared;
                  sale_id: string;
              };
          }
        | {
              canister_owner_updated: {
                  owner: Principal;
                  extensible: CandyShared;
              };
          }
        | {
              sale_withdraw: {
                  fee: bigint;
                  token: TokenSpec;
                  token_id: string;
                  trx_id: TransactionID;
                  seller: Account;
                  extensible: CandyShared;
                  buyer: Account;
                  amount: bigint;
              };
          }
        | {
              deposit_withdraw: {
                  fee: bigint;
                  token: TokenSpec;
                  trx_id: TransactionID;
                  extensible: CandyShared;
                  buyer: Account;
                  amount: bigint;
              };
          };
    timestamp: bigint;
    index: bigint;
}
// export type canister_id = Principal;
// export interface canister_status {
//     status: { stopped: null } | { stopping: null } | { running: null };
//     memory_size: bigint;
//     cycles: bigint;
//     settings: definite_canister_settings;
//     module_hash: [] | [Array<number>];
// }
// export interface definite_canister_settings {
//     freezing_threshold: bigint;
//     controllers: [] | [Array<Principal>];
//     memory_allocation: bigint;
//     compute_allocation: bigint;
// }
export default interface _SERVICE {
    // __advance_time: (arg_0: bigint) => Promise<bigint>;
    // __set_time_mode: (arg_0: { test: null } | { standard: null }) => Promise<boolean>;
    // __supports: () => Promise<Array<[string, string]>>;
    // back_up: (arg_0: bigint) => Promise<{ eof: NFTBackupChunk } | { data: NFTBackupChunk }>;
    // balance: (arg_0: EXTBalanceRequest) => Promise<EXTBalanceResult>;
    // balanceEXT: (arg_0: EXTBalanceRequest) => Promise<EXTBalanceResult>;
    // balance_of_batch_nft_origyn: (arg_0: Array<Account>) => Promise<Array<BalanceResult>>;
    // balance_of_nft_origyn: (arg_0: Account) => Promise<BalanceResult>;
    // balance_of_secure_batch_nft_origyn: (arg_0: Array<Account>) => Promise<Array<BalanceResult>>;
    // balance_of_secure_nft_origyn: (arg_0: Account) => Promise<BalanceResult>;
    // bearer: (arg_0: EXTTokenIdentifier) => Promise<EXTBearerResult>;
    bearerEXT: (arg_0: EXTTokenIdentifier) => Promise<EXTBearerResult>;
    bearer_batch_nft_origyn: (arg_0: Array<string>) => Promise<Array<BearerResult>>;
    // bearer_batch_secure_nft_origyn: (arg_0: Array<string>) => Promise<Array<BearerResult>>;
    // bearer_nft_origyn: (arg_0: string) => Promise<BearerResult>;
    // bearer_secure_nft_origyn: (arg_0: string) => Promise<BearerResult>;
    // canister_status: (arg_0: { canister_id: canister_id }) => Promise<canister_status>;
    // chunk_nft_origyn: (arg_0: ChunkRequest) => Promise<ChunkResult>;
    // chunk_secure_nft_origyn: (arg_0: ChunkRequest) => Promise<ChunkResult>;
    // collectCanisterMetrics: () => Promise<undefined>;
    collection_nft_origyn: (
        arg_0: [] | [Array<[string, [] | [bigint], [] | [bigint]]>],
    ) => Promise<CollectionResult>;
    // collection_secure_nft_origyn: (
    //     arg_0: [] | [Array<[string, [] | [bigint], [] | [bigint]]>],
    // ) => Promise<CollectionResult>;
    // collection_update_batch_nft_origyn: (
    //     arg_0: Array<ManageCollectionCommand>,
    // ) => Promise<Array<OrigynBoolResult>>;
    // collection_update_nft_origyn: (arg_0: ManageCollectionCommand) => Promise<OrigynBoolResult>;
    // cycles: () => Promise<bigint>;
    // dip721_balance_of: (arg_0: Principal) => Promise<bigint>;
    // dip721_custodians: () => Promise<Array<Principal>>;
    // dip721_is_approved_for_all: (arg_0: Principal, arg_1: Principal) => Promise<DIP721BoolResult>;
    // dip721_logo: () => Promise<[] | [string]>;
    // dip721_metadata: () => Promise<DIP721Metadata>;
    // dip721_name: () => Promise<[] | [string]>;
    // dip721_operator_token_identifiers: (arg_0: Principal) => Promise<DIP721TokensListMetadata>;
    // dip721_operator_token_metadata: (arg_0: Principal) => Promise<DIP721TokensMetadata>;
    // dip721_owner_of: (arg_0: bigint) => Promise<OwnerOfResponse>;
    // dip721_owner_token_identifiers: (arg_0: Principal) => Promise<DIP721TokensListMetadata>;
    // dip721_owner_token_metadata: (arg_0: Principal) => Promise<DIP721TokensMetadata>;
    // dip721_stats: () => Promise<DIP721Stats>;
    // dip721_supported_interfaces: () => Promise<Array<DIP721SupportedInterface>>;
    // dip721_symbol: () => Promise<[] | [string]>;
    // dip721_token_metadata: (arg_0: bigint) => Promise<DIP721TokenMetadata>;
    // dip721_total_supply: () => Promise<bigint>;
    // dip721_total_transactions: () => Promise<bigint>;
    // dip721_transfer: (arg_0: Principal, arg_1: bigint) => Promise<DIP721NatResult>;
    // dip721_transfer_from: (
    //     arg_0: Principal,
    //     arg_1: Principal,
    //     arg_2: bigint,
    // ) => Promise<DIP721NatResult>;
    // getCanisterLog: (arg_0: [] | [CanisterLogRequest]) => Promise<[] | [CanisterLogResponse]>;
    // getCanisterMetrics: (arg_0: GetMetricsParameters) => Promise<[] | [CanisterMetrics]>;
    // getEXTTokenIdentifier: (arg_0: string) => Promise<string>;
    // get_access_key: () => Promise<OrigynTextResult>;
    // get_halt: () => Promise<boolean>;
    // get_nat_as_token_id_origyn: (arg_0: bigint) => Promise<string>;
    // get_token_id_as_nat_origyn: (arg_0: string) => Promise<bigint>;
    // governance_batch_nft_origyn: (
    //     arg_0: Array<GovernanceRequest>,
    // ) => Promise<Array<GovernanceResult>>;
    // governance_nft_origyn: (arg_0: GovernanceRequest) => Promise<GovernanceResult>;
    // history_batch_nft_origyn: (
    //     arg_0: Array<[string, [] | [bigint], [] | [bigint]]>,
    // ) => Promise<Array<HistoryResult>>;
    // history_batch_secure_nft_origyn: (
    //     arg_0: Array<[string, [] | [bigint], [] | [bigint]]>,
    // ) => Promise<Array<HistoryResult>>;
    // history_nft_origyn: (
    //     arg_0: string,
    //     arg_1: [] | [bigint],
    //     arg_2: [] | [bigint],
    // ) => Promise<HistoryResult>;
    // history_secure_nft_origyn: (
    //     arg_0: string,
    //     arg_1: [] | [bigint],
    //     arg_2: [] | [bigint],
    // ) => Promise<HistoryResult>;
    // http_access_key: () => Promise<OrigynTextResult>;
    // http_request: (arg_0: HttpRequest) => Promise<HTTPResponse>;
    // http_request_streaming_callback: (
    //     arg_0: StreamingCallbackToken,
    // ) => Promise<StreamingCallbackResponse>;
    // manage_storage_nft_origyn: (arg_0: ManageStorageRequest) => Promise<ManageStorageResult>;
    // market_transfer_batch_nft_origyn: (
    //     arg_0: Array<MarketTransferRequest>,
    // ) => Promise<Array<MarketTransferResult>>;
    market_transfer_nft_origyn: (arg_0: MarketTransferRequest) => Promise<MarketTransferResult>;
    // metadata: () => Promise<DIP721Metadata>;
    // metadataExt: (arg_0: EXTTokenIdentifier) => Promise<EXTMetadataResult>;
    // mint_batch_nft_origyn: (arg_0: Array<[string, Account]>) => Promise<Array<OrigynTextResult>>;
    // mint_nft_origyn: (arg_0: string, arg_1: Account) => Promise<OrigynTextResult>;
    // nftStreamingCallback: (arg_0: StreamingCallbackToken) => Promise<StreamingCallbackResponse>;
    nft_batch_origyn: (arg_0: Array<string>) => Promise<Array<NFTInfoResult>>;
    // nft_batch_secure_origyn: (arg_0: Array<string>) => Promise<Array<NFTInfoResult>>;
    nft_origyn: (arg_0: string) => Promise<NFTInfoResult>;
    // nft_secure_origyn: (arg_0: string) => Promise<NFTInfoResult>;
    // operaterTokenMetadata: (arg_0: Principal) => Promise<DIP721TokensMetadata>;
    // ownerOf: (arg_0: bigint) => Promise<OwnerOfResponse>;
    // ownerTokenMetadata: (arg_0: Principal) => Promise<DIP721TokensMetadata>;
    sale_batch_nft_origyn: (arg_0: Array<ManageSaleRequest>) => Promise<Array<ManageSaleResult>>;
    // sale_info_batch_nft_origyn: (arg_0: Array<SaleInfoRequest>) => Promise<Array<SaleInfoResult>>;
    // sale_info_batch_secure_nft_origyn: (
    //     arg_0: Array<SaleInfoRequest>,
    // ) => Promise<Array<SaleInfoResult>>;
    sale_info_nft_origyn: (arg_0: SaleInfoRequest) => Promise<SaleInfoResult>;
    // sale_info_secure_nft_origyn: (arg_0: SaleInfoRequest) => Promise<SaleInfoResult>;
    sale_nft_origyn: (arg_0: ManageSaleRequest) => Promise<ManageSaleResult>;
    // set_data_harvester: (arg_0: bigint) => Promise<undefined>;
    // set_halt: (arg_0: boolean) => Promise<undefined>;
    // share_wallet_nft_origyn: (arg_0: ShareWalletRequest) => Promise<OwnerUpdateResult>;
    // stage_batch_nft_origyn: (
    //     arg_0: Array<{ metadata: CandyShared }>,
    // ) => Promise<Array<OrigynTextResult>>;
    // stage_library_batch_nft_origyn: (
    //     arg_0: Array<StageChunkArg>,
    // ) => Promise<Array<StageLibraryResult>>;
    // stage_library_nft_origyn: (arg_0: StageChunkArg) => Promise<StageLibraryResult>;
    // stage_nft_origyn: (arg_0: { metadata: CandyShared }) => Promise<OrigynTextResult>;
    // state_size: () => Promise<StateSize>;
    // storage_info_nft_origyn: () => Promise<StorageMetricsResult>;
    // storage_info_secure_nft_origyn: () => Promise<StorageMetricsResult>;
    // tokens_ext: (arg_0: string) => Promise<EXTTokensResult>;
    // transfer: (arg_0: EXTTransferRequest) => Promise<EXTTransferResponse>;
    // transferDip721: (arg_0: Principal, arg_1: bigint) => Promise<DIP721NatResult>;
    // transferEXT: (arg_0: EXTTransferRequest) => Promise<EXTTransferResponse>;
    // transferFrom: (arg_0: Principal, arg_1: Principal, arg_2: bigint) => Promise<DIP721NatResult>;
    // transferFromDip721: (
    //     arg_0: Principal,
    //     arg_1: Principal,
    //     arg_2: bigint,
    // ) => Promise<DIP721NatResult>;
    // update_app_nft_origyn: (arg_0: NFTUpdateRequest) => Promise<NFTUpdateResult>;
    // wallet_receive: () => Promise<bigint>;
    // whoami: () => Promise<Principal>;
}
