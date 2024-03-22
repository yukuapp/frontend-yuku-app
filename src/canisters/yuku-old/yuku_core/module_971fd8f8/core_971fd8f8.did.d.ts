import type { ActorMethod } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';

export type AccountIdentifier = string;
export type AccountIdentifier__1 = string;
export type AccountIdentifier__2 = string;
export interface AddCart {
    nftUrl: string;
    tokenIdentifier: TokenIdentifier;
    nftName: string;
}
export interface Auction {
    fee: Fee;
    ttl: bigint;
    highestBidder: [] | [Principal];
    tokenIdentifier: TokenIdentifier__2;
    seller: Principal;
    resevePrice: [] | [Price__2];
    highestPrice: [] | [Price__2];
    startPrice: Price__2;
}
export type BatchTradeResult =
    | {
          ok: { Memo: bigint; Price: bigint };
      }
    | { err: Err__1 };
export type BatchVerifyResult = { ok: Array<TokenIdentifier> } | { err: Err };
export type BlockIndex = bigint;
export type CandyShared =
    | { Int: bigint }
    | { Map: Array<[CandyShared, CandyShared]> }
    | { Nat: bigint }
    | { Set: Array<CandyShared> }
    | { Nat16: number }
    | { Nat32: number }
    | { Nat64: bigint }
    | { Blob: Uint8Array | number[] }
    | { Bool: boolean }
    | { Int8: number }
    | { Ints: Array<bigint> }
    | { Nat8: number }
    | { Nats: Array<bigint> }
    | { Text: string }
    | { Bytes: Uint8Array | number[] }
    | { Int16: number }
    | { Int32: number }
    | { Int64: bigint }
    | { Option: [] | [CandyShared] }
    | { Floats: Array<number> }
    | { Float: number }
    | { Principal: Principal }
    | { Array: Array<CandyShared> }
    | { Class: Array<PropertyShared> };
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
export type CanisterLogFeature = { filterMessageByContains: null } | { filterMessageByRegex: null };
export interface CanisterLogMessages {
    data: Array<LogMessagesData>;
    lastAnalyzedMessageTimeNanos: [] | [Nanos];
}
export interface CanisterLogMessagesInfo {
    features: Array<[] | [CanisterLogFeature]>;
    lastTimeNanos: [] | [Nanos];
    count: number;
    firstTimeNanos: [] | [Nanos];
}
export type CanisterLogRequest =
    | { getMessagesInfo: null }
    | { getMessages: GetLogMessagesParameters }
    | { getLatestMessages: GetLatestLogMessagesParameters };
export type CanisterLogResponse =
    | { messagesInfo: CanisterLogMessagesInfo }
    | { messages: CanisterLogMessages };
export type Category = string;
export interface CollectionCreatorData {
    bio: string;
    userName: string;
    userId: UserId;
    time: Time;
    avatar: Img__1;
}
export interface CollectionData {
    creator: [] | [CollectionCreatorData];
    info: CollectionInfo__1;
    stats: [] | [CollectionStatsImmut];
}
export type CollectionErr =
    | { perMaxCollNum: null }
    | { guestCannotCreateCollection: null }
    | { maxCollNum: null };
export interface CollectionFilterArgs {
    creator: [] | [Array<UserId>];
    name: [] | [string];
    category: [] | [Array<string>];
}
export interface CollectionInfo {
    url: [] | [string];
    creator: UserId;
    featured: [] | [Img__1];
    logo: [] | [Img__1];
    name: string;
    banner: [] | [Img__1];
    description: [] | [string];
    links: [] | [Links];
    isVisible: boolean;
    royalties: Royality;
    category: [] | [Category];
    standard: Standard;
    releaseTime: [] | [Time];
    canisterId: Principal;
}
export interface CollectionInfo__1 {
    url: [] | [string];
    creator: UserId;
    featured: [] | [Img__1];
    logo: [] | [Img__1];
    name: string;
    banner: [] | [Img__1];
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
    featured: [] | [Img__1];
    logo: [] | [Img__1];
    name: [] | [string];
    banner: [] | [Img__1];
    description: [] | [string];
    links: [] | [Links];
    isVisible: boolean;
    royalties: Royality;
    category: [] | [Category];
    standard: Standard;
    releaseTime: [] | [Time];
    openTime: [] | [Time];
}
export interface CollectionSortFilterArgs {
    filterArgs: CollectionFilterArgs;
    offset: bigint;
    limit: bigint;
    ascending: boolean;
    sortingField: CollectionSortingField;
}
export type CollectionSortingField =
    | { listingNumber: null }
    | { name: null }
    | { createTime: null }
    | { floorPrice: null }
    | { volumeTrade: null };
