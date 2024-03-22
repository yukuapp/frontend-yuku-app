export interface InnerData {
    data: Array<number>;
    headers: Array<[string, string]>;
}
export interface OuterData {
    url: string;
    headers: Array<[string, string]>;
}
export type MediaData = { Inner: InnerData } | { Outer: OuterData };
export type NFTOwnable =
    | { Data: Array<number> }
    | { List: Array<NFTOwnable> }
    | { None: null }
    | { Text: string }
    | { Media: MediaData };

// ----------------> ----------------> -------------->
export type NftTicketStatus =
    | {
          NoBody: string;
      }
    | { InvalidToken: null }
    | {
          Forbidden: string;
      }
    | {
          Owner: [string, NFTOwnable];
      }
    | {
          Anonymous: [string, NFTOwnable];
      };

export type NftTicketType = 'lottery' | 'code';
export const SUPPORTED_NFT_TICKET_TYPES: string[] = ['lottery', 'code'];

export type NftTicketProject = 'ICP x EthCC NFT' | 'Hello! HashKey & ICP & Yuku Edition';

export type NftTicketMetadata = {
    type: NftTicketType;
    project: NftTicketProject;
};

export type NftTicketOwnedData = {
    type: NftTicketType;
    project: NftTicketProject;
    owned?: string;
    status: 'NoBody' | 'InvalidToken' | 'Forbidden' | 'Owner' | 'Anonymous';
    data: NftTicketStatus;
};
