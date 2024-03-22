import { readLastConnectType } from '@/utils/app/storage';
import { uniqueKey } from '@/common/nft/identifier';
import { SupportedBackend } from '@/types/app';
import { UserInfo } from '@/types/exchange/common';
import { NftIdentifier, TokenInfo } from '@/types/nft';
import { getLarkUrl, getLarkUrlError } from '.';
// import { getLarkUrl, getLarkUrlError } from '.';
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
        exchange: 'single-sell',
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
export const larkNoticeSingleSellInitial = (
    env: SupportedBackend,
    id: string,
    principal: string,
    token_id: NftIdentifier,
    token: TokenInfo,
    price: string,
    other: string,
) => {
    send(0, {
        env,
        id,
        action: 'INITIAL',
        message: `seller: ${principal}
\ttoken_id: ${uniqueKey(token_id)}
\tprice: ${price} ${token.symbol}${other ? `\nOther: ${other}` : ''}`,
        user_info: {
            wallet: readLastConnectType(),
            agent: navigator.userAgent,
        },
    });
};

export const larkNoticeSingleSellOver = (
    last: number,
    env: SupportedBackend,
    id: string,
    principal: string,
    token_id: NftIdentifier,
    token: TokenInfo,
    price: string,
    actions: string,
) => {
    setTimeout(() => {
        send(last, {
            env,
            id,
            action: 'OVER',
            message: `seller: ${principal}
\ttoken_id: ${uniqueKey(token_id)}
\tprice: ${price} ${token.symbol}${actions ? `\n${actions}` : ''}`,
        });
    }, 1000);
};

export const larkNoticeSingleSell = (
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
        message: data ? `data: ${data}` : '',
    });
};

export const larkNoticeSingleSellFailed = (
    last: number,
    env: SupportedBackend,
    id: string,
    principal: string,
    token_id: NftIdentifier,
    token: TokenInfo,
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
            message: `seller: ${principal}
\ttoken_id: ${uniqueKey(token_id)}
\tprice: ${price} ${token.symbol}${actions ? `\n${actions}` : ''}
Error: ${error}`,
        };
        send(last, args);
        log_error && send(last, args, getLarkUrlError());
    }, 1000);
};
