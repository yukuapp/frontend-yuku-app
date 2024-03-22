import { useCallback, useState } from 'react';
import { uploadFile2Web3Storage } from '@/utils/apis/yuku/api';
import { Spend } from '@/common/react/spend';
import { useIdentityStore } from '@/stores/identity';

export const useUploadFile2Web3storage = (): {
    uploadFile: (file: File) => Promise<string | undefined>;
    status: boolean;
    mimeType?: string;
} => {
    const getYukuToken = useIdentityStore((s) => s.getYukuToken);
    const identity = useIdentityStore((s) => s.connectedIdentity);
    const token = identity && getYukuToken();
    const [uploading, setUploading] = useState(false);
    const uploadFile = useCallback(
        async (file: File): Promise<string | undefined> => {
            if (!token) {
                throw new Error('cant find token or token invalid, please login again!');
            }
            setUploading(true);
            const spend = Spend.start(`upload file`, true);
            try {
                const url = await uploadFile2Web3Storage({
                    file,
                    user_id: token.user_id,
                    user_token: token.user_token,
                });
                return url;
            } finally {
                spend.mark('over');
                setUploading(false);
            }
        },
        [token],
    );
    return {
        uploadFile,
        status: uploading,
    };
};
