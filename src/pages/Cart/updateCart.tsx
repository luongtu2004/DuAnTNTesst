import React, { useState } from 'react';
import { Modal, Input, message, Image } from 'antd';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from 'axios';

interface CartItem {
    id: string;
    name: string;
    image: string;
    color: string;
    size: string;
    quantity: number;
    price: number;
}

interface UpdateCartProps {
    cartItem: CartItem;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (updatedItem: CartItem) => void;
}

const UpdateCart: React.FC<UpdateCartProps> = ({
    cartItem,
    isOpen,
    onClose,
    onUpdate
}) => {
    const { data } = useQuery({
        queryKey: ['product'],
        queryFn: async () => {
            const response = await axios.get(`http://localhost:3000/data`);
            return response.data;
        }
    });

    const [quantity, setQuantity] = useState(cartItem.quantity);
    const [size, setSize] = useState(cartItem.size);
    const queryClient = useQueryClient();
    
    const updateCartMutation = useMutation({
        mutationFn: async (updatedItem: CartItem) => {
            const response = await axios.put(`http://localhost:3000/cart/${updatedItem.id}`, updatedItem);
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            message.success("Giỏ hàng đã được cập nhật thành công");
            onUpdate(data);
            onClose();
        },
        onError: (error) => {
            message.error(`Lỗi khi cập nhật giỏ hàng: ${(error as Error).message}`);
        },
    });

    const handleUpdateCart = () => {
        const updatedItem: CartItem = {
            ...cartItem,
            quantity: quantity,
            size: size,
        };

        updateCartMutation.mutate(updatedItem);
    };

    return (
        <Modal
            title={null}
            open={isOpen}
            onOk={handleUpdateCart}
            onCancel={onClose}
            footer={null}
            width={700}
        >
            <div className="flex">
                {/* Left Image Section */}
                <div className="w-1/2">
                    <Image
                        src={cartItem.image}
                        alt={cartItem.name}
                        width={300}
                        className="mb-4"
                    />
                    <div className="flex justify-center mt-2 space-x-2">
                        <Image
                            src={cartItem.image}
                            alt={cartItem.name}
                            width={60}
                            className="cursor-pointer"
                        />
                        <Image
                            src={cartItem.image}
                            alt={cartItem.name}
                            width={60}
                            className="cursor-pointer"
                        />
                    </div>
                </div>

                {/* Right Section */}
                <div className="w-1/2 pl-8">
                    <h2 className="text-xl font-semibold mb-2">{cartItem.name}</h2>

                    {/* Size Options */}
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">Kích cỡ:</h3>
                        <div className="flex space-x-4">
                            {data && data.variations ? (
                                data.variations.flatMap((variation: any) =>
                                    variation.variation_values.map((value: any) => (
                                        <div key={value.id}>
                                            <input
                                                type="radio"
                                                id={`size-${value.id}`}
                                                name="size"
                                                value={value.attribute_value_id}
                                                checked={size === value.attribute_value_id.toString()}
                                                onChange={() => setSize(value.attribute_value_id.toString())}
                                            />
                                            <label htmlFor={`size-${value.id}`} className="ml-1">
                                                {value.attribute_value_id}
                                            </label>
                                        </div>
                                    ))
                                )
                            ) : (
                                <p>Không có dữ liệu kích thước</p>
                            )}
                        </div>
                    </div>

                    {/* Quantity Section */}
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">Số lượng:</h3>
                        <div className="flex items-center space-x-2">
                            <button
                                className="px-4 py-2 bg-gray-200 rounded"
                                onClick={() => setQuantity(prev => Math.max(prev - 1, 1))}
                            >
                                -
                            </button>
                            <Input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                min={1}
                                className="text-center w-[50px]"
                            />
                            <button
                                className="px-4 py-2 bg-gray-200 rounded"
                                onClick={() => setQuantity(prev => prev + 1)}
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-4">
                        <button
                            className="px-6 py-3 bg-white border border-gray-400 rounded-lg"
                            onClick={onClose}
                        >
                            Hủy
                        </button>
                        <button
                            className="px-6 py-3 bg-black text-white rounded-lg"
                            onClick={handleUpdateCart}
                        >
                            Cập nhật
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default UpdateCart;
