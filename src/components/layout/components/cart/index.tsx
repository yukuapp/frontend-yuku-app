import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Modal } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { getBuyNftRaw } from '@/components/nft-card/components/buy';
import CloseIcon from '@/components/ui/close-icon';
import { useBatchBuyNftByTransaction } from '@/hooks/exchange/batch/buy';
import { useBuyNftByTransaction } from '@/hooks/exchange/single/buy';
import { useYukuPlatformFee } from '@/hooks/interval/platform_fee';
import { useShoppingCart } from '@/hooks/nft/cart';
import { useCollectionDataList } from '@/hooks/nft/collection';
import { queryTokenListing, removeShoppingCartItems } from '@/utils/canisters/yuku-old/core';
import { getYukuServiceFee } from '@/utils/nft/fee';
import { loadNftCardsByStoredRemote } from '@/utils/nft/metadata';
import { cn } from '@/common/cn';
import { exponentNumber } from '@/common/data/numbers';
import { isSameNftByTokenId, uniqueKey } from '@/common/nft/identifier';
import { FirstRenderByData } from '@/common/react/render';
import { useIdentityStore } from '@/stores/identity';
import { NftListingData, NftListingListing } from '@/types/listing';
import { NftIdentifier } from '@/types/nft';
import { ShoppingCartItem } from '@/types/yuku';
import Usd from '../../../data/usd';
import message from '../../../message';
import './index.less';
import CartItem from './item';

const once_load_shopping_cart = new FirstRenderByData();