export interface CollectionStatsImmut {
    listings: Array<Listings>;
    tradeCount: bigint;
    createTime: Time;
    floorPrice: Price__2;
    volumeTrade: Price__2;
}
export interface CreatorInfo {
    userName: string;
    user: UserId__1;
    canister: Principal;
}
export interface DealPrice {
    token: TokenSpec;
    price: bigint;
}
export interface DutchAuction {
    fee: Fee;
    startTime: Time;
    token: TokenSpec__3;
    tokenIdentifier: TokenIdentifier__2;
    reduceTime: bigint;
    endTime: Time;
    floorPrice: Price__2;
    seller: Principal;
    reducePrice: Price__2;
    payee: User__2;
    startPrice: Price__2;
}
export type DutchAuctionResult = { ok: null } | { err: Err__1 };
export type Err =
    | { NotList: null }
    | { NotSell: null }
    | { VerifyTxErr: null }
    | { CannotNotify: AccountIdentifier__1 }
    | { InsufficientBalance: null }
    | { TxNotFound: null }
    | { DuplicateHeight: null }
    | { InvalidToken: TokenIdentifier }
    | { Rejected: null }
    | { Unauthorized: AccountIdentifier__1 }
    | { Other: string };
export type Err__1 =
    | { msgandBidder: [Principal, Principal] }
    | { offerExpired: null }
    | { auctionFail: null }
    | { nftNotAuction: null }
    | { other: [TokenIdentifier__1, string] }
    | { kycNotPass: null }
    | { nftAlreadyListing: null }
    | { notFoundOffer: null }
    | { nftNotlist: null }
    | { nftlockedByOther: null }
    | { amlNotPass: null }
    | { kycorAmlNotPass: null };
export interface Fee {
    platform: Price__2;
    royalties: Price__2;
}
export interface Fixed {
    fee: Fee;
    token: TokenSpec__3;
    tokenIdentifier: TokenIdentifier__2;
    seller: Principal;
    price: Price__2;
}
export interface GetLatestLogMessagesParameters {
    upToTimeNanos: [] | [Nanos];
    count: number;
    filter: [] | [GetLogMessagesFilter];
}
export interface GetLogMessagesFilter {
    analyzeCount: number;
    messageRegex: [] | [string];
    messageContains: [] | [string];
}
export interface GetLogMessagesParameters {
    count: number;
    filter: [] | [GetLogMessagesFilter];
    fromTimeNanos: [] | [Nanos];
}
export interface ICPRefund {
    token: TokenSpec__3;
    memo: bigint;
    user: AccountIdentifier__2;
    price: bigint;
    retry: bigint;
}
export interface ICPSale {
    token: TokenSpec__3;
    memo: bigint;
    user: User__2;
    price: bigint;
    retry: bigint;
}
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
export type Img = string;
export type Img__1 = string;
export type Img__2 = string;
export interface Links {
    twitter: [] | [string];
    instagram: [] | [string];
    discord: [] | [string];
    yoursite: [] | [string];
    telegram: [] | [string];
    medium: [] | [string];
}
export type ListResult = { ok: TokenIdentifier__1 } | { err: Err__1 };
export type Listing =
    | { fixed: Fixed }
    | { dutchAuction: DutchAuction }
    | { unlist: null }
    | { auction: Auction };
