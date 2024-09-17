import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { Spin } from "antd";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Product {
    id: number;
    name: string;
    slug: string;
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
    stock: number;
}

interface VariationImage {
    id: number;
    image_path: string;
    image_type: string;
}

const ProductPage: React.FC = () => {
    const navigate = useNavigate();

    const { data, isLoading, error } = useQuery<{ data: Product }>({
        queryKey: ["product"],
        queryFn: () => axios.get('http://localhost:3000/data'),
    });

    if (isLoading) return <Spin size="large" />;
    if (error) return <div>Có lỗi xảy ra: {(error as Error).message}</div>;

    const handleProductClick = (productId: number) => {
        navigate(`/variant/${productId}`);
    };

    const product = data?.data;

    if (!product) return null;

    const productDisplay = {
        id: product.id,
        name: product.name,
        price: Math.min(...product.variations.flatMap(v =>
            v.variation_values.map(vv => parseFloat(vv.price))
        )),
        thumbnail: product.variations[0]?.variation_images.find(img => img.image_type === 'thumbnail')?.image_path || '/default-thumbnail.jpg'
    };

    return (
        <div className="p-6">
            <div
                key={productDisplay.id}
                className="relative bg-white p-4 rounded-lg shadow-lg text-center cursor-pointer w-[280px] h-[380px]"
                onClick={() => handleProductClick(productDisplay.id)}
            >

                <div className="absolute top-0 right-0 p-2">
                    <button className="bg-gray-200 rounded-full p-2">
                        <img src="https://file.hstatic.net/200000642007/file/shopping-cart_3475f727ea204ccfa8fa7c70637d1d06.svg" alt="Giỏ hàng" />
                    </button>
                </div>

                <img
                    src={productDisplay.thumbnail}
                    alt={productDisplay.name}
                    className="w-full h-[250px] object-cover mb-4"
                />

                <h3 className="text-lg font-semibold">{productDisplay.name}</h3>

                <p className="text-gray-700">{productDisplay.price.toLocaleString()} VND</p>

            </div>
        </div>
    );
};

export default ProductPage;
