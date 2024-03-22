import YukuIcon from '@/components/ui/yuku-icon';
import {
    getCollectionNameByNftMetadata,
    getNameByNftMetadataForCart,
    getThumbnailByNftMetadata,
} from '@/utils/nft/metadata';
import { cdn } from '@/common/cdn';
import { cn } from '@/common/cn';
import { shrinkText } from '@/common/data/text';
import { NftIdentifier } from '@/types/nft';
import { ShoppingCartItem } from '@/types/yuku';
import TokenPrice from '../../../data/price';
import NftMedia from '../../../nft/media';

function CartItem({
    item,
    remove,
}: {
    item: ShoppingCartItem;
    remove: (token_id: NftIdentifier) => void;
}) {
    const isListing = item.listing?.type === 'listing';
    return (
        <div
            className={cn([
                'group m-auto flex h-[80px] w-full flex-shrink-0 cursor-pointer items-center px-[30px] py-[15px] hover:rounded-none hover:bg-[#242C43]',
                !isListing && 'cursor-no-drop bg-[#242C43]',
            ])}
        >
            <div className="relative mr-[15px] w-[57px] flex-shrink-0 rounded-[4px]">
                <NftMedia src={cdn(getThumbnailByNftMetadata(item.card!))} />
            </div>
            {/* <div>{item.token_id.token_identifier}</div> */}
            <div className="flex-1">
                <div
                    className={cn([
                        'mb-[13px] flex-1 truncate font-inter-bold text-[14px] leading-[18px] text-white',
                        !isListing && 'text-[#999]',
                    ])}
                >
                    {getNameByNftMetadataForCart(item.card!)}
                </div>

                <div className="font-inter-normal flex-1 truncate text-[14px] leading-[18px] text-white/60">
                    {shrinkText(getCollectionNameByNftMetadata(item.card), 14, 0)}
                </div>
            </div>
            <div className="ml-[5px] mr-[8px] text-right">
                {item.listing?.type === 'listing' ? (
                    <>
                        <TokenPrice
                            className="text-[12px] group-hover:hidden"
                            value={{
                                value: item.listing.price,
                                token: item.listing.token,
                                scale: 2,
                                thousand: { symbol: 'K' },
                            }}
                        />
                        <div
                            onClick={() => remove(item.token_id)}
                            className="hidden h-[24px] w-[24px] cursor-pointer group-hover:block"
                        >
                            <YukuIcon name="action-delete" size={24} color="#666666" />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="font-inter-semibold text-[12px] text-[#999] group-hover:hidden">
                            Defunct
                        </div>
                        <div
                            onClick={() => remove(item.token_id)}
                            className="hidden h-[24px] w-[24px] cursor-pointer group-hover:block"
                        >
                            <YukuIcon name="action-delete" size={24} color="#666666" />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default CartItem;