export interface Listings {
    tokenIdentifier: TokenIdentifier__3;
    price: Price__3;
}
export interface LogMessagesData {
    timeNanos: Nanos;
    message: string;
}
export interface NFTInfo {
    listing: Listing;
    lastPrice: Price__2;
    listTime: [] | [Time];
    views: bigint;
    favoriters: Array<Principal>;
}
export type Nanos = bigint;
export interface NewDutchAuction {
    startTime: Time;
    token: TokenSpec__2;
    tokenIdentifier: TokenIdentifier__1;
    reduceTime: bigint;
    endTime: Time;
    floorPrice: Price__1;
    reducePrice: Price__1;
    payee: [] | [User__1];
    startPrice: Price__1;
}
export interface NewFixed {
    token: TokenSpec__2;
    tokenIdentifier: TokenIdentifier__1;
    price: Price__1;
}
export interface NewOffer {
    ttl: bigint;
    token: TokenSpec__2;
    tokenIdentifier: TokenIdentifier__1;
    seller: User__1;
    price: Price__1;
    bidder: Principal;
}
export interface NewProfile {
    bio: string;
    userName: string;
    banner: Img;
    notification: Array<string>;
    email: string;
    avatar: Img;
}
export interface Offer {
    ttl: bigint;
    status: OfferStatus;
    token: TokenSpec__2;
    tokenIdentifier: TokenIdentifier__1;
    time: Time;
    seller: User__1;
    price: Price__1;
    offerId: OfferId__1;
    bidder: Principal;
}
export type OfferId = bigint;
export type OfferId__1 = bigint;
export type OfferId__2 = bigint;
export type OfferResult = { ok: OfferId__1 } | { err: Err__1 };
export type OfferStatus =
    | { expired: null }
    | { rejected: null }
    | { ineffect: null }
    | { accepted: null };
export interface OgyInfo {
    fee: { rate: bigint; precision: bigint };
    creator: Principal;
    token: TokenSpec__1;
    owner: Principal;
    totalFee: { rate: bigint; precision: bigint };
}
export interface Order {
    fee: {
        platform: { fee: bigint; precision: bigint };
        royalties: { fee: bigint; precision: bigint };
    };
    token: TokenSpec__2;
    tokenIdentifier: TokenIdentifier__1;
    tradeType: TradeType;
    memo: bigint;
    time: bigint;
    seller: User__1;
    buyer: User__1;
    price: Price__1;
}
export interface PageParam {
    page: bigint;
    pageCount: bigint;
}
export interface PointSale {
    user: User__2;
    price: bigint;
    retry: bigint;
}
export type Price = bigint;
export type Price__1 = bigint;
export type Price__2 = bigint;
export type Price__3 = bigint;
export type ProfileErr = { alreadyCreate: null } | { noProfile: null } | { defaultAccount: null };
export interface ProfileLet {
    bio: string;
    userName: string;
    created: Array<TokenIdentifier__4>;
    favorited: Array<TokenIdentifier__4>;
    userId: UserId__2;
    time: Time;
    banner: Img;
    notification: Array<string>;
    offersReceived: Array<OfferId__2>;
    collections: Array<Principal>;
    email: string;
    collected: Array<TokenIdentifier__4>;
    offersMade: Array<OfferId__2>;
    followeds: Array<UserId__2>;
    followers: Array<UserId__2>;
    avatar: Img;
}
export interface Property {
    value: CandyValue;
    name: string;
    immutable: boolean;
}
export interface PropertyShared {
    value: CandyShared;
    name: string;
    immutable: boolean;
}
export interface RecordEventInit {
    to: [] | [Principal];
    height: bigint;
    toAID: [] | [AccountIdentifier__2];
    collection: Principal;
    date: bigint;
    from: [] | [Principal];
    item: TokenIdentifier__2;
    memo: bigint;
    fromAID: [] | [AccountIdentifier__2];
    tokenSymbol: [] | [string];
    price: [] | [Price__2];
    eventType: RecordEventType;
}
export type RecordEventType =
    | { auctionDeal: null }
    | { dutchAuction: null }
    | { offer: null }
    | { list: null }
    | { claim: null }
    | { mint: null }
    | { sold: null }
    | { acceptOffer: null }
    | { point: null }
    | { auction: null }
    | { transfer: null };
export interface RecordSettle {
    retry: bigint;
    record: RecordEventInit;
}
export type Result = { ok: null } | { err: CollectionErr };
export type Result_1 = { ok: null } | { err: string };
export type Result_2 = { ok: ProfileLet } | { err: ProfileErr };
export type Result_3 = { ok: null } | { err: ProfileErr };
export type Result_4 = { ok: Principal } | { err: CollectionErr };
export type Result_5 = { ok: TokenIdentifier } | { err: [TokenIdentifier, string] };
export type Result_6 = { ok: BlockIndex } | { err: string };
export interface Royality {
    rate: bigint;
    precision: bigint;
}
export type SettleICPResult =
    | { ok: null }
    | {
          err: { NoSettleICP: null } | { SettleErr: null } | { RetryExceed: null };
      };
export type SettlePointResult =
    | { ok: null }
    | {
          err: { NoSettlePoint: null } | { SettleErr: null } | { RetryExceed: null };
      };
