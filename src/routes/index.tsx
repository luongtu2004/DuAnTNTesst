import ProductPage from "@/pages/Products/List";
import { Route, Routes } from "react-router-dom";
import VariantPage from "@/pages/Products/Variant";
import Cart from "@/pages/Cart/Cart";

const Router = () => {
    return (
        <Routes>
            <Route path="/list" element={<ProductPage />} />
            <Route path="/variant/:id" element={<VariantPage />} />
            <Route path="/cart" element={<Cart />} />
        </Routes>
    );
}

export default Router;
