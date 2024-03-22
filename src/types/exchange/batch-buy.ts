import { NftListing } from '../listing';
import { NftIdentifier, NftTokenOwner } from '../nft';
import { TransactionAction } from './common';

// Batch buying status
// ! Batch buying transferred to Yuku only supports ICP
export type BatchBuyingAction =
    | undefined // Not started
    | 'DOING' // Buying in progress
    | 'CREATING_BATCH_ORDER' // 2. Creating batch order phase
    | 'CHECKING_BALANCE' // 3. Checking balance
    | 'PAY' // 4. User payment
    | 'SUBMITTING_HEIGHT' // 5. Submitting transfer height, obtaining NFT
    // ? entrepot action
    | 'BATCH_LOCK' // 2. Batch lock order
    | 'BATCH_PAY' // 3. Batch payment
    | 'BATCH_SETTLE'; // 4. Batch confirm order

// Batch buying NFT interface
export type BatchBuyNftExecutor = (
    token_list: {
        owner: NftTokenOwner;
        listing: NftListing;
    }[],
) => Promise<NftIdentifier[] | undefined>;

// ======================= Recoverable transaction =======================

// ! Batch buying transferred to Yuku only supports ICP
// Information carried by a single step
export type BatchBuyingTransactionAction<T> = TransactionAction<BatchBuyingAction, T>;

// Batch buying transaction information
export type BatchBuyingTransaction = {
    type: 'batch-buy';
    args: {
        token_list: {
            owner: NftTokenOwner;
            listing: NftListing;
        }[];
    };
    actions: BatchBuyingTransactionAction<any>[];
    paid: number; // Number of times payment is executed, only the first time is allowed to execute, all other cases must be manually executed again
};

// Batch buying interface
export type BatchBuyingByTransactionExecutor = (
    id: string,
    created: number,
    transaction: BatchBuyingTransaction,
    manual: boolean,
) => Promise<void>;