export type SettleRecordResult =
    | { ok: null }
    | {
          err: { NoSettleRecord: null } | { SettleErr: null } | { RetryExceed: null };
      };
export interface ShowCart {
    nftUrl: string;
    tokenIdentifier: TokenIdentifier;
    nftName: string;
    price: bigint;
    collectionName: string;
}
export type Standard = { ext: null } | { ogy: OgyInfo };
export interface StatsListings {
    tokenIdentifier: TokenIdentifier__3;
    price: Price__3;
}
export type Time = bigint;
export type TokenIdentifier = string;
export type TokenIdentifier__1 = string;
export type TokenIdentifier__2 = string;
export type TokenIdentifier__3 = string;
export type TokenIdentifier__4 = string;
export interface TokenSpec {
    fee: bigint;
    canister: string;
    decimal: bigint;
    symbol: string;
}
export type TokenSpec__1 = { ic: ICTokenSpec } | { extensible: CandyValue };
export interface TokenSpec__2 {
    fee: bigint;
    canister: string;
    decimal: bigint;
    symbol: string;
}
export interface TokenSpec__3 {
    fee: bigint;
    canister: string;
    decimal: bigint;
    symbol: string;
}
export type TradeResult = { ok: Order } | { err: Err__1 };
export type TradeType =
    | { fixed: null }
    | { dutchAuction: null }
    | { offer: null }
    | { auction: null };
