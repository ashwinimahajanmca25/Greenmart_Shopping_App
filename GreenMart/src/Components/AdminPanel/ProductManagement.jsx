import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { CiSaveDown1 } from "react-icons/ci";


import {
  Search,
  Edit,
  Trash2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
} from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import { MdOutlineCancel } from "react-icons/md";
const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "", // ✅ Ensure description is initialized
    category: "Plant",
    subcategory: "commonPlants",
    price: "",
    image: null,
    stock: 0,
  });

  const productsPerPage = 3;

  const categories = ["plant", "soil", "tool"];
  const subcategories = [
    "commonPlants",
    "soil",
    "seeds",
    "agricultureTools",
    "roses",
    "pots",
    "organicPlants",
    "gardeningTools",
    "N/A",
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:3002/api/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
    setIsLoading(false);
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33", // Red color for the confirm button
      cancelButtonColor: "green", // Blue for cancel button
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:3002/api/products/${id}`);
          setProducts(products.filter((product) => product.idproducts !== id));

          Swal.fire({
            text: "Your product has been Deleted!",
            icon: "success",
            showConfirmButton: false,
          });
        } catch (error) {
          console.error("Error deleting product:", error);
          Swal.fire({
            title: "Error!",
            text: "Failed to delete the product. Please try again.",
            icon: "error",
            confirmButtonColor: "#d33",
          });
        }
      }
    });
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
    setCurrentPage(1); // Reset to first page on search
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      // Toggle sorting order
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new column and default to ascending order
      setSortColumn(column);
      setSortOrder("asc");
    }
  };
  const handleImageChange = (event) => {
    setNewProduct({ ...newProduct, image: event.target.files[0] });
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.image) {
      alert("Please fill all fields and upload an image.");
      return;
    }

    const formData = new FormData();
    formData.append("name", newProduct.name);
    formData.append("description", newProduct.description);
    formData.append("category", newProduct.category);

    // ✅ Convert "N/A" to empty string (backend will store it as NULL)
    formData.append(
      "subcategory",
      newProduct.subcategory === "N/A" ? "" : newProduct.subcategory
    );

    formData.append("price", newProduct.price);
    formData.append("image", newProduct.image);
    formData.append("stock", newProduct.stock);

    try {
      await axios.post("http://localhost:3002/api/addproduct", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Product added successfully!");
      setIsPopupOpen(false);
      fetchProducts();
    } catch (error) {
      console.error("Error adding product:", error);

      if (error.response && error.response.data.message) {
        alert(error.response.data.message); // Show error from backend
      } else {
        alert("Failed to add product. Please try again.");
      }
    }
  };

  // **Filtering Products**
  const filteredProducts = products
    .filter((product) => product.name.toLowerCase().includes(searchTerm))
    .filter((product) =>
      selectedCategory ? product.category === selectedCategory : true
    )
    .filter((product) =>
      selectedSubcategory ? product.subcategory === selectedSubcategory : true
    );

  // **Sorting Products**
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortColumn) return 0;
    const valueA = a[sortColumn]?.toString().toLowerCase();
    const valueB = b[sortColumn]?.toString().toLowerCase();
    if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
    if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // **Pagination**
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );
  const handleEdit = (idproducts) => {
    const selectedProduct = products.find(
      (product) => product.idproducts === idproducts
    );
    if (!selectedProduct) {
      alert("❌ Product not found in local data!");
      return;
    }

    // ✅ Store existing image separately
    setEditProduct({
      ...selectedProduct,
      existingImage: selectedProduct.image_name,
    });
    setIsEditPopupOpen(true);
  };

const handleUpdateProduct = async () => {
  if (!editProduct || !editProduct.idproducts) {
    Swal.fire({
      icon: "error",
      title: "Invalid Product ID",
      text: "Please try again.",
    });
    return;
  }

  const formData = new FormData();
  formData.append("name", editProduct.name);
  formData.append("category", editProduct.category);
  formData.append("subcategory", editProduct.subcategory === "N/A" ? "" : editProduct.subcategory);
  formData.append("price", editProduct.base_price);
  formData.append("stock", editProduct.stock);

  if (editProduct.image instanceof File) {
    formData.append("image", editProduct.image); // If new image is uploaded, use it
  } else {
    formData.append("existingImage", editProduct.existingImage); // Keep existing image
  }

  console.log("🔹 Updating product:", editProduct.idproducts);
  console.log("🔹 FormData:", Object.fromEntries(formData));

  try {
    const response = await axios.put(
      `http://localhost:3002/api/products/${editProduct.idproducts}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    console.log("✅ API Response:", response.data);

    if (response.status === 200) {
      Swal.fire({
        icon: "success",
        title: "Product Updated!",
        text: "The product has been updated successfully.",
        showConfirmButton:false
      });

      setIsEditPopupOpen(false);
      fetchProducts(); // Refresh product list
    }
  } catch (error) {
    console.error("❌ Error updating product:", error);

    if (error.response) {
      console.error("❌ Response Data:", error.response.data);
      console.error("❌ Status Code:", error.response.status);
    }

    Swal.fire({
      icon: "error",
      title: "Update Failed",
      text: "Failed to update product. Please check if the product ID is correct.",
    });
  }
};

  return (
    <div className="flex ">
      <AdminSidebar />
      <div className="p-3 mt-28 w-full">
        <h1 className="text-2xl font-bold mb-6">Product Management</h1>

        {/* 🔹 Filters & Search */}
        <div className="flex flex-wrap justify-between mb-6 gap-3 ">
          <div className="relative w-72 shadow-xl">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearch}
              className="rounded-lg pl-10 pr-3 py-2 w-full bg-gray-100 focus:outline-none"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
          </div>
          <div>
            <button
              onClick={() => setIsPopupOpen(true)}
              className="bg-green-800 text-white px-4 py-2 rounded-lg flex items-center ml-2 "
            >
              <PlusCircle className="w-5 h-5 mr-2" /> Add Product
            </button>
          </div>

          {isPopupOpen && (
            <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
              <div className="bg-white relative mt-24 p-6 rounded-lg shadow-lg w-1/3">
                <h2 className="text-xl font-semibold mb-4">Add Product</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Product Name"
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
                    }
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                  />
                  <select
                    value={newProduct.category}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, category: e.target.value })
                    }
                    className=" border border-gray-300  rounded-lg px-3 py-2 w-full"
                  >
                    {categories.map((category, index) => (
                      <option key={index} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <select
                    value={newProduct.subcategory || ""}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        subcategory: e.target.value,
                      })
                    }
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                  >
                    {subcategories.map((subcategory) => (
                      <option key={subcategory} value={subcategory}>
                        {subcategory}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Product Description"
                    value={newProduct.description}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        description: e.target.value,
                      })
                    }
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, price: e.target.value })
                    }
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                  />
                  <input
                    type="number"
                    placeholder="Stock Quantity"
                    value={newProduct.stock}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        stock: parseInt(e.target.value),
                      })
                    }
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                  />

                  <input
                    type="file"
                    onChange={handleImageChange}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                  />
                  <div className="flex space-x-3 absolute top-2 right-4">
                    {/* Save Button with Tooltip */}
                    <div className="relative group inline-flex items-center">
                      <button
                        onClick={handleAddProduct}
                        className="flex items-center"
                      >
                        <CiSaveDown1 className="font-bold text-green-800 w-5 h-5" />
                      </button>
                      <span className="absolute top-7 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-500 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition">
                        Save
                      </span>
                    </div>

                    {/* Cancel Button with Tooltip */}
                    <div className="relative group inline-flex items-center">
                      <button onClick={() => setIsPopupOpen(false)}>
                        <MdOutlineCancel className="text-red-600 font-bold w-5 h-5" />
                      </button>
                      <span className="absolute top-7 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-500 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition">
                        Cancel
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 shadow-xl"
          >
            <option value="">All Categories</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={selectedSubcategory}
            onChange={(e) => setSelectedSubcategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 shadow-xl"
          >
            <option value="">All Subcategories</option>
            {subcategories.map((subcategory, index) => (
              <option key={index} value={subcategory}>
                {subcategory}
              </option>
            ))}
          </select>
        </div>

        {/* 🔹 Product Table */}
        {isLoading ? (
          <p className="text-center text-gray-500">Loading products...</p>
        ) : (
          <div className="overflow-x-auto bg-white shadow-md rounded-lg ">
            <table className="w-full text-left">
            <thead className="bg-green-800 text-white">
                <tr>
                  {[
                    { key: "idproducts", label: "ID" },
                    { key: "name", label: "Name" },
                    { key: "base_price", label: "Price" },
                    { key: "category", label: "Category" },
                    { key: "subcategory", label: "Subcategory" },

                    { key: "stock", label: "Stock" },
                    { key: "image", label: "Image", sortable: false },
                    { key: "actions", label: "Actions", sortable: false },
                  ].map(({ key, label, sortable = true }) => (
                    <th
                      key={key}
                      className="p-3 cursor-pointer"
                      onClick={() => sortable && handleSort(key)}
                    >
                      {label}{" "}
                      {sortColumn === key
                        ? sortOrder === "asc"
                          ? "▲"
                          : "▼"
                        : ""}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.length > 0 ? (
                  paginatedProducts.map((product) => (
                    <tr
                      key={product.idproducts}
                      className=" hover:bg-green-50"
                    >
                      <td className="p-3">{product.idproducts}</td>
                      <td className="p-3">{product.name}</td>
                      <td className="p-3">₹{product.base_price}</td>
                      <td className="p-3">{product.category}</td>
                      <td className="p-3">{product.subcategory || "N/A"}</td>

                      <td className="p-3">{product.stock}</td>
                      <td className="p-3">
                        {product.image_name && (
                          <img
                            src={`http://localhost:3002/ProductImg/${product.image_name}`}
                            alt="Product"
                            className="w-20 h-20 object-cover"
                          />
                        )}
                      </td>
                      <td className="p-3 flex space-x-2">
                        <button
                          onClick={() => handleEdit(product.idproducts)}
                          className="text-blue-600"
                        >
                          <Edit className="w-5 h-5" />
                        </button>

                        <button
                          onClick={() => handleDelete(product.idproducts)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="p-3 text-center text-gray-500">
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {/* 🔹 Edit Product Popup */}
        {isEditPopupOpen && editProduct && (
          <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 md:pt-24">
            <div className="bg-white p-6 rounded-lg shadow-lg w-1/3 relative">
              <div className="flex justify-end gap-x-4 absolute top-3 right-4">
                {/* Save Button */}
                <button onClick={handleUpdateProduct} className="group">
                  <CiSaveDown1 className="font-bold text-green-800 w-6 h-6" />
                  <span className="absolute top-7 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-500 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition">
                    Save
                  </span>
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setIsEditPopupOpen(false)}
                  className="group"
                >
                  <MdOutlineCancel className="text-red-600 font-bold w-6 h-6" />
                  <span className="absolute top-7 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-500 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition">
                    Close
                  </span>
                </button>
              </div>

              <h2 className="text-xl font-semibold mb-4">Edit Product</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  value={editProduct.name || ""}
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, name: e.target.value })
                  }
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                />
                <select
                  value={editProduct.category || ""}
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, category: e.target.value })
                  }
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <select
                  value={editProduct.subcategory || ""}
                  onChange={(e) =>
                    setEditProduct({
                      ...editProduct,
                      subcategory: e.target.value,
                    })
                  }
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                >
                  {subcategories.map((subcategory) => (
                    <option key={subcategory} value={subcategory}>
                      {subcategory}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={editProduct.base_price || ""}
                  onChange={(e) =>
                    setEditProduct({
                      ...editProduct,
                      base_price: e.target.value,
                    })
                  }
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                />
                <input
                  type="number"
                  value={editProduct.stock || ""}
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, stock: e.target.value })
                  }
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                />
                {editProduct.existingImage && (
                  <img
                    src={`http://localhost:3002/ProductImg/${editProduct.existingImage}`}
                    alt="Current Product"
                    className="w-20 h-20 object-cover"
                  />
                )}

                <input
                  type="file"
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, image: e.target.files[0] })
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-center mt-4 space-x-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="px-3 py-1 bg-green-200 rounded-lg disabled:opacity-50"
          >
            <ChevronLeft />
          </button>
          <span className="px-4 py-1 bg-green-800 text-white rounded-lg">
            {currentPage}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-3 py-1 bg-green-200 rounded-lg disabled:opacity-50"
          >
            <ChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;
