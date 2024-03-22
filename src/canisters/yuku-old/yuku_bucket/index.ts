import { unwrapOption } from '@/common/types/options';
import { string2principal } from '@/common/types/principal';
import { throwIdentity } from '@/stores/identity';
import { ConnectedIdentity } from '@/types/identity';
import idlFactory from './bucket.did';
import _SERVICE from './bucket.did';

export const createBucketFile = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    args: { name: string; mime_type: string; file_size: number; chunk_size: number },
): Promise<string | undefined> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    const r = await actor.createFile({
        name: args.name,
        mimeType: args.mime_type,
        fileSize: BigInt(args.file_size),
        chunkCount: BigInt(args.chunk_size),
    });
    return unwrapOption(r);
};

export const putFileChunk = async (
    identity: ConnectedIdentity,
    backend_canister_id: string,
    args: {
        file_id: string;
        index: number;
        chunk: number[];
    },
): Promise<void> => {
    const { creator, principal } = identity;
    throwIdentity(identity);
    const actor: _SERVICE = await creator(idlFactory, backend_canister_id);
    await actor.putFileChunk(
        args.file_id,
        BigInt(args.index),
        args.chunk,
        string2principal(principal!),
    );
};
