export const idlFactory = ({ IDL }) => {
    // const CanisterInitialArg = IDL.Record({
    //     permission_host: IDL.Opt(IDL.Principal),
    //     record_collector: IDL.Opt(IDL.Principal),
    //     schedule: IDL.Opt(IDL.Nat64),
    // });
    // const CanisterStatusType = IDL.Variant({
    //     stopped: IDL.Null,
    //     stopping: IDL.Null,
    //     running: IDL.Null,
    // });
    // const DefiniteCanisterSettings = IDL.Record({
    //     freezing_threshold: IDL.Nat,
    //     controllers: IDL.Vec(IDL.Principal),
    //     memory_allocation: IDL.Nat,
    //     compute_allocation: IDL.Nat,
    // });
    // const CanisterStatusResponse = IDL.Record({
    //     status: CanisterStatusType,
    //     memory_size: IDL.Nat,
    //     cycles: IDL.Nat,
    //     settings: DefiniteCanisterSettings,
    //     idle_cycles_burned_per_day: IDL.Nat,
    //     module_hash: IDL.Opt(IDL.Vec(IDL.Nat8)),
    // });
    // const MaintainingReason = IDL.Record({
    //     created: IDL.Nat64,
    //     message: IDL.Text,
    // });
    // const Permission = IDL.Variant({
    //     Permitted: IDL.Text,
    //     Forbidden: IDL.Text,
    // });
    // const PermissionReplacedArg = IDL.Record({
    //     permissions: IDL.Vec(IDL.Text),
    //     user_permissions: IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Vec(IDL.Text))),
    //     role_permissions: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Vec(IDL.Text))),
    //     user_roles: IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Vec(IDL.Text))),
    // });
    // const PermissionUpdatedArg = IDL.Variant({
    //     UpdateRolePermission: IDL.Tuple(IDL.Text, IDL.Opt(IDL.Vec(IDL.Text))),
    //     UpdateUserPermission: IDL.Tuple(IDL.Principal, IDL.Opt(IDL.Vec(IDL.Text))),
    //     UpdateUserRole: IDL.Tuple(IDL.Principal, IDL.Opt(IDL.Vec(IDL.Text))),
    // });
    // const RecordLevel = IDL.Variant({
    //     Error: IDL.Null,
    //     Info: IDL.Null,
    //     Warn: IDL.Null,
    //     Debug: IDL.Null,
    //     Trace: IDL.Null,
    // });
    // const RecordSearch = IDL.Record({
    //     id: IDL.Opt(IDL.Tuple(IDL.Opt(IDL.Nat64), IDL.Opt(IDL.Nat64))),
    //     created: IDL.Opt(IDL.Tuple(IDL.Opt(IDL.Nat64), IDL.Opt(IDL.Nat64))),
    //     topic: IDL.Opt(IDL.Vec(IDL.Text)),
    //     content: IDL.Opt(IDL.Text),
    //     level: IDL.Opt(IDL.Vec(RecordLevel)),
    //     caller: IDL.Opt(IDL.Vec(IDL.Principal)),
    // });
    // const Record = IDL.Record({
    //     id: IDL.Nat64,
    //     result: IDL.Text,
    //     created: IDL.Nat64,
    //     topic: IDL.Text,
    //     content: IDL.Text,
    //     done: IDL.Nat64,
    //     level: RecordLevel,
    //     caller: IDL.Principal,
    // });
    // const Page = IDL.Record({ page: IDL.Nat32, size: IDL.Nat32 });
    // const PageData = IDL.Record({
    //     total: IDL.Nat32,
    //     data: IDL.Vec(Record),
    //     page: IDL.Nat32,
    //     size: IDL.Nat32,
    // });
    // const MigratedRecords = IDL.Record({
    //     records: IDL.Vec(Record),
    //     topics: IDL.Vec(IDL.Text),
    //     updated: IDL.Vec(IDL.Tuple(IDL.Nat64, IDL.Nat64, IDL.Text)),
    //     next_id: IDL.Nat64,
    // });
    // const WalletReceiveResult = IDL.Record({ accepted: IDL.Nat64 });
    return IDL.Service({
        // __get_candid_interface_tmp_hack: IDL.Func([], [IDL.Text], ['query']),
        // business_max_alive_query: IDL.Func([], [IDL.Nat64], ['query']),
        // business_max_alive_update: IDL.Func([IDL.Nat64], [IDL.Nat64], []),
        // business_user_query: IDL.Func([IDL.Nat64], [IDL.Opt(IDL.Principal)], ['query']),
        user_update: IDL.Func([], [IDL.Nat64], []),
        // canister_status: IDL.Func([], [CanisterStatusResponse], []),
        // maintaining_query: IDL.Func([], [IDL.Bool], ['query']),
        // maintaining_query_reason: IDL.Func([], [IDL.Opt(MaintainingReason)], ['query']),
        // maintaining_replace: IDL.Func([IDL.Opt(IDL.Text)], [], []),
        // permission_all: IDL.Func([], [IDL.Vec(Permission)], ['query']),
        // permission_assigned_by_user: IDL.Func(
        //     [IDL.Principal],
        //     [IDL.Opt(IDL.Vec(Permission))],
        //     ['query'],
        // ),
        // permission_assigned_query: IDL.Func([], [IDL.Opt(IDL.Vec(Permission))], ['query']),
        // permission_find_by_user: IDL.Func([IDL.Principal], [IDL.Vec(IDL.Text)], ['query']),
        // permission_host_find: IDL.Func([], [IDL.Opt(IDL.Principal)], ['query']),
        // permission_host_replace: IDL.Func([IDL.Opt(IDL.Principal)], [], []),
        // permission_query: IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
        // permission_replace: IDL.Func([PermissionReplacedArg], [], []),
        // permission_roles_all: IDL.Func(
        //     [],
        //     [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Vec(Permission)))],
        //     ['query'],
        // ),
        // permission_roles_by_user: IDL.Func(
        //     [IDL.Principal],
        //     [IDL.Opt(IDL.Vec(IDL.Text))],
        //     ['query'],
        // ),
        // permission_roles_query: IDL.Func([], [IDL.Opt(IDL.Vec(IDL.Text))], ['query']),
        // permission_update: IDL.Func([IDL.Vec(PermissionUpdatedArg)], [], []),
        // record_collector_find: IDL.Func([], [IDL.Opt(IDL.Principal)], ['query']),
        // record_collector_update: IDL.Func([IDL.Opt(IDL.Principal)], [], []),
        // record_find_all: IDL.Func([IDL.Opt(RecordSearch)], [IDL.Vec(Record)], ['query']),
        // record_find_by_page: IDL.Func([IDL.Opt(RecordSearch), Page], [PageData], ['query']),
        // record_migrate: IDL.Func([IDL.Nat32], [MigratedRecords], []),
        // record_topics: IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
        // schedule_find: IDL.Func([], [IDL.Opt(IDL.Nat64)], ['query']),
        // schedule_replace: IDL.Func([IDL.Opt(IDL.Nat64)], [], []),
        // schedule_trigger: IDL.Func([], [], []),
        // version: IDL.Func([], [IDL.Nat32], ['query']),
        // wallet_balance: IDL.Func([], [IDL.Nat], ['query']),
        // wallet_receive: IDL.Func([], [WalletReceiveResult], []),
        // whoami: IDL.Func([], [IDL.Principal], ['query']),
    });
};
// export const init = ({ IDL }) => {
//     const CanisterInitialArg = IDL.Record({
//         permission_host: IDL.Opt(IDL.Principal),
//         record_collector: IDL.Opt(IDL.Principal),
//         schedule: IDL.Opt(IDL.Nat64),
//     });
//     return [IDL.Opt(CanisterInitialArg)];
// };
