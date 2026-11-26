import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
    GET_MENU_ITEM_BY_ID,
    DELETE_MENU_ITEM,
    UPDATE_MENU_ITEM,
} from "../graphql/Menuqueries";
import { useNavigate, useParams } from "react-router-dom";
import { GET_INVENTORY, DELETE_INVENTORY } from "../graphql/Kitchenqueries";
import Navbar from "../components/NavBar";
import { supabase } from "../utils/supabaseClient";

const DEFAULT_IMAGE =
    "https://hzjjmfwrtvqjwxunfcue.supabase.co/storage/v1/object/public/pictures/menupic/placeholder.jpg";


const MenuItem: React.FC = () => {
    const { menuId } = useParams();
    const navigate = useNavigate();
    const [fileUploading, setFileUploading] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        discount: "",
        category: "",
        availability_status: true,
        image_url: DEFAULT_IMAGE,
    });

    const [updateMenuItem] = useMutation(UPDATE_MENU_ITEM);
    const [deleteMenuItem] = useMutation(DELETE_MENU_ITEM);

    // Fetch menu item
    const {
        data: menuData,
        loading: menuLoading,
        error: menuError,
    } = useQuery(GET_MENU_ITEM_BY_ID, {
        variables: { id: menuId },
        skip: !menuId,
        onCompleted: (data) => {
            const item = data.getMenuItemById;
            if (!item) return;

            setFormData({
                name: item.name || "",
                description: item.description || "",
                price: item.price?.toString() || "0",
                category: item.category || "",
                discount: item.discount?.toString() || "0",
                availability_status: item.availability_status,
                image_url: item.image_url || DEFAULT_IMAGE,
            });
        },
    });

    // Fetch inventory
    const { data: inventoryData, loading: inventoryLoading } = useQuery(GET_INVENTORY, {
        variables: { menuId },
        skip: !menuId,
    });

    const [deleteInventory, { loading: deleting, error }] = useMutation(DELETE_INVENTORY, {
        refetchQueries: ['GetInventory'], // or whatever your query is
        onCompleted: () => {
          console.log("Item deleted!");
        }
    });

    if (menuLoading) return <p>Loading...</p>;
    if (menuError) return <p>Error loading menu item: {menuError.message}</p>;
    if (!menuData?.getMenuItemById) return <p>No data found.</p>;
    if (deleting) return <p>Deleting...</p>;

    const handleFormChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
    
        const oldImageUrl = item.image_url;
        let oldImagePath: string | null = null;

        setFileUploading(true);
    
        if (oldImageUrl) {
            try {
                const url = new URL(oldImageUrl);
                const pathname = url.pathname;
                const match = pathname.match(/\/storage\/v1\/object\/public\/pictures\/(menupic\/.+)/);
    
                if (match) {
                    oldImagePath = match[1];
                }
            } catch (err) {
                console.warn('Failed to parse oldImageUrl:', err);
            }
        }
    
        const fileExt = file.name.split('.').pop();
        const fileName = `menu-${menuId}-${Date.now()}.${fileExt}`;
        const filePath = `menupic/${fileName}`;
    
        if (oldImagePath && oldImagePath !== 'menupic/placeholder.jpg') {
            const { error: deleteError } = await supabase
                .storage
                .from('pictures')
                .remove([oldImagePath]);
    
            if (deleteError) {
                console.error('Error deleting old menu image:', deleteError.message);
            } else {
                console.log('Old menu image deleted.');
            }
        }
    
        const { error: uploadError } = await supabase
            .storage
            .from('pictures')
            .upload(filePath, file);
    
        if (uploadError) {
            console.error('Error uploading new menu image:', uploadError.message);
            return;
        }
    
        const { data: publicUrlData } = supabase
            .storage
            .from('pictures')
            .getPublicUrl(filePath);
    
        const publicUrl = publicUrlData.publicUrl;
    
        setFormData((prev) => ({
            ...prev,
            image_url: publicUrl,
        }));

        setFileUploading(false);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        const errors: { [key: string]: string } = {};
        if (!formData.name) errors.name = "Name is required.";
        if (!formData.description) errors.description = "Description is required.";
        if (!formData.price) errors.price = "Price is required.";
        else if (parseFloat(formData.price) < 0) errors.price = "Price cannot be negative.";
        if (!formData.category) errors.category = "Category is required.";
        if (!formData.availability_status) errors.availability_status = "Availability is required.";

        if (Object.keys(errors).length > 0) {
            alert(Object.values(errors).join("\n"));
            return;
        }

        try {
            await updateMenuItem({
                variables: {
                    id: menuId,
                    input: {
                        name: formData.name,
                        description: formData.description,
                        price: parseFloat(formData.price),
                        discount: parseFloat(formData.discount) || 0,
                        category: formData.category,
                        availability_status: true,
                        image_url: formData.image_url,
                    },
                },
            });

            setIsUpdateModalOpen(false);
            window.location.reload(); // Consider replacing with a `navigate()` for better UX
        } catch (err) {
            alert("Failed to update menu item.");
        }
    };

    const item = menuData.getMenuItemById;
    const inventory = inventoryData?.inventory;

    return (
        <>
          <Navbar />
          <div className="p-8 max-w-4xl mx-auto bg-white rounded-xl shadow-[0_4px_10px_0_rgba(0,0,0,0.5)] space-y-6 mt-10">
            {/* Back Button */}
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center text-white focus:outline-none focus:ring-2 focus:ring-blue-500 px-4 py-2 rounded-md text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
      
            {/* Full-width Image */}
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full rounded-xl object-cover h-72 shadow-md"
            />
      
            {/* Info Section */}
            <div className="grid md:grid-cols-2 gap-8 mt-6">
              <div className="space-y-3">
                <h2 className="text-gray-900 text-3xl font-semibold">{item.name}</h2>
                <p className="text-gray-700 text-lg">{item.description}</p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Category:</span> {item.category}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Status:</span>{" "}
                  <span className={item.availability_status ? "text-green-600" : "text-red-600"}>
                    {item.availability_status ? "Available" : "Out of stock"}
                  </span>
                </p>
              </div>
      
              <div className="space-y-3 text-right">
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
                <p className="text-gray-900 text-lg font-semibold">
                    {item?.discount ? `${item.discount.toFixed(2)}% OFF` : "No Discount"}
                </p>
               <p className="text-sm text-gray-600">
  Quantity Available:{" "}
  <span className={(inventory?.availableServings ?? 0) <= (inventory?.lowStockThreshold ?? 0) ? "text-red-500" : "text-green-600"}>
    {inventory?.availableServings ?? "N/A"}
  </span>
</p>
<p className="text-sm text-gray-600">
  Low Stock Threshold: <span className="text-yellow-500">{inventory?.lowStockThreshold ?? "N/A"}</span>
</p>
              </div>
            </div>
      
            {/* Action Buttons */}
            <div className="flex justify-center gap-4 pt-6">
              <button
                onClick={() => setIsUpdateModalOpen(true)}
                className="bg-black text-yellow-500 px-4 py-2 rounded hover:bg-gray-800"
              >
                Update
              </button>
              <button
                             onClick={async () => {
                try {
                  const confirmDelete = confirm("Are you sure you want to delete this menu item and its inventory?");
                  if (!confirmDelete) return;

                  // 1. Delete the menu item FIRST
                  const res1 = await deleteMenuItem({ variables: { id: menuId } });

                  // 2. Only try to delete inventory if the inventory ID actually exists
                  if (inventory?.id) {
                    await deleteInventory({ variables: { id: inventory.id } });
                  }

                  if (res1.data?.deleteMenuItem) {
                    let oldImagePath: string | null = null;
                    if (item?.image_url) {
                      try {
                        const url = new URL(item.image_url);
                        const pathname = url.pathname;
                        const match = pathname.match(/\/storage\/v1\/object\/public\/pictures\/(.+)/);
                        if (match) {
                          oldImagePath = match[1];
                        }
                      } catch (err) {
                        console.warn('Failed to parse image URL:', err);
                      }
                    }

                    if (oldImagePath && oldImagePath !== 'menupic/placeholder.jpg') {
                      const { error: deleteError } = await supabase
                        .storage
                        .from('pictures')
                        .remove([oldImagePath]);
                      if (deleteError) {
                        console.error('Error deleting image from storage:', deleteError.message);
                      }
                    }

                    alert("Menu item deleted successfully.");
                    navigate("/dashboard");
                  } else {
                    alert("Failed to delete menu item.");
                  }
                } catch (error) {
                  console.error("Error deleting menu item:", error);
                  alert("An error occurred while deleting the menu item.");
                }
              }}
                className="bg-black text-red-500 px-4 py-2 rounded hover:bg-gray-800"
                >
                Delete
                </button>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">Failed to delete: {error.message}</p>}
      
            {/* Update Modal */}
            {isUpdateModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-xl w-[500px] max-w-full shadow-md text-black">
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <h2 className="text-xl font-bold">Update Menu Item</h2>

                        <div className="flex flex-col space-y-1">
                        <label htmlFor="name" className="font-medium">Name</label>
                        <input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleFormChange}
                            className="input text-black mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="e.g. Spaghetti"
                            required
                        />
                        </div>

                        <div className="flex flex-col space-y-1">
                        <label htmlFor="description" className="font-medium">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleFormChange}
                            className="input text-black mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="Enter description..."
                        />
                        </div>

                        <div className="flex flex-col space-y-1">
                        <label htmlFor="price" className="font-medium">Price (₱)</label>
                        <input
                            id="price"
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleFormChange}
                            className="input text-black mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                            step="0.01"
                            placeholder="e.g. 9.99"
                            required
                        />
                        </div>

                        <div className="flex flex-col space-y-1">
                        <label htmlFor="category" className="font-medium">Category</label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleFormChange}
                            className="input text-black mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                            <option value="">Select a category</option>
                            <option value="Appetizer">Appetizer</option>
                            <option value="Main Course">Main Course</option>
                            <option value="Dessert">Dessert</option>
                            <option value="Beverage">Beverage</option>
                            <option value="Soup">Soup</option>
                            <option value="Salad">Salad</option>
                            <option value="Sides">Sides</option>
                            <option value="Vegan">Vegan</option>
                            <option value="Kids Meal">Kids Menu</option>
                        </select>
                        </div>

                        <div className="flex flex-col space-y-1">
                        <label htmlFor="discount" className="font-medium">Discount (%)</label>
                        <input
                            id="discount"
                            type="number"
                            name="discount"
                            value={formData.discount}
                            onChange={handleFormChange}
                            className="input text-black mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                            step="0.01"
                            placeholder="e.g. 10"
                            required
                        />
                        </div>

                        <div className="flex flex-col space-y-1">
                        <label htmlFor="image_file" className="font-medium">Upload Image</label>
                        <input
                            id="image_file"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="input text-black mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                        </div>

                        <div className="flex items-center space-x-2">
                        <input
                            id="availability_status"
                            type="checkbox"
                            name="availability_status"
                            checked={formData.availability_status}
                            onChange={handleFormChange}
                        />
                        <label htmlFor="availability_status" className="text-black">Available?</label>
                        </div>

                        <div className="flex space-x-2">
                        <button
                            type="button"
                            onClick={() => setIsUpdateModalOpen(false)}
                            className="btn w-1/2 bg-red-600 text-white rounded-md py-2"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn w-1/2 bg-green-600 text-white rounded-md py-2"
                        >
                            {fileUploading ? "Loading..." : "Save Changes"}
                        </button>
                        </div>
                    </form>
                    </div>
                </div>
                )}
          </div>
        </>
      );
  };
  
  export default MenuItem; 
