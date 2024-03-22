import { readLastConnectType } from '@/utils/app/storage';
import { uniqueKey } from '@/common/nft/identifier';
import { SupportedBackend } from '@/types/app';
import { UserInfo } from '@/types/exchange/common';
import { BatchNftSale } from '@/types/yuku';
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
        exchange: 'batch-sell',
        user_info: args.user_info,
        id: args.id,
        action: args.action,
        timestamp: now,
        duration: last ? now - last : 0,
        message: args.message,
    });
    return now;
};

// start buy
export const larkNoticeBatchSellInitial = (
    env: SupportedBackend,
    id: string,
    principal: string,
    batch_sell_list: BatchNftSale[],
    price: string,
    other: string,
) => {
    send(0, {
        env,
        id,
        action: 'INITIAL',
        message: `seller: ${principal}
\ttoken_id_list: ${batch_sell_list.map((i) => uniqueKey(i.token_id)).join('|')}
\ttotal price: ${price} ${other ? `\nOther: ${other}` : ''}`,
        user_info: {
            wallet: readLastConnectType(),
            agent: navigator.userAgent,
        },
    });
};

export const larkNoticeBatchSellOver = (
    last: number,
    env: SupportedBackend,
    id: string,
    principal: string,
    batch_sell_list: BatchNftSale[],
    price: string,
    actions: string,
) => {
    setTimeout(() => {
        send(last, {
            env,
            id,
            action: 'OVER',
            message: `seller: ${principal}
\ttoken_id_list: ${batch_sell_list.map((i) => uniqueKey(i.token_id)).join('|')}
\ttotal price: ${price} ${actions ? `\n${actions}` : ''}`,
        });
    }, 1000);
};

export const larkNoticeBatchSell = (
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

export const larkNoticeBatchSellFailed = (
    last: number,
    env: SupportedBackend,
    id: string,
    principal: string,
    batch_sell_list: BatchNftSale[],
    actions: string,
    error: string,
    log_error: boolean,
) => {
    setTimeout(() => {
        const args = {
            env,
            id,
            action: 'FAILED',
            message: `seller: ${principal}
\ttoken_id_list: ${batch_sell_list.map((i) => uniqueKey(i.token_id)).join('|')}
${actions ? `\n${actions}` : ''}
Error: ${error}`,
        };
        send(last, args);
        log_error && send(last, args, getLarkUrlError());
    }, 1000);
};
