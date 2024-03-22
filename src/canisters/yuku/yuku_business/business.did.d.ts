import type { ActorMethod } from '@dfinity/agent';

// import type { Principal } from '@dfinity/principal';

// export interface CanisterInitialArg {
//     permission_host: [] | [Principal];
//     record_collector: [] | [Principal];
//     schedule: [] | [bigint];
// }
// export interface CanisterStatusResponse {
//     status: CanisterStatusType;
//     memory_size: bigint;
//     cycles: bigint;
//     settings: DefiniteCanisterSettings;
//     idle_cycles_burned_per_day: bigint;
//     module_hash: [] | [Uint8Array | number[]];
// }
// export type CanisterStatusType = { stopped: null } | { stopping: null } | { running: null };
// export interface DefiniteCanisterSettings {
//     freezing_threshold: bigint;
//     controllers: Array<Principal>;
//     memory_allocation: bigint;
//     compute_allocation: bigint;
// }
// export interface MaintainingReason {
//     created: bigint;
//     message: string;
// }
// export interface MigratedRecords {
//     records: Array<Record>;
//     topics: Array<string>;
//     updated: Array<[bigint, bigint, string]>;
//     next_id: bigint;
// }
// export interface Page {
//     page: number;
//     size: number;
// }
// export interface PageData {
//     total: number;
//     data: Array<Record>;
//     page: number;
//     size: number;
// }
// export type Permission = { Permitted: string } | { Forbidden: string };
// export interface PermissionReplacedArg {
//     permissions: Array<string>;
//     user_permissions: Array<[Principal, Array<string>]>;
//     role_permissions: Array<[string, Array<string>]>;
//     user_roles: Array<[Principal, Array<string>]>;
// }
// export type PermissionUpdatedArg =
//     | {
//           UpdateRolePermission: [string, [] | [Array<string>]];
//       }
//     | { UpdateUserPermission: [Principal, [] | [Array<string>]] }
//     | { UpdateUserRole: [Principal, [] | [Array<string>]] };
// export interface Record {
//     id: bigint;
//     result: string;
//     created: bigint;
//     topic: string;
//     content: string;
//     done: bigint;
//     level: RecordLevel;
//     caller: Principal;
// }
// export type RecordLevel =
//     | { Error: null }
//     | { Info: null }
//     | { Warn: null }
//     | { Debug: null }
//     | { Trace: null };
// export interface RecordSearch {
//     id: [] | [[[] | [bigint], [] | [bigint]]];
//     created: [] | [[[] | [bigint], [] | [bigint]]];
//     topic: [] | [Array<string>];
//     content: [] | [string];
//     level: [] | [Array<RecordLevel>];
//     caller: [] | [Array<Principal>];
// }
// export interface WalletReceiveResult {
//     accepted: bigint;
// }
export interface _SERVICE {
    // __get_candid_interface_tmp_hack: ActorMethod<[], string>;
    // business_max_alive_query: ActorMethod<[], bigint>;
    // business_max_alive_update: ActorMethod<[bigint], bigint>;
    // business_user_query: ActorMethod<[bigint], [] | [Principal]>;
    user_update: ActorMethod<[], bigint>;
    // canister_status: ActorMethod<[], CanisterStatusResponse>;
    // maintaining_query: ActorMethod<[], boolean>;
    // maintaining_query_reason: ActorMethod<[], [] | [MaintainingReason]>;
    // maintaining_replace: ActorMethod<[[] | [string]], undefined>;
    // permission_all: ActorMethod<[], Array<Permission>>;
    // permission_assigned_by_user: ActorMethod<[Principal], [] | [Array<Permission>]>;
    // permission_assigned_query: ActorMethod<[], [] | [Array<Permission>]>;
    // permission_find_by_user: ActorMethod<[Principal], Array<string>>;
    // permission_host_find: ActorMethod<[], [] | [Principal]>;
    // permission_host_replace: ActorMethod<[[] | [Principal]], undefined>;
    // permission_query: ActorMethod<[], Array<string>>;
    // permission_replace: ActorMethod<[PermissionReplacedArg], undefined>;
    // permission_roles_all: ActorMethod<[], Array<[string, Array<Permission>]>>;
    // permission_roles_by_user: ActorMethod<[Principal], [] | [Array<string>]>;
    // permission_roles_query: ActorMethod<[], [] | [Array<string>]>;
    // permission_update: ActorMethod<[Array<PermissionUpdatedArg>], undefined>;
    // record_collector_find: ActorMethod<[], [] | [Principal]>;
    // record_collector_update: ActorMethod<[[] | [Principal]], undefined>;
    // record_find_all: ActorMethod<[[] | [RecordSearch]], Array<Record>>;
    // record_find_by_page: ActorMethod<[[] | [RecordSearch], Page], PageData>;
    // record_migrate: ActorMethod<[number], MigratedRecords>;
    // record_topics: ActorMethod<[], Array<string>>;
    // schedule_find: ActorMethod<[], [] | [bigint]>;
    // schedule_replace: ActorMethod<[[] | [bigint]], undefined>;
    // schedule_trigger: ActorMethod<[], undefined>;
    // version: ActorMethod<[], number>;
    // wallet_balance: ActorMethod<[], bigint>;
    // wallet_receive: ActorMethod<[], WalletReceiveResult>;
    // whoami: ActorMethod<[], Principal>;
}
