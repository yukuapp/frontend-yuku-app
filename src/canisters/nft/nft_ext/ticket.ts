import { ConnectedIdentity } from '@/types/identity';
import { NftIdentifier } from '@/types/nft';
import { NftTicketStatus } from '@/types/yuku-standard/ticket';
import * as ticket from './ext_ticket';

// ===================== Query Ticket Data =====================

export const queryNftTicketStatus = async (
    identity: ConnectedIdentity,
    collection: string,
    token_id: NftIdentifier,
): Promise<NftTicketStatus> => {
    return ticket.queryNftTicketStatus(identity, collection, token_id);
};
