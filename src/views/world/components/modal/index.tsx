import { useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { LoadingOutlined } from '@ant-design/icons';
import message from '@/components/message';
import YukuModal from '@/components/modal/yuku-modal';
import AspectRatio from '@/components/ui/aspect-ratio';
import { YukuButton } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createSpace, deleteSpace } from '@/utils/apis/yuku/api';
import { UnityPackage, UserSpace } from '@/apis/yuku/api';
import { url_cdn } from '@/common/cdn';
import { cn } from '@/common/cn';
import { useIdentityStore } from '@/stores/identity';

export const TemplateModal = ({
    open,
    onClose,
    templateList,
    selectedTemplateIndex,
    setSelectedTemplateIndex,
    setCreateSpaceOpen,
}: {
    open: boolean;
    onClose: () => void;
    templateList?: UnityPackage[];
    selectedTemplateIndex: number;
    setSelectedTemplateIndex: (s: number) => void;
    setCreateSpaceOpen: (o: boolean) => void;
}) => {
    return (
        <YukuModal title={'From Templates'} open={open} onClose={onClose} width={'w-[808px]'}>
            <div className="mt-9 grid grid-cols-3 gap-x-5">
                {templateList?.map((t, i) => (
                    <div
                        className="w-full"
                        onMouseEnter={() => {
                            setSelectedTemplateIndex(i);
                        }}
                        onClick={() => {
                            setCreateSpaceOpen(true);
                            onClose();
                        }}
                    >
                        <AspectRatio
                            ratio={238 / 182}
                            style={{
                                backgroundImage: url_cdn(t.package_thumbnail),
                            }}
                            className={cn(
                                'cursor-pointer rounded-[16px] border-[3px] bg-cover bg-no-repeat transition-all duration-200',
                                selectedTemplateIndex === i && ' border-[#1882FF]',
                            )}
                        ></AspectRatio>
                        <div className="mt-5 text-center font-inter-semibold text-lg capitalize  text-sky-100">
                            {t.package_name}
                        </div>
                    </div>
                ))}
            </div>
        </YukuModal>
    );
};

export const ShareModal = ({
    open,
    onClose,
    url,
}: {
    open: boolean;
    onClose: () => void;
    url: string;
}) => {
    return (
        <YukuModal title="Share Space" open={open} onClose={onClose}>
            <div className="flex flex-col items-start justify-center">
                <div className="mt-[55px] text-center font-inter-semibold text-base leading-loose text-[#E5F0FF]">
                    URL Link
                </div>
                <div className="mt-5 h-[60px] w-[490px] rounded-[8px] bg-[#283047]   px-5 font-inter-medium text-sm leading-[60px] text-[#fff]">
                    {url}
                </div>
                <CopyToClipboard text={url} onCopy={() => message.success(`Copied`)}>
                    <YukuButton type={'CONFIRM'} className="mx-auto mt-[57px]" onClick={onClose}>
                        Copy
                    </YukuButton>
                </CopyToClipboard>
            </div>
        </YukuModal>
    );
};

export const DeleteModal = ({
    open,
    onClose,
    space,
    updateSpaceList,
}: {
    open: boolean;
    onClose: () => void;
    space: UserSpace;
    updateSpaceList: (s?: boolean) => void;
}) => {
    const identity = useIdentityStore((s) => s.connectedIdentity);
    const getYukuToken = useIdentityStore((s) => s.getYukuToken);
    const token = identity && getYukuToken();
    const [deleting, setDeleting] = useState<boolean>(false);
    return (
        <YukuModal hasHeader={false} open={open} onClose={onClose}>
            <div className="flex flex-col items-center justify-center">
                <img src="/img/world/delete-warning.svg" className="w-[126px]" alt="" />
                <div className="mt-[35px] text-center font-inter-semibold text-lg leading-loose text-[#E5F0FF]">
                    Do you want to delete this space?
                </div>
                <div className="mt-[35px] flex justify-between gap-x-[89px]">
                    <YukuButton type={'CANCEL'} onClick={onClose}>
                        Cancel
                    </YukuButton>
                    <YukuButton
                        type={'CONFIRM'}
                        onClick={() => {
                            if (token) {
                                setDeleting(true);
                                !deleting &&
                                    deleteSpace({
                                        params: token,
                                        data: { id: space.id },
                                    }).finally(() => {
                                        setDeleting(false);
                                        updateSpaceList(true);
                                        onClose();
                                    });
                            }
                        }}
                    >
                        Delete
                        {deleting && <LoadingOutlined className="ml-2"></LoadingOutlined>}
                    </YukuButton>
                </div>
            </div>
        </YukuModal>
    );
};

export const CreateSpaceModal = ({
    open,
    onClose,
    template,
    updateSpaceList,
}: {
    open: boolean;
    onClose: () => void;
    template: UnityPackage;
    updateSpaceList: (s?: boolean) => void;
}) => {
    const identity = useIdentityStore((s) => s.connectedIdentity);
    const getYukuTokens = useIdentityStore((s) => s.getYukuToken);
    const token = identity && getYukuTokens();
    const [creating, setCreating] = useState<boolean>();
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');

    const onSpaceTitleChange = (e: { target: { value: string } }) => {
        setTitle(e.target.value);
    };
    const onSpaceIntroChange = (e: { target: { value: string } }) => {
        setDescription(e.target.value);
    };
    return (
        <YukuModal title={'Create space'} open={open} onClose={onClose}>
            <div className="mt-10 flex w-full flex-col items-center justify-center">
                <div className="flex w-full flex-col items-center justify-between">
                    <div className="flex w-full flex-col justify-between gap-y-2">
                        <div>
                            <div className="mb-5 font-inter-semibold text-base leading-none text-slate-300">
                                Space Name
                            </div>
                            <Input
                                className="h-12 w-full border bg-[#283047]"
                                value={title}
                                onChange={onSpaceTitleChange}
                                placeholder="Please enter a space name"
                            ></Input>
                        </div>
                        <div className="mt-[30px]">
                            <div className="mb-5 font-inter-semibold text-base leading-none text-slate-300">
                                Description
                            </div>
                            <Textarea
                                value={description}
                                onChange={onSpaceIntroChange}
                                placeholder="Please enter description"
                                className="h-[229px] border bg-[#283047] focus-visible:outline-none"
                            ></Textarea>
                        </div>
                    </div>
                </div>
                <div className="mt-[35px] flex justify-between gap-x-[89px]">
                    <YukuButton
                        onClick={() => {
                            if (title === '') {
                                message.error('Please enter a title');
                                return;
                            }
                            if (token) {
                                setCreating(true);
                                !creating &&
                                    createSpace({
                                        params: token,
                                        data: { title, description, template },
                                    })
                                        .then((id) =>
                                            window.open(
                                                `/space/${id}/${token.user_id ?? ''}`,
                                                '_blank',
                                            ),
                                        )
                                        .catch((e) => {
                                            console.debug('🚀 ~ e:', e);
                                            message.error(`Exceed upper limit of 3 Spaces`);
                                        })
                                        .finally(() => {
                                            setCreating(false);
                                            updateSpaceList(true);
                                            onClose();
                                            setTitle('');
                                            setDescription('');
                                        });
                            }
                        }}
                        type={'CONFIRM'}
                    >
                        Create
                        {creating && <LoadingOutlined className="ml-2"></LoadingOutlined>}
                    </YukuButton>
                </div>
            </div>
        </YukuModal>
    );
};
