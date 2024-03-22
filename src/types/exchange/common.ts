export type TransactionAction<T, U> = {
    action: T;
    timestamp: number;
    data?: U;
};

export type UserInfo = {
    wallet: string;
    agent: string;
};