export type User = { principal: Principal } | { address: AccountIdentifier };
export type UserId = Principal;
export type UserId__1 = Principal;
export type UserId__2 = Principal;
export type User__1 = { principal: Principal } | { address: AccountIdentifier };
export type User__2 = { principal: Principal } | { address: AccountIdentifier };
export type VerifyResult = { ok: TokenIdentifier } | { err: Err };
export interface definite_canister_settings {
    freezing_threshold: bigint;
    controllers: [] | [Array<Principal>];
    memory_allocation: bigint;
    compute_allocation: bigint;
}
export interface _SERVICE {
    acceptOffer: ActorMethod<[OfferId], Result_6>;
    addCanisterController: ActorMethod<[Principal, Principal], undefined>;
    addCarts: ActorMethod<[Array<AddCart>], Array<Result_5>>;
    addCreator_whitelist: ActorMethod<[Array<Principal>], undefined>;
    addSecond_creator_whitelist: ActorMethod<[Array<Principal>], undefined>;
    add_shikuland_owner: ActorMethod<[User], undefined>;
    balance: ActorMethod<[], bigint>;
    batchBuyNow: ActorMethod<[Array<TokenIdentifier>], BatchTradeResult>;
    batchSell: ActorMethod<[Array<NewFixed>], Array<ListResult>>;
    batchSetPointSettlements: ActorMethod<[Array<[Principal, bigint]>], undefined>;
    batchSettleICP: ActorMethod<[Array<bigint>], Array<SettleICPResult>>;
    batchSettleICPRefund: ActorMethod<[Array<bigint>], undefined>;
    batchSettleRecord: ActorMethod<[Array<bigint>], undefined>;
    batchUpdateProfile: ActorMethod<[Array<UserId__1>, string], undefined>;
    batchVerifyTx: ActorMethod<[bigint], BatchVerifyResult>;
    buyNow: ActorMethod<[TokenIdentifier], TradeResult>;
    cancelOffer: ActorMethod<[OfferId], boolean>;
    checkOffer: ActorMethod<[Array<TokenIdentifier>], undefined>;
    checkSubAccountBalance: ActorMethod<[AccountIdentifier__1, TokenSpec], bigint>;
    checkTx: ActorMethod<[Array<TokenIdentifier>], undefined>;
    collectionStats: ActorMethod<
        [Principal],
        | []
        | [
              {
                  listings: Array<StatsListings>;
                  tradeCount: bigint;
                  createTime: Time;
                  floorPrice: Price;
                  volumeTrade: Price;
              },
          ]
    >;
    createCollection: ActorMethod<[CollectionInit], Result_4>;
    createProfile: ActorMethod<[NewProfile], Result_3>;
    createProfile4User: ActorMethod<[Principal, NewProfile], Result_3>;
    created: ActorMethod<[TokenIdentifier, Principal], undefined>;
    dealOffer: ActorMethod<[Array<TokenIdentifier>], undefined>;
    delCreator_whitelist: ActorMethod<[Array<Principal>], undefined>;
    delSecond_creator_whitelist: ActorMethod<[Array<Principal>], undefined>;
    deleteCanister: ActorMethod<[Principal], undefined>;
    deleteWait: ActorMethod<[TokenIdentifier], undefined>;
    deleteWaitByHeight: ActorMethod<[bigint], undefined>;
    favorite: ActorMethod<[TokenIdentifier], undefined>;
    findHighOfferByNft: ActorMethod<[TokenIdentifier], [] | [Offer]>;
    findOfferById: ActorMethod<[OfferId], [] | [Offer]>;
    findOfferByNft: ActorMethod<[TokenIdentifier], Array<Offer>>;
    findProfile: ActorMethod<[], Result_2>;
    findProfileWho: ActorMethod<[User__2], Result_2>;
    flushICPRefundSettlement: ActorMethod<[], undefined>;
    flushICPSettlement: ActorMethod<[], undefined>;
    flushPointSettlement: ActorMethod<[], undefined>;
    flushPriceOfAuction: ActorMethod<[], undefined>;
    flushRecordSettlement: ActorMethod<[], undefined>;
    follow: ActorMethod<[Principal], undefined>;
    getBatchListingByTid: ActorMethod<[bigint], Array<Listing>>;
    getCanisterLog: ActorMethod<[[] | [CanisterLogRequest]], [] | [CanisterLogResponse]>;
    getCanisterSettings: ActorMethod<[Principal], definite_canister_settings>;
    getCollectionData: ActorMethod<[Principal], [] | [CollectionData]>;
    getCollectionDatas: ActorMethod<[Array<Principal>], Array<CollectionData>>;
    getConfig: ActorMethod<
        [],
        {
            platformFeeAccount: Principal;
            owner: Principal;
            lanuchpad: Principal;
            block: string;
            ledeger: string;
            point: Principal;
            record: Principal;
        }
    >;
    getCreator_whitelist: ActorMethod<[], Array<Principal>>;
    getICPRefundSettlements: ActorMethod<[], Array<[bigint, ICPRefund]>>;
    getICPSettlements: ActorMethod<[], Array<[bigint, ICPSale]>>;
    getListingByHeight: ActorMethod<[bigint, TokenSpec], [] | [Listing]>;
    getListingByTid: ActorMethod<[bigint], [] | [Listing]>;
    getOfferTids: ActorMethod<[], Array<TokenIdentifier>>;
    getOwner: ActorMethod<[], Principal>;
    getPayAddress: ActorMethod<[], string>;
    getPayAddressWho: ActorMethod<[Principal], string>;
    getPointSettlements: ActorMethod<[], Array<[bigint, PointSale]>>;
    getPriceOfAuction: ActorMethod<[TokenIdentifier], [] | [DealPrice]>;
    getRecordSettlement: ActorMethod<[], Array<[bigint, RecordSettle]>>;
    getSecond_creator_whitelist: ActorMethod<[], Array<Principal>>;
    get_shikuland_owers: ActorMethod<[], Array<User>>;
    getrecordMarks: ActorMethod<[], Array<[Principal, Array<[string, bigint]>]>>;
    getrecordMarksByCanister: ActorMethod<[Principal], Array<[string, bigint]>>;
    handleOrigynActivity: ActorMethod<[Principal, Array<string>], undefined>;
    importCollection: ActorMethod<[Principal, string, CollectionInit], Result>;
    listCollected: ActorMethod<[], Array<TokenIdentifier>>;
    listCollections: ActorMethod<[], Array<string>>;
    listCollections2: ActorMethod<[[] | [CollectionSortFilterArgs]], Array<CollectionData>>;
    listCreated: ActorMethod<[], Array<TokenIdentifier>>;
    listCreators: ActorMethod<[], Array<CreatorInfo>>;
    listFavorite: ActorMethod<[], Array<TokenIdentifier>>;
    listOfferMade: ActorMethod<[Principal], Array<Offer>>;
    listOfferReceived: ActorMethod<[Principal], Array<Offer>>;
    listOrigynCollections: ActorMethod<[], Array<Principal>>;
    listProfile: ActorMethod<[], Array<[string, string, string]>>;
    listfolloweds: ActorMethod<[], Array<Principal>>;
    listfollowers: ActorMethod<[], Array<Principal>>;
    makeOffer: ActorMethod<[NewOffer], OfferResult>;
    migrateCollection: ActorMethod<[], undefined>;
    migrateListing: ActorMethod<[], undefined>;
    myCollectionList: ActorMethod<[], Array<CollectionInfo>>;
    nftInfo: ActorMethod<[TokenIdentifier], NFTInfo>;
    nftInfos: ActorMethod<[Array<TokenIdentifier>], Array<NFTInfo>>;
    nftInfosByCollection: ActorMethod<[Principal, Uint32Array | number[]], Array<NFTInfo>>;
    nftInfosByCollectionOgy: ActorMethod<[Principal, Array<string>], Array<NFTInfo>>;
    nftInfosByCollectionPageable: ActorMethod<[Principal, PageParam], Array<NFTInfo>>;
    pageListProfile: ActorMethod<[PageParam], Array<[string, string, string, string, bigint]>>;
    profileCount: ActorMethod<[], bigint>;
    queryPlatformFee: ActorMethod<
        [],
        { fee: Price; precision: bigint; account: AccountIdentifier__1 }
    >;
    queryPointRatio: ActorMethod<[], bigint>;
    querySortedCollection: ActorMethod<
        [CollectionSortingField, boolean, bigint, bigint, CollectionFilterArgs],
        Array<Principal>
    >;
    recordPoint: ActorMethod<[User, Price], undefined>;
    rejectOffer: ActorMethod<[OfferId], Result_1>;
    rejectOfferByUser: ActorMethod<[OfferId], Result_1>;
    removeCarts: ActorMethod<[[] | [TokenIdentifier]], undefined>;
    removeCollection: ActorMethod<[Principal, string], Result>;
    reset_shikuland_owner: ActorMethod<[], undefined>;
    sell: ActorMethod<[NewFixed], ListResult>;
    sellDutchAuction: ActorMethod<[NewDutchAuction], DutchAuctionResult>;
    setICPRefundSettlements: ActorMethod<
        [bigint, AccountIdentifier__1, bigint, bigint, TokenSpec],
        undefined
    >;
    setICPSettlements: ActorMethod<[bigint, User, bigint, bigint, TokenSpec], undefined>;
    setKycSwitch: ActorMethod<[boolean], undefined>;
    setMinter: ActorMethod<[Principal, string], undefined>;
    setOwner: ActorMethod<[Principal], undefined>;
    setPlatformAccount: ActorMethod<[Principal], undefined>;
    setPlatformFee: ActorMethod<[bigint, bigint], undefined>;
    setPointRatio: ActorMethod<[bigint], undefined>;
    setPointSettlements: ActorMethod<[Principal, bigint], undefined>;
    setPriceOfAuction: ActorMethod<[TokenIdentifier, DealPrice], undefined>;
    setRateLimit: ActorMethod<[bigint, bigint], undefined>;
    setRateLimitFalse: ActorMethod<[], undefined>;
    setWICP: ActorMethod<[string], undefined>;
    settleICP: ActorMethod<[bigint], SettleICPResult>;
    settleICPRefund: ActorMethod<[bigint], SettleICPResult>;
    settlePoint: ActorMethod<[bigint], SettlePointResult>;
    settleRecord: ActorMethod<[bigint], SettleRecordResult>;
    showCart: ActorMethod<[], Array<ShowCart>>;
    subscribe: ActorMethod<[string], undefined>;
    unSell: ActorMethod<[TokenIdentifier], ListResult>;
    unfavorite: ActorMethod<[TokenIdentifier], undefined>;
    unfollow: ActorMethod<[Principal], undefined>;
    updateAvatar: ActorMethod<[Principal, Img__2], boolean>;
    updateCollection: ActorMethod<[CollectionInfo], boolean>;
    updateCreators: ActorMethod<[], string>;
    updateOffer: ActorMethod<[OfferId, Price], OfferResult>;
    updateProfile: ActorMethod<[NewProfile], boolean>;
    verifyTxWithMemo: ActorMethod<[bigint, TokenSpec], VerifyResult>;
    view: ActorMethod<[TokenIdentifier], undefined>;
    volumeTraded: ActorMethod<[Principal, Price], undefined>;
    wallet_receive: ActorMethod<[], bigint>;
    withdraw: ActorMethod<[AccountIdentifier__1, Price, bigint, TokenSpec], boolean>;
    withdrawByAdmin: ActorMethod<[Principal, Price, TokenSpec], boolean>;
    withdrawBySubAccount: ActorMethod<[User, Price, TokenSpec], boolean>;
}
