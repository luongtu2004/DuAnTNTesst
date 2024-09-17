import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import ChangeOptionsModal from "./updateCart";

// Define the structure of the cart item
interface CartItem {
    id: string;
    name: string;
    image: string;
    color: string;
    size: string;
    quantity: number;
    price: number;
}

const Cart: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Fetch cart items using React Query
    const { data: cartItems, isLoading, error } = useQuery<CartItem[]>({
        queryKey: ['cart'],
        queryFn: () => axios.get('http://localhost:3000/cart').then((res) => res.data),
    });

    // Update cart mutation
    const updateCartMutation = useMutation({
        mutationFn: (updatedItem: CartItem) =>
            axios.put(`http://localhost:3000/cart/${updatedItem.id}`, updatedItem),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        },
    });

    // Remove cart item mutation
    const removeCartItemMutation = useMutation({
        mutationFn: (id: string) => axios.delete(`http://localhost:3000/cart/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        },
    });

    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<CartItem | null>(null);

    // Handle checkbox change for selecting items
    const handleSelectItem = (id: string) => {
        setSelectedItems((prevSelectedItems) =>
            prevSelectedItems.includes(id)
                ? prevSelectedItems.filter((itemId) => itemId !== id) // Deselect
                : [...prevSelectedItems, id] // Select
        );
    };

    // Handle "Select All" checkbox
    const handleSelectAll = () => {
        if (cartItems) {
            if (selectedItems.length === cartItems.length) {
                // If all items are selected, deselect all
                setSelectedItems([]);
            } else {
                // Otherwise, select all items
                setSelectedItems(cartItems.map((item) => item.id));
            }
        }
    };

    // Remove item from cart
    const handleRemoveItem = (id: string) => {
        removeCartItemMutation.mutate(id);
        setSelectedItems((prevSelected) => prevSelected.filter((itemId) => itemId !== id));
    };

    // Handle open modal for changing item options
    const handleOpenModal = (item: CartItem) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    // Handle close modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    // Handle updating item after closing the modal
    const handleUpdateItem = (updatedItem: CartItem) => {
        updateCartMutation.mutate(updatedItem);
        setIsModalOpen(false);
    };

    // Calculate total price of selected items
    const totalPrice =
        cartItems
            ?.filter((item) => selectedItems.includes(item.id))
            .reduce((total, item) => total + item.price * item.quantity, 0) || 0;

    // Calculate total quantity of selected items
    const totalQuantity =
        cartItems
            ?.filter((item) => selectedItems.includes(item.id))
            .reduce((total, item) => total + item.quantity, 0) || 0;

    if (isLoading) {
        return <div className="text-center py-16">Đang tải giỏ hàng...</div>;
    }

    if (error || !cartItems || cartItems.length === 0) {
        return <div className="text-center py-16">Giỏ hàng của bạn đang trống.</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Giỏ hàng của bạn</h1>

            <div className="flex items-center mb-4">
                <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-black mr-2"
                    checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                    onChange={handleSelectAll}
                />
                <span className="text-sm font-bold">Chọn tất cả</span>
            </div>

            <div className="flex justify-between">
                {/* Cart Items */}
                <div className="w-[868px]">
                    {cartItems.map((item) => (
                        <div key={item.id} className="border-b py-6 flex items-start justify-between">
                            <div className="flex items-start">
                                <input
                                    type="checkbox"
                                    className="mr-4 form-checkbox h-5 w-5 text-black"
                                    checked={selectedItems.includes(item.id)}
                                    onChange={() => handleSelectItem(item.id)}
                                />
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-24 h-24 object-cover mr-6 rounded-md"
                                />
                                <div className="flex flex-col">
                                    <p className="font-bold text-md">{item.name}</p>
                                    <p className="text-sm text-gray-600">Màu sắc: {item.color}</p>
                                    <p className="text-sm text-gray-600">Kích cỡ: {item.size}</p>
                                    <p className="text-md font-semibold mt-2">
                                        {item.price.toLocaleString()}₫
                                    </p>
                                    <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                                </div>
                            </div>

                            <div className="flex flex-col space-y-2">
                                <button
                                    className="bg-white border border-gray-400 text-black px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-100 transition duration-300"
                                    onClick={() => handleOpenModal(item)}
                                >
                                    Thay đổi tùy chọn
                                </button>

                                <button
                                    className="bg-white border border-gray-400 text-black px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-100 transition duration-300"
                                    onClick={() => handleRemoveItem(item.id)}
                                >
                                    Xóa
                                </button>
                            </div>

                        </div>
                    ))}
                </div>


                {/* Order Summary */}
                <div className="w-[340px] h-[246px] border shadow-md bg-white">
                    <div className="px-6">
                        <h2 className="text-lg font-bold mb-4">Thông tin đơn hàng</h2>

                        <div className="flex justify-between py-2 text-sm">
                            <span>Tạm tính ({totalQuantity} sản phẩm)</span>
                            <span>{totalPrice.toLocaleString()}₫</span>
                        </div>

                        <div className="flex justify-between py-2 text-sm">
                            <span>Phí vận chuyển</span>
                            <span>-</span>
                        </div>

                        <div className="border-t border-gray-300 my-2"></div> {/* Đường phân cách */}

                        <div className="flex justify-between py-2 font-bold text-lg">
                            <span>Tổng đơn hàng</span>
                            <span>{totalPrice.toLocaleString()}₫</span>
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <button
                            className={`w-full bg-black text-white py-3 mt-4 rounded-md font-bold text-lg tracking-wider uppercase ${selectedItems.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'
                                } transition-all duration-300 ease-in-out`}
                            onClick={() => navigate('/checkout')}
                            disabled={selectedItems.length === 0}
                        >
                            Thanh toán
                        </button>
                    </div>
                </div>


            </div>

            <button
                className="bg-gray-200 text-black mt-6 py-2 px-4 rounded-md font-bold hover:bg-gray-300 transition duration-300"
                onClick={() => navigate('/list')}
            >
                Tiếp tục mua hàng
            </button>

            {isModalOpen && editingItem && (
                <ChangeOptionsModal
                    cartItem={editingItem}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onUpdate={handleUpdateItem}
                />
            )}
        </div>
    );
};

export default Cart;
