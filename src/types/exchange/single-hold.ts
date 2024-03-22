import { ConnectedIdentity } from '../identity';
import { NftTokenOwner } from '../nft';

export type HoldingAction =
    | undefined
    | 'DOING'
    | 'CANCELLING'
    | 'HOLDING'
    | undefined
    | 'DOING'
    | 'CANCELLING'
    | 'CANCELLING_OGY';

export type HoldingNftExecutor = (
    identity: ConnectedIdentity,
    owner: NftTokenOwner,
) => Promise<boolean>;
