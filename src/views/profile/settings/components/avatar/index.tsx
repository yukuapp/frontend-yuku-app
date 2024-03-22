import { useRef, useState } from 'react';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Modal, Upload } from 'antd';
import { RcFile } from 'antd/es/upload/interface';
import message from '@/components/message';
import { cdn_by_assets } from '@/common/cdn';
import { useUploadFile2Web3storage } from '../../../../../hooks/nft/upload';
import './index.less';

const imageFileTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/svg+xml',
    'video/mp4',
    'video/x-matroska',
    'model/gltf-binary',
    'model/gltf+json',
];

type CroppedImg = {
    blob: Blob;
    url: string;
};

interface NewBlob extends Blob {
    uid?: string;
}

const AvatarCrop = ({
    avatar,
    onFileChange,
}: {
    avatar: string;
    onFileChange: (avatar) => void;
}) => {
    const ImageRef = useRef<HTMLImageElement | null>(null);
    const [uploading, setUploading] = useState(false);
    const [crop, setCrop] = useState<Crop>({} as Crop);
    const [cropModalVisible, setCropModalVisible] = useState(false);
    const [cropImg, setCropImg] = useState('');
    // croppedImg
    const [, setCroppedImg] = useState('');
    const [oriFile, setOriFile] = useState<RcFile>();

    const loadFile = (file: RcFile) => {
        setOriFile(file);
        setCropModalVisible(true);
        setCropImg(window.URL.createObjectURL(file));
        return false;
    };

    const cropAfterLoad = () => {
        if (ImageRef.current) {
            const scale = ImageRef.current.naturalHeight / ImageRef.current.naturalWidth;
            let width = ImageRef.current.width;
            let height = ImageRef.current.height;
            if (scale > 1) {
                height = height / scale;
            } else {
                width = width * scale;
            }
            setCrop({ unit: 'px', x: 0, y: 0, width, height });
        }
    };

    const getCroppedImg = async () => {
        const canvas = document.createElement('canvas');
        const img = ImageRef.current;

        if (img) {
            const scaleX = img.naturalWidth / img.width;
            const scaleY = img.naturalHeight / img.height;
            canvas.width = crop.width;
            canvas.height = crop.height;
            const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
            ctx.drawImage(
                img,
                crop.x * scaleX,
                crop.y * scaleY,
                crop.width * scaleX,
                crop.height * scaleY,
                0,
                0,
                crop.width,
                crop.height,
            );
            const res = await new Promise((resolve) => {
                canvas.toBlob((blob: NewBlob | null) => {
                    if (!blob) {
                        console.error('Canvas is empty');
                        resolve({});
                    }

                    if (blob) {
                        blob.uid = oriFile?.uid;
                    }

                    console.debug('blob', blob);
                    // blob.uid = oriFile?.uid;

                    const url = blob && window.URL.createObjectURL(blob);

                    resolve({ url, blob } as CroppedImg);
                }, 'image/jpeg');
            });
            return res;
        }
    };

    const handleFinish = async () => {
        const croppedImgData = await getCroppedImg();
        const { url, blob } = croppedImgData as CroppedImg;
        if (!(url && blob)) {
            message.error('Invalid Image');
            return;
        }

        setCropModalVisible(false);
        setCroppedImg(url);

        onFinalChange(blob);
    };

    const onFinalChange = (e: any) => {
        uploadFile(e).then((avatar) => {
            console.log('avatar', avatar);

            onFileChange(avatar);
        });
    };
    const {
        uploadFile: uploadOriginFile,
        // mimeType: mimeTypeOrigin,
    } = useUploadFile2Web3storage();

    const uploadFile = async (file: File): Promise<string> => {
        setUploading(true);
        // const spend = Spend.start(`upload file`, true);
        try {
            const avatar = await uploadOriginFile(file);
            if (!avatar) {
                throw new Error('no url returned, backend issue');
            }
            return avatar;
        } finally {
            // spend.mark('over');
            setUploading(false);
        }
    };

    return (
        <>
            <Upload
                accept={imageFileTypes.toString()}
                name="avatar"
                listType="picture-card"
                showUploadList={false}
                beforeUpload={loadFile}
                iconRender={() => <></>}
                className="uploadAvatar"
                disabled={true}
                style={{ border: 'none' }}
                // rootClassName="border-none"
            >
                {avatar && (
                    <div className="group flex h-full w-full items-center justify-center">
                        <img
                            src={avatar}
                            alt=""
                            className="absolute left-0 top-0 flex-shrink-0 rounded-full"
                        />

                        {/* {!uploading && (
                            <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center opacity-0 duration-100 group-hover:opacity-100">
                                <div className="flex h-full w-full flex-shrink-0 cursor-pointer rounded-full bg-black bg-opacity-30 blur-[14px] backdrop-blur-[14px]"></div>
                                <img
                                    src="/img/profile/pen.svg"
                                    className="absolute z-50 h-[28px] w-[28px] flex-shrink-0 cursor-pointer md:h-[48px] md:w-[48px]"
                                />
                            </div>
                        )} */}
                        {uploading && (
                            <img
                                className="absolute left-0 top-0 w-full"
                                src={cdn_by_assets('/images/common/loading.gif')}
                                alt="loading image"
                            />
                        )}
                    </div>
                )}
                {!avatar && <></>}
            </Upload>
            <Modal
                maskClosable={false}
                open={cropModalVisible}
                // onOk={handleFinish}
                onCancel={() => setCropModalVisible(false)}
                closable={false}
                className="crop-modal"
                width={600}
                footer={null}
            >
                <div>
                    <div className="mx-auto flex w-full justify-center">
                        <ReactCrop
                            aspect={1}
                            crop={crop}
                            circularCrop={true}
                            onChange={(c) => setCrop(c)}
                            className="max-h-[200px] min-h-[150px] min-w-[150px] max-w-[287px] sm:max-w-[287px] md:max-w-[287px]"
                        >
                            <img
                                className="max-h-[200px] min-h-[150px] min-w-[150px] max-w-[287px] sm:max-w-[287px] md:max-w-[287px]"
                                ref={ImageRef}
                                src={cropImg}
                                onLoad={cropAfterLoad}
                            />
                        </ReactCrop>
                    </div>

                    <div className="mx-auto mt-[20px] flex w-[320px] cursor-pointer justify-between">
                        <div
                            onClick={() => setCropModalVisible(false)}
                            className="h-[48px] w-[150px] flex-shrink-0 rounded-[8px] border border-solid border-black/60 bg-white text-center font-inter-bold text-[16px] leading-[48px] text-black"
                        >
                            Cancel
                        </div>
                        <div
                            onClick={handleFinish}
                            className="h-[48px] w-[150px] flex-shrink-0 rounded-[8px] bg-black text-center font-inter-bold text-[16px] leading-[48px] text-white"
                        >
                            OK
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default AvatarCrop;
