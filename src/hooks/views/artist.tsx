import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { icpAccountBalance } from '@/utils/canisters/ledgers/icp';
import {
    createArtistCollection,
    getAllArtists,
    mintArtistNFT,
    queryMintingFee,
    queryUserArtistCollection,
} from '@/utils/canisters/yuku-old/artist_router';
import { getYukuArtistRouterCanisterId } from '@/utils/canisters/yuku-old/special';
import { MintingNFT } from '@/canisters/yuku-old/yuku_artist_router';
import { exponentNumber } from '@/common/data/numbers';
import { principal2account } from '@/common/ic/account';
import { Spend } from '@/common/react/spend';
import { throwIdentity, useIdentityStore } from '@/stores/identity';
import { NftIdentifier } from '@/types/nft';
import { useMessage } from '../common/message';
import { useTransferByICP } from '../ledger/transfer';

export type MintingArtistNftAction =
    | undefined
    | 'DOING'
    | 'CHECKING_FEE'
    | 'CHECKING_BALANCE'
    | 'PAY'
    | 'CHECKING_COLLECTION'
    | 'CREATING_COLLECTION_CREATING'
    | 'MINTING';

export type ArtistMintNftExecutor = (metadata: MintingNFT) => Promise<NftIdentifier | undefined>;

export const useMintArtistNft = (): {
    mint: ArtistMintNftExecutor;
    action: MintingArtistNftAction;
} => {
    const message = useMessage();

    const { balance, fee, decimals, transfer } = useTransferByICP();
    const [action, setAction] = useState<MintingArtistNftAction>(undefined);
    const navigate = useNavigate();
    const identity = useIdentityStore((s) => s.connectedIdentity);

    const mint = useCallback(
        async (metadata: MintingNFT): Promise<NftIdentifier | undefined> => {
            if (!identity) {
                navigate('/connect');
                return undefined;
            }
            throwIdentity(identity);
            if (action !== undefined) {
                message.warning(`Minting`);
                return undefined;
            }

            setAction('DOING');
            try {
                const spend = Spend.start(`mint art start`);

                setAction('CHECKING_FEE');
                const mintFee = await queryMintingFee();
                spend.mark(`CHECKING_FEE DONE: ${mintFee}`);

                setAction('CHECKING_BALANCE');
                const e8s = balance?.e8s ?? (await icpAccountBalance(identity.account!)).e8s;
                const need = BigInt(mintFee) + BigInt(fee);
                if (BigInt(e8s) < need)
                    throw new Error(
                        `Insufficient balance.(needs ${exponentNumber(`${need}`, -decimals)}ICP)`,
                    );
                spend.mark(`CHECKING_BALANCE DONE: ${need} < ${e8s}`);

                setAction('PAY');
                const artist_router = getYukuArtistRouterCanisterId();
                const height = await transfer({
                    to: principal2account(artist_router),
                    amount: `${mintFee}`,
                });
                spend.mark(`PAY DONE: ${height}`);

                setAction('CHECKING_COLLECTION');
                let collection = await queryUserArtistCollection(identity.principal!);
                spend.mark(`CHECKING_COLLECTION DONE: ${collection}`);

                if (collection === undefined) {
                    setAction('CREATING_COLLECTION_CREATING');
                    collection = await createArtistCollection(identity, {});
                    spend.mark(`CREATING_COLLECTION_CREATING DONE: ${collection}`);
                    if (collection === undefined) throw new Error(`create user collection failed`);
                }

                setAction('MINTING');
                const token_id = await mintArtistNFT(identity, {
                    collection,
                    to: identity.principal!,
                    height,
                    metadata,
                });
                spend.mark(`MINTING DONE`);

                return token_id;
            } catch (e) {
                throw new Error(`mint nft failed: ${e}`);
            } finally {
                setAction(undefined);
            }
        },
        [identity, balance, fee, decimals, transfer, action],
    );

    return { mint, action };
};

export const useArtists = (): { artist: boolean } => {
    const identity = useIdentityStore((s) => s.connectedIdentity);
    throwIdentity(identity);
    const [artist, setArtist] = useState(false);
    useEffect(() => {
        if (!identity) return setArtist(false);
        getAllArtists().then((artists) => {
            setArtist(artists.includes(identity.principal!));
        });
    }, [identity]);

    return {
        artist,
    };
};