function CartModal() {
    const showShoppingCart = useIdentityStore((s) => s.showShoppingCart);
    const toggleShowShoppingCart = useIdentityStore((s) => s.toggleShowShoppingCart);
    const [open, setOpen] = useState(showShoppingCart);
    useEffect(() => setOpen(showShoppingCart), [showShoppingCart]);
    const { remove } = useShoppingCart();
    const identity = useIdentityStore((s) => s.connectedIdentity);
    const YukuPlatformFee = useYukuPlatformFee();

    const collectionDataList = useCollectionDataList();

    const navigate = useNavigate();

    const shoppingCartItems = useIdentityStore((s) => s.shoppingCartItems);
    const updateShoppingCartItem = useIdentityStore((s) => s.updateShoppingCartItem);
    const cleanShoppingCartItems = useIdentityStore((s) => s.cleanShoppingCartItems);

    const items: ShoppingCartItem[] = shoppingCartItems ?? [];
    const total_icp = items
        .filter((t) => t.listing?.type === 'listing')
        .map((t) => ({
            symbol: (t.listing as NftListingListing).token.symbol,
            decimals: (t.listing as NftListingListing).token.decimals,
            fee: (t.listing as NftListingListing).token.fee,
            price: (t.listing as NftListingListing).price,
        }))
        .filter((t) => t.symbol === 'ICP')
        .filter((t) => t.price)
        .map((t) => BigInt(t.price ?? '0') + BigInt(t.fee ?? '0'))
        .reduce((a, b) => a + b, BigInt(0));

    useEffect(() => {
        once_load_shopping_cart.once(
            [(shoppingCartItems ?? []).map((id) => uniqueKey(id.token_id))],
            () => {
                loadNftCardsByStoredRemote(
                    collectionDataList,
                    items.map((item) => item.token_id),
                    () => {},
                ).then((card_list) => {
                    Promise.all(
                        card_list.map(
                            (card) =>
                                new Promise<NftListingData | undefined>((resolve) => {
                                    queryTokenListing([card.metadata.token_id])
                                        .then((d) => resolve(d[0]))
                                        .catch(() => resolve(undefined));
                                }),
                        ),
                    ).then((listing_list) => {
                        for (const item of items) {
                            const card = card_list.find((c) =>
                                isSameNftByTokenId(c.metadata, item),
                            );
                            const listing_data = listing_list
                                .filter((c) => !!c)
                                .find((c) => isSameNftByTokenId(c!, item));
                            item.card = card;
                            item.listing = listing_data?.listing;
                            updateShoppingCartItem(item);
                        }
                    });
                });
            },
        );
    }, [shoppingCartItems]);

    const clean = async () => {
        if (!identity) return navigate('/connect');

        removeShoppingCartItems(identity).catch((e) => {
            message.error(`${e}`);
        });
        cleanShoppingCartItems();
    };
    const { batchBuy, action } = useBatchBuyNftByTransaction();
    const { buy, action: single_action } = useBuyNftByTransaction();
    const connectByPlug = useIdentityStore((s) => s.connectedIdentity?.connectType === 'plug');
    const onConfirm = async () => {
        const nft_list = items.filter((t) => t.card !== undefined && t.listing?.type === 'listing');
        if (nft_list.length === 0) {
            message.error('add nft please');
            return;
        }

        toggleShowShoppingCart();
        if (nft_list.length === 0) {
            throw new Error('add nft please');
        }
        const entrepot_list = nft_list.filter(
            (l) => l.listing?.type === 'listing' && l.listing.raw.type === 'entrepot',
        );
        const yuku_list = nft_list.filter(
            (l) => l.listing?.type === 'listing' && l.listing.raw.type !== 'entrepot',
        );

        try {
            (
                await Promise.all([
                    yuku_list.length &&
                        batchBuy(
                            yuku_list.map((item) => ({
                                owner: item.card!.owner,
                                listing: item.listing!,
                            })),
                        ),

                    ...(connectByPlug
                        ? [
                              entrepot_list.length &&
                                  batchBuy(
                                      entrepot_list.map((item) => ({
                                          owner: item.card!.owner,
                                          listing: item.listing!,
                                      })),
                                  ),
                          ]
                        : [
                              entrepot_list.length &&
                                  entrepot_list.map(async (n) => {
                                      return new Promise((resolve, reject) => {
                                          if (n.listing?.type !== 'listing' || !n.card) {
                                              reject('not list' + n.token_id.token_identifier);
                                              return;
                                          }
                                          buy(
                                              n.token_id,
                                              n.card?.owner.owner,
                                              n.listing?.token,
                                              n.listing?.price,
                                              getBuyNftRaw(n.card, n.card.listing),
                                          ).then(() => resolve(n.token_id));
                                      });
                                  }),
                          ]),
                ])
            )
                .filter((r) => r)
                .flat() as NftIdentifier[];
        } catch (e) {
            console.debug('🚀 ~ onConfirm ~ e:', e);
        }
    };

    useEffect(() => {
        items
            .filter((item) => !item.card || !item.listing)
            .map((i) => {
                remove(i.token_id);
            });
    }, [items]);

    return (
        <Modal
            open={open}
            footer={null}
            //onOk={onConfirm}
            closeIcon={<CloseIcon className="mr-[28px]"></CloseIcon>}
            onCancel={toggleShowShoppingCart}
            className="cart-modal-wrap"
        >
            <div className="flex items-center pl-[30px] pt-[30px]">
                <div className="mr-[9px] font-inter-bold text-[22px] leading-[21px] text-white">
                    Cart
                </div>
                {!!items.length && (
                    <div className="mr-[33px] h-[21px] w-[21px] flex-shrink-0 rounded-[4px] bg-[#E31111] text-center font-inter-bold text-[12px] leading-[21px] text-white">
                        {`${items.length}`}
                    </div>
                )}
                {!!items.length && (
                    <div
                        className="cursor-pointer font-inter-bold text-[16px] text-[#fff]/60"
                        onClick={clean}
                    >
                        Clear All
                    </div>
                )}
            </div>
            {!items.length && (
                <div className="m-auto mb-[20px] mt-[23px] h-[1px] w-[328px] border border-[#fff9]"></div>
            )}
            {!items.length && (
                <div className="mb-[39px] px-[30px] font-inter-medium text-[14px] text-white/60">
                    There are no items in the cart
                </div>
            )}
            {!items.length && (
                <Link
                    to={'/marketplace/explore'}
                    className="m-auto block h-[48px] w-[328px] rounded-[8px] bg-[#36F] text-center font-inter-semibold text-[14px] leading-[48px] text-white"
                >
                    {'Explore'}
                </Link>
            )}
            <div className="mt-[40px] flex-1 overflow-y-scroll">
                {items
                    .filter((item) => item.card && item.listing)
                    .map((item) => (
                        <CartItem key={uniqueKey(item.token_id)} item={item} remove={remove} />
                    ))}
            </div>
            {!!items.length && (
                <ul className="m-auto mb-[19px] mt-[30px] flex w-[323px] list-none items-center p-0">
                    <li className="mr-[14px] font-inter-semibold text-[12px] text-white">Fees:</li>
                    <li className="font-inter-normal mr-[14px] text-[12px] text-white text-opacity-75">
                        Service fee
                    </li>
                    <li className="font-inter-semibold text-[12px] text-white">
                        {getYukuServiceFee(YukuPlatformFee) ?? '--'}%
                    </li>
                </ul>
            )}
            {!!items.length && (
                <ul className="m-auto mb-[15px] flex h-[49px] w-[323px] flex-shrink-0 list-none items-center justify-end rounded-[8px] bg-[#242C43] p-0 px-[16px]">
                    <li className="mr-auto font-inter-medium text-[12px] text-white">
                        Total Price
                    </li>
                    <>
                        {/* explorer */}
                        <li className="font-inter-semibold text-[12px] text-white">
                            {exponentNumber(`${total_icp}`, -8)} ICP
                        </li>
                        <li className="font-inter-normal ml-[8px] mr-[16px] text-[13px] text-white/60 text-opacity-40">
                            (
                            <Usd
                                value={{
                                    value: `${total_icp}`,
                                    decimals: { type: 'exponent', value: 8 },
                                    symbol: 'ICP',
                                    scale: 2,
                                }}
                            />
                            )
                        </li>
                    </>
                </ul>
            )}

            {!!items.length && (
                <div
                    className={cn([
                        'm-auto h-[45px] w-[323px] rounded-[8px] bg-[#36F] text-center font-inter-semibold text-[14px] leading-[45px] text-white',
                        !(action || single_action) && 'cursor-pointer',
                    ])}
                    onClick={onConfirm}
                >
                    {(action || single_action) && <LoadingOutlined className="mr-2" />}
                    Check out
                </div>
            )}
        </Modal>
    );
}

export default CartModal;
