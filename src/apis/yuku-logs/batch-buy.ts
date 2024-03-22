import { readLastConnectType } from '@/utils/app/storage';
import { getLedgerIcpDecimals } from '@/utils/canisters/ledgers/special';
import { exponentNumber } from '@/common/data/numbers';
import { uniqueKey } from '@/common/nft/identifier';
import { SupportedBackend } from '@/types/app';
import { UserInfo } from '@/types/exchange/common';
import { NftIdentifier } from '@/types/nft';
import { getLarkUrl, getLarkUrlError } from '.';
import { sendLarkMessage } from './lark';

const send = (
    last: number,
    args: {
        env: SupportedBackend;
        id: string;
        action: string;
        message: string;
        user_info?: UserInfo;
    },
    url?: string,
): number => {
    const now = Date.now();
    sendLarkMessage(url ?? getLarkUrl(), {
        env: args.env,
        exchange: 'batch-buy',
        user_info: args.user_info,
        id: args.id,
        action: args.action,
        timestamp: now,
        duration: last ? now - last : 0,
        message: args.message,
    });
    return now;
};

// Start buying
export const larkNoticeBatchBuyInitial = (
    env: SupportedBackend,
    id: string,
    principal: string,
    token_id_list: NftIdentifier[],
    price: string,
    other: string,
) => {
    send(0, {
        env,
        id,
        action: 'INITIAL',
        message: `purchaser: ${principal}
\ttoken_id_list: ${token_id_list.map(uniqueKey).join('|')}
\tprice: ${exponentNumber(price, -getLedgerIcpDecimals())} ${'ICP'}${
            other ? `\nOther: ${other}` : ''
        }`,
        user_info: {
            wallet: readLastConnectType(),
            agent: navigator.userAgent,
        },
    });
};

export const larkNoticeBatchBuyOver = (
    last: number,
    env: SupportedBackend,
    id: string,
    principal: string,
    token_id_list: NftIdentifier[],
    price: string,
    actions: string,
) => {
    setTimeout(() => {
        send(last, {
            env,
            id,
            action: 'OVER',
            message: `purchaser: ${principal}
\ttoken_id_list: ${token_id_list.map(uniqueKey).join('|')}
\tprice: ${exponentNumber(price, -getLedgerIcpDecimals())} ${'ICP'}${
                actions ? `\n${actions}` : ''
            }`,
        });
    }, 1000);
};

export const larkNoticeBatchBuy = (
    last: number,
    env: SupportedBackend,
    id: string,
    action: string,
    data?: string,
): number => {
    return send(last, {
        env,
        id,
        action,
        message: data ? `data: ${JSON.stringify(data)}` : '',
    });
};

export const larkNoticeBatchBuyFailed = (
    last: number,
    env: SupportedBackend,
    id: string,
    principal: string,
    token_id_list: NftIdentifier[],
    price: string,
    actions: string,
    error: string,
    log_error: boolean,
) => {
    setTimeout(() => {
        const args = {
            env,
            id,
            action: 'FAILED',
            message: `purchaser: ${principal}
\ttoken_id_list: ${token_id_list.map(uniqueKey).join('|')}
\tprice: ${exponentNumber(price, -getLedgerIcpDecimals())} ${'ICP'}${actions ? `\n${actions}` : ''}
Error: ${error}`,
        };
        send(last, args);
        log_error && send(last, args, getLarkUrlError());
    }, 1000);
};
