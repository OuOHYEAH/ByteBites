import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { GET_MENU_ITEM_BY_ID } from "../graphql/Menuqueries";
import { GET_INVENTORY } from "../graphql/Kitchenqueries";
import { ADD_CART_ITEM } from "../graphql/Orderqueries";
import Navbar from "../components/NavBar";
import placeholder from "../assets/placeholder.jpg";

const MenuItem: React.FC = () => {
    const { menuId, userId } = useParams();
    const navigate = useNavigate();

    const [customError, setCustomError] = useState<string | null>(null);


    const { data: inventoryData, loading: inventoryLoading, error: inventoryError } = useQuery(GET_INVENTORY, {
        variables: { menuId: menuId }
    });
    
    const { data: menuData, loading: menuLoading, error: menuError } = useQuery(GET_MENU_ITEM_BY_ID, {
        variables: { id: menuId },
        skip: !menuId,
    });

    const [addCartItem, { data: addedItemData, loading: addItemLoading, error: addItemError }] =
    useMutation(ADD_CART_ITEM);

    const [orderData, setOrderData] = useState({
        quantity: 1,
        price: menuData?.getMenuItemById.price || 0,
        customizations: "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
      
        setOrderData((prev) => {
          if (name === "quantity") {
            const inputQuantity = parseInt(value, 10);
            inventory?.availableServings ?? 1
            const safeQuantity = Math.min(Math.max(inputQuantity, 1), maxQuantity);
            return {
              ...prev,
              quantity: safeQuantity,
            };
          }
      
          return {
            ...prev,
            [name]: value,
          };
        });
      };

    if (menuLoading) return <p>Loading menu item...</p>;
    if (menuError) return <p>Error fetching menu item: {menuError.message}</p>;

    
    {addItemLoading && <p>Adding to cart...</p>}
    {addItemError && <p className="text-red-500">Error: {addItemError.message}</p>}
    {addedItemData && (
        <p className="text-green-600">Item added to cart: {addedItemData.addCartItem.id}</p>
    )}

    if (!menuData || !menuData.getMenuItemById) {
    return <p>No data found.</p>;
}

    const item = menuData.getMenuItemById;
    const inventory = inventoryData?.inventory;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
    
        if (!userId || !menuId) {
            console.error("Missing userId or menuId from URL params.");
            return;
        }
    
        try {
            const result = await addCartItem({
                variables: {
                    input: {
                        user_id: userId,
                        menu_item_id: menuId,
                        quantity: orderData.quantity,
                        price: menuData?.getMenuItemById.discounted_price || 0,
                        customizations: orderData.customizations
                    },
                },
            });
    
            console.log("Added to cart:", result.data.addCartItem);
            navigate("/dashboard");
        } catch (error: any) {
            console.error("Error adding cart item:", error);
        
            const message = (error?.message as string) || "";
            if (message.includes("duplicate key value") && message.includes("unique_cart_menu_item")) {
                setCustomError("You already have this item in your cart.");
            } else {
                setCustomError("An unexpected error occurred. Please try again.");
            }
        }        
    };

    return (
        <>
            <Navbar />
            <div className="p-8 max-w-4xl mx-auto bg-white rounded-xl shadow-[0_4px_10px_0_rgba(0,0,0,0.5)] space-y-6 mt-10">
            <img
                src={item?.image_url || placeholder}
                alt={item.name}
                className="w-full rounded-xl object-cover h-64"
            />

            {/* Grid split here */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* LEFT side */}
                <div className="space-y-2">
                    <h2 className="text-gray-900 text-2xl font-bold">{item.name}</h2>
                    <p className="text-gray-600">{item.description}</p>
                    <p className="text-sm text-gray-500">Category: {item.category}</p>
                    <p className="text-sm text-gray-500">
                        Status:{" "}
                        <span
                            className={
                                item.availability_status
                                    ? "text-green-600 font-semibold"
                                    : "text-red-600 font-semibold"
                            }
                        >
                            {item.availability_status ? "Available" : "Out of stock"}
                        </span>
                    </p>
                </div>

                {/* RIGHT side */}
                <div className="flex flex-col justify-between items-end text-right space-y-2">
                    <div className="flex items-center space-x-4 justify-end">
                        {item.discount > 0 ? (
                            <>
                                <p className="text-lg text-gray-500 line-through">₱{item.price?.toFixed(2) ?? "0.00"}</p>
                                <p className="text-2xl font-bold text-green-700">₱{item.discounted_price?.toFixed(2) ?? "0.00"}</p>
                            </>
                        ) : (
                            <p className="text-2xl font-bold text-green-700">₱{item.price?.toFixed(2) ?? "0.00"}</p>
                        )}
                    </div>
                    <p className="text-xl font-semibold text-yellow-400 whitespace-nowrap">
                        {item?.discount ? `${item.discount.toFixed(2)}% OFF` : "No Discount"}
                    </p>
                    <p className="text-sm text-gray-500">
                        Stock Left:{" "}
                        <span
                            className={`${
                                (inventory?.availableServings ?? 0) <= (inventory?.lowStockThreshold ?? 0)
                                    ? "text-red-500 font-semibold"
                                    : "text-green-600 font-semibold"
                            }`}
                        >
                            {inventory?.availableServings ?? "N/A"}
                        </span>
                    </p>
                </div>
            </div>

                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label
                            htmlFor="quantity"
                            className="block text-sm font-semibold text-gray-600"
                        >
                            Quantity
                        </label>
                        <input
                            type="number"
                            name="quantity"
                            id="quantity"
                            value={orderData.quantity}
                            onChange={handleInputChange}
                            min="1"
                            max={inventory?.availableServings ?? 1}
                            className="w-full p-3 border rounded-lg text-black"
                            required
                            />
                            {(inventory?.availableServings ?? 0) > 0 && orderData.quantity > (inventory?.availableServings ?? 0) && (
    <p className="text-red-500 text-sm">Max stock available is {inventory?.availableServings ?? "N/A"}</p>
)}
                    </div>

                    <div>
                        <label htmlFor="customizations" className="block text-sm font-semibold text-gray-600">
                            Customizations (optional)
                        </label>
                        <input
                            type="text"
                            name="customizations"
                            id="customizations"
                            value={orderData.customizations}
                            onChange={handleInputChange}
                            className="w-full p-3 border rounded-lg text-black"
                            placeholder="e.g., No onions, extra cheese"
                        />
                    </div>
                    {customError && <p className="text-red-500 text-md">{customError}</p>}

                    <div className="flex gap-4">
                    <button
                        type="submit"
                        className={`px-6 py-3 rounded-lg text-white transition ${
                            item.availability_status
                                ? "bg-blue-600 hover:bg-blue-700"
                                : "bg-gray-400 cursor-not-allowed"
                        }`}
                        disabled={!item.availability_status || (inventory?.availableServings ?? 0) < 0}
                    >
                        Submit Order
                    </button>
                        <button
                            type="button"
                            onClick={() => navigate("/dashboard")}
                            className="px-6 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
                        >
                            Cancel
                        </button>
                        {(!item.availability_status || (inventory?.availableServings ?? 0) < 0) && (
                            <p className="text-red-500 text-md">Item is currently unavailable and out of stock</p>
                        )}
                    </div>
                </form>
            </div>
        </>
    );
};

export default MenuItem;
