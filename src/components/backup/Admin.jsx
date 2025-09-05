import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc, deleteDoc, onSnapshot, query, orderBy, increment } from 'firebase/firestore';

const Admin = ({ db, isAuthReady, products, uploadImage }) => {
    const [page, setAdminPage] = useState('products');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [image, setImage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    // State for discount codes
    const [discountCode, setDiscountCode] = useState('');
    const [discountAmount, setDiscountAmount] = useState('');
    const [discounts, setDiscounts] = useState([]);
    const [loadingDiscounts, setLoadingDiscounts] = useState(false);
    // NEW: State for custom confirmation modal and notification
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [notification, setNotification] = useState(null);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification(null);
        }, 3000);
    };

    const openConfirmModal = (id, type) => {
        setShowConfirmModal(true);
        setItemToDelete({ id, type });
    };

    const closeConfirmModal = () => {
        setShowConfirmModal(false);
        setItemToDelete(null);
    };

    const confirmDeletion = async () => {
        setIsSubmitting(true);
        try {
            if (itemToDelete.type === 'product') {
                await deleteDoc(doc(db, 'products', itemToDelete.id));
                showNotification("Product deleted successfully!");
            } else if (itemToDelete.type === 'review') {
                await deleteDoc(doc(db, 'reviews', itemToDelete.id));
                showNotification("Review deleted successfully!");
            } else if (itemToDelete.type === 'discount') {
                await deleteDoc(doc(db, 'discounts', itemToDelete.id));
                showNotification("Discount code deleted successfully!");
            }
        } catch (err) {
            console.error("Error deleting item:", err);
            showNotification("Failed to delete item.", 'error');
        } finally {
            setIsSubmitting(false);
            closeConfirmModal();
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        if (!name || !description || !price || !stock || !image) {
            setError("All fields are required.");
            setIsSubmitting(false);
            return;
        }
        try {
            const imageUrl = await uploadImage(image);
            const productsCollectionRef = collection(db, 'products');
            await addDoc(productsCollectionRef, {
                name,
                description,
                price: parseFloat(price),
                stock: parseInt(stock, 10),
                image: imageUrl
            });
            setName('');
            setDescription('');
            setPrice('');
            setStock('');
            setImage(null);
            showNotification("Product added successfully!");
        } catch (err) {
            console.error("Error adding product:", err);
            setError("Failed to add product. Try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setName(product.name);
        setDescription(product.description);
        setPrice(product.price);
        setStock(product.stock);
        setAdminPage('edit-product');
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        if (!name || !description || !price || !stock) {
            setError("All fields are required.");
            setIsSubmitting(false);
            return;
        }
        try {
            let imageUrl = editingProduct.image;
            if (image) {
                imageUrl = await uploadImage(image);
            }
            const productRef = doc(db, 'products', editingProduct.id);
            await updateDoc(productRef, {
                name,
                description,
                price: parseFloat(price),
                stock: parseInt(stock, 10),
                image: imageUrl
            });
            setEditingProduct(null);
            setName('');
            setDescription('');
            setPrice('');
            setStock('');
            setImage(null);
            setAdminPage('products');
            showNotification("Product updated successfully!");
        } catch (err) {
            console.error("Error updating product:", err);
            setError("Failed to update product. Try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteProduct = (id) => {
        openConfirmModal(id, 'product');
    };

    const handleDeleteReview = (id) => {
        openConfirmModal(id, 'review');
    };

    const handleAddDiscount = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        if (!discountCode || !discountAmount) {
            setError("Both code and amount are required.");
            setIsSubmitting(false);
            return;
        }
        try {
            const discountsCollectionRef = collection(db, 'discounts');
            await addDoc(discountsCollectionRef, {
                code: discountCode.toUpperCase(),
                amount: parseFloat(discountAmount),
                createdAt: new Date().toISOString()
            });
            setDiscountCode('');
            setDiscountAmount('');
            showNotification("Discount code added successfully!");
        } catch (err) {
            console.error("Error adding discount code:", err);
            setError("Failed to add discount code. Try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteDiscount = (id) => {
        openConfirmModal(id, 'discount');
    };

    useEffect(() => {
        if (page === 'orders' && isAuthReady) {
            setLoadingOrders(true);
            const ordersCollectionRef = collection(db, `artifacts/${typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'}/users`);
            const q = query(ordersCollectionRef);
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const fetchedOrders = [];
                querySnapshot.forEach(userDoc => {
                    const userOrdersCollectionRef = collection(db, userDoc.ref.path + '/orders');
                    onSnapshot(userOrdersCollectionRef, (ordersSnapshot) => {
                        ordersSnapshot.forEach(orderDoc => {
                            fetchedOrders.push({
                                id: orderDoc.id,
                                ...orderDoc.data(),
                                userId: userDoc.id
                            });
                        });
                        fetchedOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
                        setOrders(fetchedOrders);
                        setLoadingOrders(false);
                    });
                });
            }, (error) => {
                console.error("Error fetching orders:", error);
                setLoadingOrders(false);
            });
            return () => unsubscribe();
        }
    }, [page, db, isAuthReady]);

    // Effect to fetch reviews
    useEffect(() => {
        if (page === 'reviews' && isAuthReady) {
            setLoadingReviews(true);
            const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const fetchedReviews = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setReviews(fetchedReviews);
                setLoadingReviews(false);
            }, (error) => {
                console.error("Error fetching reviews:", error);
                setLoadingReviews(false);
            });
            return () => unsubscribe();
        }
    }, [page, db, isAuthReady]);

    // Effect to fetch discount codes
    useEffect(() => {
        if (page === 'discounts' && isAuthReady) {
            setLoadingDiscounts(true);
            const q = query(collection(db, 'discounts'), orderBy('createdAt', 'desc'));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const fetchedDiscounts = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setDiscounts(fetchedDiscounts);
                setLoadingDiscounts(false);
            }, (error) => {
                console.error("Error fetching discounts:", error);
                setLoadingDiscounts(false);
            });
            return () => unsubscribe();
        }
    }, [page, db, isAuthReady]);

    const renderContent = () => {
        switch (page) {
            case 'products':
                return (
                    <section className="mt-8">
                        <h2 className="text-2xl font-bold mb-4">Manage Products</h2>
                        <button onClick={() => setAdminPage('add-product')} className="mb-4 bg-red-500 text-white font-bold py-2 px-4 rounded-full hover:bg-red-600 transition duration-300">
                            Add New Product
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.length === 0 ? (
                                <p className="text-gray-400 col-span-full">No products found. The gallery is empty.</p>
                            ) : (
                                products.map(product => (
                                    <div key={product.id} className="bg-gray-800 rounded-lg p-4 shadow-lg flex flex-col items-center">
                                        <img src={product.image} alt={product.name} className="w-full h-32 object-cover rounded-lg mb-4"/>
                                        <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                                        <p className="text-gray-400 text-sm mb-2">${parseFloat(product.price).toFixed(2)}</p>
                                        <p className="text-gray-400 text-sm">Stock: {product.stock}</p>
                                        <div className="flex gap-2 mt-4">
                                            <button onClick={() => handleEditProduct(product)} className="bg-gray-600 text-white text-sm font-bold py-1 px-3 rounded-full hover:bg-gray-700 transition duration-300">Edit</button>
                                            <button onClick={() => handleDeleteProduct(product.id)} className="bg-red-500 text-white text-sm font-bold py-1 px-3 rounded-full hover:bg-red-600 transition duration-300">Delete</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                );
            case 'add-product':
            case 'edit-product':
                return (
                    <section className="mt-8">
                        <h2 className="text-2xl font-bold mb-4">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                        {error && <p className="text-red-400 text-center mb-4">{error}</p>}
                        <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-gray-400">Name</label>
                                <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600" required />
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-gray-400">Description</label>
                                <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600" rows="4" required></textarea>
                            </div>
                            <div>
                                <label htmlFor="price" className="block text-gray-400">Price</label>
                                <input type="number" id="price" value={price} onChange={e => setPrice(e.target.value)} className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600" step="0.01" required />
                            </div>
                            <div>
                                <label htmlFor="stock" className="block text-gray-400">Stock</label>
                                <input type="number" id="stock" value={stock} onChange={e => setStock(e.target.value)} className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600" required />
                            </div>
                            <div>
                                <label htmlFor="image" className="block text-gray-400">Image</label>
                                <input type="file" id="image" onChange={e => setImage(e.target.files[0])} className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600" required={!editingProduct} />
                            </div>
                            {editingProduct?.image && (
                                <div className="mt-2">
                                    <p className="text-gray-400 text-sm">Current Image:</p>
                                    <img src={editingProduct.image} alt="Current Product" className="w-32 h-32 object-cover rounded-lg mt-2"/>
                                </div>
                            )}
                            <button
                                type="submit"
                                className="w-full bg-red-500 text-white font-bold py-2 px-4 rounded-full hover:bg-red-600 transition duration-300 disabled:bg-red-800 disabled:cursor-not-allowed"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Processing...' : editingProduct ? 'Update Product' : 'Add Product'}
                            </button>
                        </form>
                        <button onClick={() => setAdminPage('products')} className="mt-4 bg-gray-600 text-white font-bold py-2 px-4 rounded-full hover:bg-gray-700 transition duration-300">
                            Cancel
                        </button>
                    </section>
                );
            case 'orders':
                return (
                    <section className="mt-8">
                        <h2 className="text-2xl font-bold mb-4">Customer Orders</h2>
                        {loadingOrders ? (
                            <p className="text-gray-400 text-center">Loading orders...</p>
                        ) : orders.length === 0 ? (
                            <p className="text-gray-400 text-center">No new orders from the abyss.</p>
                        ) : (
                            <div className="space-y-6">
                                {orders.map(order => (
                                    <div key={order.id} className="bg-gray-800 rounded-xl p-6 shadow-lg">
                                        <p className="text-sm text-gray-500">User ID: {order.userId}</p>
                                        <h3 className="text-xl font-bold mb-2 text-gray-200">Order ID: <span className="text-red-500 font-normal">{order.id}</span></h3>
                                        <p className="text-gray-400 mb-4">Date: {order.date}</p>
                                        <div className="space-y-4">
                                            {order.items.map((item, itemIndex) => (
                                                <div key={itemIndex} className="flex items-center bg-gray-700 p-4 rounded-lg">
                                                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg mr-4" />
                                                    <div className="grow">
                                                        <p className="font-semibold">{item.name}</p>
                                                        <p className="text-sm text-gray-400">Quantity: {item.quantity}</p>
                                                    </div>
                                                    <p className="font-bold text-lg text-red-500">${item.price.toFixed(2)}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-end font-bold text-xl text-red-500 border-t border-gray-600 pt-4 mt-4">
                                            <span>Total: ${order.total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                );
            case 'reviews':
                return (
                    <section className="mt-8">
                        <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
                        {loadingReviews ? (
                            <p className="text-gray-400 text-center">Loading reviews...</p>
                        ) : reviews.length === 0 ? (
                            <p className="text-gray-400 text-center">No reviews found.</p>
                        ) : (
                            <div className="space-y-6">
                                {reviews.map(review => (
                                    <div key={review.id} className="bg-gray-800 rounded-xl p-6 shadow-lg">
                                        <p className="text-sm text-gray-500">Review by: <span className="text-gray-400">{review.userName}</span></p>
                                        <p className="text-sm text-gray-500">Product ID: <span className="text-gray-400">{review.productId}</span></p>
                                        <div className="flex items-center my-2">
                                            <p className="text-lg font-bold text-white mr-2">Rating:</p>
                                            <div className="flex text-yellow-400">
                                                {[...Array(5)].map((_, index) => (
                                                    <span key={index}>{index < review.rating ? '★' : '☆'}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-gray-300 my-4">{review.review}</p>
                                        <button onClick={() => handleDeleteReview(review.id)} className="bg-red-500 text-white text-sm font-bold py-1 px-3 rounded-full hover:bg-red-600 transition duration-300">
                                            Delete Review
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                );
            case 'discounts':
                return (
                    <section className="mt-8">
                        <h2 className="text-2xl font-bold mb-4">Manage Discount Codes</h2>
                        {error && <p className="text-red-400 text-center mb-4">{error}</p>}
                        <form onSubmit={handleAddDiscount} className="space-y-4 mb-8 p-6 bg-gray-800 rounded-lg shadow-lg">
                            <h3 className="text-xl font-bold text-white">Create New Discount Code</h3>
                            <div>
                                <label htmlFor="discountCode" className="block text-gray-400">Code</label>
                                <input type="text" id="discountCode" value={discountCode} onChange={e => setDiscountCode(e.target.value)} className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 uppercase" required />
                            </div>
                            <div>
                                <label htmlFor="discountAmount" className="block text-gray-400">Discount Amount (%)</label>
                                <input type="number" id="discountAmount" value={discountAmount} onChange={e => setDiscountAmount(e.target.value)} className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600" step="0.01" required min="0" max="100" />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-red-500 text-white font-bold py-2 px-4 rounded-full hover:bg-red-600 transition duration-300 disabled:bg-red-800 disabled:cursor-not-allowed"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Adding...' : 'Add Discount Code'}
                            </button>
                        </form>
                        <h3 className="text-xl font-bold mb-4">Existing Discount Codes</h3>
                        {loadingDiscounts ? (
                            <p className="text-gray-400 text-center">Loading discount codes...</p>
                        ) : discounts.length === 0 ? (
                            <p className="text-gray-400 text-center">No discount codes found.</p>
                        ) : (
                            <div className="space-y-4">
                                {discounts.map(discount => (
                                    <div key={discount.id} className="bg-gray-800 rounded-lg p-4 flex items-center justify-between shadow-md">
                                        <div>
                                            <p className="text-lg font-semibold text-white">{discount.code}</p>
                                            <p className="text-gray-400 text-sm">{discount.amount}% Off</p>
                                        </div>
                                        <button onClick={() => handleDeleteDiscount(discount.id)} className="bg-red-500 text-white text-sm font-bold py-1 px-3 rounded-full hover:bg-red-600 transition duration-300">
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                );
            default:
                return null;
        }
    };

    return (
        <main className="container mx-auto px-6 py-12 lg:py-24">
            <h1 className="text-4xl md:text-6xl font-bold text-red-500 text-center mb-12">Admin Panel</h1>
            <div className="flex justify-center space-x-4 mb-8 flex-wrap">
                <button onClick={() => setAdminPage('products')} className={`px-4 py-2 rounded-full font-bold transition duration-300 mb-2 ${page === 'products' ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>Products</button>
                <button onClick={() => setAdminPage('orders')} className={`px-4 py-2 rounded-full font-bold transition duration-300 mb-2 ${page === 'orders' ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>Orders</button>
                <button onClick={() => setAdminPage('reviews')} className={`px-4 py-2 rounded-full font-bold transition duration-300 mb-2 ${page === 'reviews' ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>Reviews</button>
                <button onClick={() => setAdminPage('discounts')} className={`px-4 py-2 rounded-full font-bold transition duration-300 mb-2 ${page === 'discounts' ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>Discount Codes</button>
            </div>
            {renderContent()}

            {/* Custom confirmation modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4">
                    <div className="bg-gray-900 text-white p-8 rounded-lg shadow-xl max-w-sm w-full text-center">
                        <h3 className="text-2xl font-bold mb-4">Confirm Deletion</h3>
                        <p className="mb-6 text-gray-300">Are you sure you want to delete this {itemToDelete.type}?</p>
                        <div className="flex justify-around space-x-4">
                            <button
                                onClick={closeConfirmModal}
                                className="bg-gray-700 text-white font-bold py-2 px-4 rounded-full hover:bg-gray-600 transition duration-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeletion}
                                className="bg-red-500 text-white font-bold py-2 px-4 rounded-full hover:bg-red-600 transition duration-300 disabled:bg-red-800 disabled:cursor-not-allowed"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification system */}
            {notification && (
                <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg font-bold text-white transition-all duration-300 ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {notification.message}
                </div>
            )}
        </main>
    );
};

export default Admin;