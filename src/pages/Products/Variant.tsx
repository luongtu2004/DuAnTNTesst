import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Spin, Button, message } from "antd";
import axios from 'axios';
import { useParams } from 'react-router-dom';

interface Product {
    id: number;
    name: string;
    price: string;
    variations: Variation[];
}

interface Variation {
    id: number;
    attribute_value: { value: string };
    variation_values: VariationValue[];
    variation_images: VariationImage[];
}

interface VariationValue {
    id: number;
    price: string;
    discount: number;
    sku: string;
    stock: number;
    attribute_value_id: string;
}

interface VariationImage {
    id: number;
    image_path: string;
    image_type: string;
}

// Color mapping
const colorMap: { [key: string]: string } = {
    "Xanh lá cây": "rgb(36 158 92)",
    "Xanh Nước biển": "rgb(168 190 235)",
    "Đen": "#000000",
    "Trắng": "#FFFFFF",
    "Vàng": "#FFFF00",
};

const VariantPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState<number | null>(null);
    const queryClient = useQueryClient();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const { data, isLoading, error } = useQuery<Product>({
        queryKey: ["product", id],
        queryFn: async () => {
            const response = await axios.get(`http://localhost:3000/data`);
            return response.data;
        },
    });

    const addToCartMutation = useMutation({
        mutationFn: async (cartItem: any) => {
            const response = await axios.post('http://localhost:3000/cart', cartItem);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            message.success("Thêm vào giỏ hàng thành công");
        },
        onError: (error) => {
            message.error(`Lỗi khi thêm vào giỏ hàng: ${(error as Error).message}`);
        },
    });

    useEffect(() => {
        if (data && data.variations.length > 0) {
            setSelectedColor(data.variations[0].id);
        }
    }, [data]);

    if (isLoading) return <Spin size="large" />;
    if (error) return <div>Có lỗi xảy ra: {(error as Error).message}</div>;
    if (!data) return <div>Không tìm thấy sản phẩm</div>;

    const product = data;
    const selectedVariation = product.variations.find(variation => variation.id === selectedColor) || product.variations[0];

    const handleColorChange = (colorId: number) => {
        setSelectedColor(colorId);
        setSelectedSize(null);
    };

    const selectedVariationValue = selectedVariation.variation_values.find(value => value.attribute_value_id === selectedSize) || selectedVariation.variation_values[0];
    const discountedPrice = parseFloat(selectedVariationValue.price);
    const discount = selectedVariationValue.discount;
    const originalPrice = discount > 0 ? discountedPrice / (1 - discount / 100) : discountedPrice;

    const handleAddToCart = () => {
        if (!selectedSize) {
            message.error("Vui lòng chọn kích thước");
            return;
        }

        const cartItem = {
            productId: product.id,
            name: product.name,
            color: selectedVariation.attribute_value.value,
            size: selectedSize,
            price: selectedVariationValue.price,
            quantity: 1,
            image: selectedVariation.variation_images[0].image_path,
        };

        addToCartMutation.mutate(cartItem);
    };

    const handleBuyNow = () => {
        if (!selectedSize) {
            message.error("Vui lòng chọn kích thước");
            return;
        }
        message.success("Đang chuyển đến trang thanh toán");
    };

    const handlePrevImage = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === 0 ? selectedVariation.variation_images.length - 1 : prevIndex - 1
        );
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prevIndex) =>
            (prevIndex + 1) % selectedVariation.variation_images.length
        );
    };

    return (
        <div className="flex gap-5">
            {/* Left Side - Thumbnails */}
            <div className="col-span-2 w-[100px] h-[660px] overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-300">
                <div className="flex flex-col space-y-4 overflow-hidden">
                    {selectedVariation.variation_images.map((image, index) => (
                        <img
                            key={image.id}
                            src={image.image_path}
                            alt={product.name}
                            className={`w-[900px] h-[100px] object-cover rounded-md cursor-pointer transition-all ${index === currentImageIndex ? 'border-2 border-black' : 'border-2 border-transparent'}`}
                            onClick={() => setCurrentImageIndex(index)}
                        />
                    ))}
                </div>

            </div>

            <div className="col-span-5 relative">
                <img
                    src={selectedVariation.variation_images[currentImageIndex].image_path}
                    alt={product.name}
                    className="w-[550px] h-[660px] object-cover rounded-md shadow-md"
                />
                {/* Previous Button */}
                <button
                    className="absolute top-1/2 left-[-0px] transform -translate-y-1/2  w-[40px] h-[40px] flex items-center justify-center"
                    onClick={handlePrevImage}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="46" viewBox="0 0 24 46" fill="none">
                        <path d="M22.5 43.8335L1.66666 23.0002L22.5 2.16683" stroke="black" stroke-width="2" stroke-linecap="square"></path>
                    </svg>

                </button>

                {/* Next Button */}
                <button
                    className="absolute top-1/2 right-[-0px] transform -translate-y-1/2  w-[40px] h-[40px] flex items-center justify-center"
                    onClick={handleNextImage}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="46" viewBox="0 0 24 46" fill="none">
                        <path d="M1.66675 2.1665L22.5001 22.9998L1.66675 43.8332" stroke="black" stroke-width="2" stroke-linecap="square"></path>
                    </svg>

                </button>
            </div>

            {/* Product Information */}
            <div className="col-span-5 pl-10">
                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                <p className="text-sm text-gray-500 mb-4">Mã sản phẩm: {selectedVariationValue.sku}</p>
                <div className="flex items-center space-x-2">
                    <p className="text-3xl text-black font-semibold">
                        {discountedPrice.toLocaleString()}<span className="text-base align-top">đ</span>
                    </p>

                    {/* Original Price */}
                    {discount > 0 && (
                        <>
                            <p className="text-gray-400 line-through text-xl">
                                {originalPrice.toLocaleString()}<span className="text-base align-top">đ</span>
                            </p>

                            {/* Discount  */}
                            <span className="bg-red-600 text-white text-sm font-semibold px-2 py-1 rounded">
                                -{discount}%
                            </span>
                        </>
                    )}
                </div>

                {/* Color Selection */}
                <div className="mb-4">
                    <h2 className="text-lg font-semibold mb-2">Chọn màu sắc:</h2>
                    <div className="flex space-x-4">
                        {product.variations.map((variation) => (
                            <button
                                key={variation.id}
                                className={`w-10 h-10 rounded-full border-2 ${selectedColor === variation.id ? 'border-2 border-black' : 'border-2 border-gray-300'}`}
                                style={{
                                    backgroundColor: colorMap[variation.attribute_value.value] || "#FFFFFF", // Use mapped color or default to white
                                    padding: '2px',
                                }}
                                onClick={() => handleColorChange(variation.id)}
                            />
                        ))}
                    </div>
                </div>



                {/* Size Selection */}
                <div className="mb-4">
                    <h2 className="text-lg font-semibold mb-2">Chọn kích thước:</h2>
                    <div className="flex space-x-2">
                        {selectedVariation.variation_values.map((value) => (
                            <button
                                key={value.id}
                                className={`w-[65px] h-[37px] rounded-2xl border-2 text-center font-semibold ${selectedSize === value.attribute_value_id ? 'bg-black text-white border-black' : 'bg-gray-100 text-gray-500 border-gray-300'}`}
                                onClick={() => setSelectedSize(value.attribute_value_id)}
                            >
                                {value.attribute_value_id}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className=" flex ">
                    <button
                        type="submit"
                        className="bg-black text-white w-[300px] h-[56px]"
                        onClick={handleAddToCart}
                    >
                        Thêm vào giỏ
                    </button>
                    <button
                        type="submit"
                        className="bg-red-600 text-white w-[300px] h-[56px]"
                        onClick={handleBuyNow}
                    >
                        Mua ngay
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VariantPage;
