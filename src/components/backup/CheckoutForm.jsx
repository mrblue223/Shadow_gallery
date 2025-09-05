import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const CheckoutForm = ({ setPage, cartItems, setCartItems, calculateTotals, user, db, isAuthReady, appliedDiscount }) => {
    const [formData, setFormData] = useState({
        name: user?.displayName || '',
        email: user?.email || '',
        address: '',
        city: '',
        zip: '',
        cardNumber: '',
        expiryDate: '',
        cvv: ''
    });
    const [showModal, setShowModal] = useState(false);
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setMessage('Processing your order...');

        if (!cartItems || cartItems.length === 0) {
            setMessage('Your cart is empty. Please add items before checking out.');
            setShowModal(true);
            return;
        }

        try {
            const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

            let ordersCollectionRef;
            let orderData;
            
            // Calculate totals with discount
            const { subtotal, discountAmount, tax, total } = calculateTotals(appliedDiscount);

            if (user) {
                // For logged-in users
                ordersCollectionRef = collection(db, `artifacts/${appId}/users/${user.uid}/orders`);
                orderData = {
                    userId: user.uid,
                    items: cartItems.map(item => ({
                        id: item.id,
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price,
                        image: item.image // Include image for order history
                    })),
                    subtotal: subtotal,
                    discount: appliedDiscount ? {
                        code: appliedDiscount.code,
                        amount: appliedDiscount.amount,
                        discountAmount: discountAmount
                    } : null,
                    tax: tax,
                    totalPrice: total,
                    shippingInfo: {
                        name: formData.name,
                        email: formData.email,
                        address: formData.address,
                        city: formData.city,
                        zip: formData.zip
                    },
                    paymentInfo: {
                        cardNumber: formData.cardNumber.slice(-4),
                        expiryDate: formData.expiryDate
                    },
                    status: 'Processing',
                    createdAt: serverTimestamp()
                };
            } else {
                // For guest users
                ordersCollectionRef = collection(db, `artifacts/${appId}/guest_orders`);
                orderData = {
                    userId: null,
                    items: cartItems.map(item => ({
                        id: item.id,
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price,
                        image: item.image // Include image for order history
                    })),
                    subtotal: subtotal,
                    discount: appliedDiscount ? {
                        code: appliedDiscount.code,
                        amount: appliedDiscount.amount,
                        discountAmount: discountAmount
                    } : null,
                    tax: tax,
                    totalPrice: total,
                    shippingInfo: {
                        name: formData.name,
                        email: formData.email,
                        address: formData.address,
                        city: formData.city,
                        zip: formData.zip
                    },
                    paymentInfo: {
                        cardNumber: formData.cardNumber.slice(-4),
                        expiryDate: formData.expiryDate
                    },
                    status: 'Processing',
                    createdAt: serverTimestamp()
                };
            }

            await addDoc(ordersCollectionRef, orderData);

            setCartItems([]);
            setMessage('Order placed successfully! If you were logged in, you could view this order in your profile. As a guest, please save your order details.');
            setShowModal(true);

        } catch (error) {
            console.error("Error placing order: ", error);
            setMessage('An error occurred while placing your order. Please try again.');
            setShowModal(true);
        }
    };

    const CustomModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-8 rounded-xl shadow-lg max-w-sm w-full text-center">
                <h3 className="text-xl font-bold text-red-500 mb-4">Notification</h3>
                <p className="text-gray-400 mb-6">{message}</p>
                <button
                    onClick={() => {
                        setShowModal(false);
                        if (message.includes('successfully') && user) {
                            setPage('orders');
                        } else if (message.includes('successfully')) {
                             setPage('artifacts');
                        }
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full transition duration-300"
                >
                    Close
                </button>
            </div>
        </div>
    );

    // Calculate totals with discount - FIXED: Pass appliedDiscount to calculateTotals
    const { subtotal, discountAmount, tax, total } = calculateTotals(appliedDiscount);

    return (
        <main className="container mx-auto px-4 py-12 pt-24">
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-2/3 bg-gray-800 rounded-xl p-8 shadow-lg">
                    <h1 className="text-3xl md:text-4xl font-bold text-red-500 mb-6 text-center lg:text-left">Checkout</h1>
                    <form onSubmit={handlePlaceOrder} className="space-y-6">
                        <h2 className="text-2xl font-bold text-white">Shipping Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="name" className="block text-gray-400 font-bold mb-2">Full Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-gray-400 font-bold mb-2">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="address" className="block text-gray-400 font-bold mb-2">Address</label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="city" className="block text-gray-400 font-bold mb-2">City</label>
                                <input
                                    type="text"
                                    id="city"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="zip" className="block text-gray-400 font-bold mb-2">ZIP Code</label>
                                <input
                                    type="text"
                                    id="zip"
                                    name="zip"
                                    value={formData.zip}
                                    onChange={handleChange}
                                    className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                    required
                                />
                            </div>
                        </div>

                        <hr className="border-gray-700 my-6" />

                        <h2 className="text-2xl font-bold text-white">Payment Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="cardNumber" className="block text-gray-400 font-bold mb-2">Card Number</label>
                                <input
                                    type="text"
                                    id="cardNumber"
                                    name="cardNumber"
                                    value={formData.cardNumber}
                                    onChange={handleChange}
                                    className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="expiryDate" className="block text-gray-400 font-bold mb-2">Expiry Date</label>
                                <input
                                    type="text"
                                    id="expiryDate"
                                    name="expiryDate"
                                    value={formData.expiryDate}
                                    onChange={handleChange}
                                    className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                    placeholder="MM/YY"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="cvv" className="block text-gray-400 font-bold mb-2">CVV</label>
                                <input
                                    type="text"
                                    id="cvv"
                                    name="cvv"
                                    value={formData.cvv}
                                    onChange={handleChange}
                                    className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-red-500 text-white font-bold py-3 rounded-full mt-6 hover:bg-red-600 transition duration-300"
                        >
                            Confirm Order
                        </button>
                    </form>
                </div>
                <div className="lg:w-1/3 bg-gray-800 rounded-xl p-8 shadow-lg h-fit">
                    <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
                    <div className="text-gray-400 space-y-2">
                        {cartItems.map(item => (
                            <div key={item.id} className="flex justify-between items-center">
                                <span>{item.name} (x{item.quantity})</span>
                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                        
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        
                        {appliedDiscount && (
                            <div className="flex justify-between text-green-400">
                                <span>Discount ({appliedDiscount.code})</span>
                                <span>-${discountAmount.toFixed(2)}</span>
                            </div>
                        )}
                        
                        <div className="flex justify-between">
                            <span>Tax (10%)</span>
                            <span>${tax.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex justify-between font-bold text-lg text-gray-200 border-t border-gray-700 pt-4 mt-4">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
            {showModal && <CustomModal />}
        </main>
    );
};

export default CheckoutForm;