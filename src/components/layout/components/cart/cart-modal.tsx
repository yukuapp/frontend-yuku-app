import { Link } from 'react-router-dom';
import { Modal } from 'antd';
import NftName from '@/components/nft/name';
import NftThumbnail from '@/components/nft/thumbnail';
import CloseIcon from '@/components/ui/close-icon';
import { cn } from '@/common/cn';
import { parse_nft_identifier } from '@/common/nft/ext';
import { uniqueKey } from '@/common/nft/identifier';
import { useIdentityStore } from '@/stores/identity';
import { TransactionRecord } from '@/stores/transaction';
import { BatchBuyingTransaction } from '@/types/exchange/batch-buy';
import { IconLaunchpadFailed } from '../../../icons';
import { Button } from '../../../ui/button';
import './index.less';

const BatchBuyingResultModal = ({
    record,
    transaction,
    onClose,
}: {
    record: TransactionRecord;
    transaction: BatchBuyingTransaction;
    onClose: () => void;
}) => {
    const toggleShowShoppingCart = useIdentityStore((s) => s.toggleShowShoppingCart);
    const showShoppingCart = useIdentityStore((s) => s.showShoppingCart);
    const sale_list = transaction.args.token_list;

    let success_token_list;

    switch (transaction.type) {
        case 'batch-buy':
            if (
                transaction.args.token_list.every(
                    (l) => l.listing.type === 'listing' && l.listing.raw.type === 'entrepot',
                )
            ) {
                success_token_list = transaction.actions
                    .find((i) => i.action === 'BATCH_SETTLE')
                    ?.data.settle_account_list.map((t) => parse_nft_identifier(t.token_identifier));
            } else {
                success_token_list = transaction.actions
                    .find((i) => i.action === 'SUBMITTING_HEIGHT')
                    ?.data.map(parse_nft_identifier);
            }
            break;
        default:
            success_token_list = [];
            break;
    }

    const cancelModal = () => {
        onClose();
    };
    const success = record.status === 'successful';

    return (
        <Modal
            open={success}
            footer={null}
            onCancel={cancelModal}
            centered={true}
            closeIcon={<CloseIcon></CloseIcon>}
            className="batch-buy-result"
        >
            <div className="flex min-h-[400px] flex-col items-center justify-center">
                <div className={cn('flex h-full flex-col justify-between')}>
                    {(!success_token_list ||
                        (success_token_list && success_token_list.length === 0)) && (
                        <div className="flex min-h-[400px] flex-col justify-between">
                            <span className="mb-[20px] font-inter-bold text-[20px]">
                                Purchase Failed
                            </span>
                            <div className="flex flex-col items-center">
                                <IconLaunchpadFailed className="h-[142.3px] w-[179px]" />
                                <p className="mt-[30px] font-inter text-[14px] leading-[20px] ">
                                    Sorry, your purchase has failed. The paid funds have been
                                    returned to your account, please check and try the purchase
                                    again!
                                </p>

                                <div className="mt-[15px] flex justify-center">
                                    <Link to={'/profile'}>
                                        <Button className="!hover:text-white h-[48px] w-[160px] cursor-pointer rounded-[8px] bg-shiku text-center text-[16px] leading-[48px] text-white hover:bg-shiku/60 hover:text-white">
                                            View NFT
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                    {success_token_list && success_token_list.length !== 0 && (
                        <>
                            <div className="">
                                <img
                                    className="m-auto mb-[8px] flex w-[200px] items-center justify-center"
                                    src={'/img/market/success.svg'}
                                    alt=""
                                />
                                <div className="mb-[19px] text-center font-inter-bold text-[14px] md:mb-[25px]">
                                    Purchase successfully!
                                </div>
                            </div>
                            <div className="grid w-full grid-cols-3 flex-wrap items-center gap-x-[24px]  gap-y-[20px] md:grid-cols-5">
                                {success_token_list.map((i) => (
                                    <div
                                        key={uniqueKey(i)}
                                        className="flex h-full w-full cursor-pointer flex-col justify-between"
                                    >
                                        <NftThumbnail token_id={i} />

                                        <NftName
                                            token_id={i}
                                            className="mt-[9px] h-[14px] text-center text-[12px] leading-[14px]"
                                            shrink_text={{ prefix: 3, suffix: 6 }}
                                        ></NftName>
                                    </div>
                                ))}
                            </div>
                            <div className="font-inter-normal mt-[30px] w-full text-left  text-[14px]">
                                You claimed {sale_list.length} NFT{sale_list.length > 1 ? 's' : ''}{' '}
                                and the result is:&nbsp;
                                <span className="text-shiku">
                                    {success_token_list?.length} successes,{' '}
                                    {sale_list.length - success_token_list.length} failures
                                </span>
                            </div>
                            <div className="font-inter-normal m-auto hidden  text-left text-[14px]">
                                In the failed claim, the paid funds have been returned to your
                                account, please check and try the purchase again!
                            </div>
                            <div className="font-inter-normal m-auto  text-left text-[14px]">
                                Sorry for the inconvenience, you will get your refund in your
                                account for failed order, please check and try to purchase again!
                            </div>
                            <div className="mt-[30px]">
                                <div className="font-inter-normal mb-[19px] text-center text-[12px] md:mb-[15px]">
                                    Check your NFT in the profile page
                                </div>
                                <Link
                                    to="/profile"
                                    onClick={() => {
                                        onClose();
                                        showShoppingCart && toggleShowShoppingCart();
                                    }}
                                >
                                    <Button className="m-auto block !h-[40px] !w-[134px] rounded-[8px]  bg-shiku text-center font-inter-bold text-[16px] text-white  hover:bg-shiku/60 hover:text-white md:!h-[48px] md:!w-[160px]">
                                        View
                                    </Button>
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </Modal>
    );
};
export default BatchBuyingResultModal;
