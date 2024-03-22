import { useCallback } from 'react';
import { message } from 'antd';
import { checkToken } from '@/utils/apis/yuku/api';
import { readStorage, UNITY_USER_TOKEN, writeStorage } from '@/utils/app/storage';
import { anonymous } from '@/utils/connect/anonymous';
import { principal2account } from '@/common/ic/account';
import { useIdentityStore } from '@/stores/identity';

export const useCheckTokenEmail = (): {
    is_email: boolean;
    check_token?: () => Promise<void | boolean> | void;
} => {
    const identity = useIdentityStore((s) => s.connectedIdentity);
    const setConnectedIdentity = useIdentityStore((s) => s.setConnectedIdentity);

    const check_token = useCallback(() => {
        if (identity?.connectType !== 'email') {
            return;
        }
        const email = identity?.main_email;
        const v = readStorage(`${UNITY_USER_TOKEN}${email}`);
        if (v) {
            const v_json = JSON.parse(v);

            return checkToken({
                user_id: v_json.user_id,
                user_token: v_json.user_token,
            })
                .then((r) => {
                    if (r) {
                        const icFound = r?.view.identity_list.find(
                            (i) => i['EscrowInternetComputer']?.network === 'Ic',
                        );
                        const principal = icFound && icFound['EscrowInternetComputer']?.principal;

                        const hash = icFound && icFound['EscrowInternetComputer']?.hash;
                        writeStorage(
                            `${UNITY_USER_TOKEN}${email}`,
                            JSON.stringify({
                                user_id: r?.user_id,
                                user_token: r?.token,
                            }),
                        );
                        setConnectedIdentity({
                            connectType: 'email',
                            creator: anonymous.creator,
                            requestWhitelist: async () => true,
                            main_email: email,
                            user_id: v_json.user_id,
                            principal,
                            account: principal2account(principal),
                            hash,
                        });
                    }
                })
                .catch((e) => message.error('Email token expired, please login again!' + e));
        }
    }, [setConnectedIdentity, identity]);

    return { is_email: true, check_token };
};
