import React, { useState } from 'react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

const Cart = ({ setPage, cartItems, setCartItems, calculateTotals, db, appliedDiscount, setAppliedDiscount }) => {
    const [discountCode, setDiscountCode] = useState('');
    const [discountError, setDiscountError] = useState('');
    const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

    const handleUpdateQuantity = (id, change) => {
        setCartItems(prevItems => {
            const newItems = prevItems.map(item =>
                item.id === id ? { ...item, quantity: Math.max(1, item.quantity + change) } : item
            );
            return newItems;
        });
    };

    const handleRemoveItem = (id) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    };

    const applyDiscount = async () => {
        if (!discountCode.trim()) {
            setDiscountError('Please enter a discount code');
            return;
        }

        setIsApplyingDiscount(true);
        setDiscountError('');

        try {
            // Query Firestore for the discount code
            const discountsRef = collection(db, 'discounts');
            const q = query(discountsRef, where('code', '==', discountCode.toUpperCase()));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
                // Get the first matching discount
                const discountDoc = querySnapshot.docs[0];
                const discountData = discountDoc.data();
                
                setAppliedDiscount({
                    code: discountCode.toUpperCase(),
                    amount: discountData.amount,
                    id: discountDoc.id
                });
                setDiscountError('');
            } else {
                setDiscountError('Invalid discount code');
                setAppliedDiscount(null);
            }
        } catch (error) {
            console.error("Error applying discount:", error);
            setDiscountError('Error applying discount code');
        } finally {
            setIsApplyingDiscount(false);
        }
    };

    const removeDiscount = () => {
        setAppliedDiscount(null);
        setDiscountCode('');
        setDiscountError('');
    };

    const { subtotal, discountAmount, tax, total } = calculateTotals(appliedDiscount);

    const handleCheckoutClick = () => {
        setPage('checkoutInfo');
    };

    return (
        <main className="container mx-auto px-6 py-12 lg:py-24">
            <h1 className="text-4xl md:text-6xl font-bold text-red-500 text-center mb-12">Your Cart</h1>
            {cartItems.length === 0 ? (
                <p className="text-center text-xl text-gray-400">Your cart is currently empty. The shadows yearn for artifacts!</p>
            ) : (
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-2/3">
                        {cartItems.map(item => (
                            <div key={item.id} className="bg-gray-800 rounded-xl p-6 mb-4 flex flex-col md:flex-row items-center shadow-lg">
                                <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg mr-6 mb-4 md:mb-0"/>
                                <div className="grow text-center md:text-left">
                                    <h3 className="text-xl font-semibold">{item.name}</h3>
                                    <p className="text-lg text-red-500 mt-1">${parseFloat(item.price).toFixed(2)}</p>
                                </div>
                                <div className="flex items-center space-x-2 mt-4 md:mt-0">
                                    <button onClick={() => handleUpdateQuantity(item.id, -1)} className="quantity-btn bg-gray-700 w-8 h-8 rounded-full hover:bg-gray-600 transition duration-200">-</button>
                                    <span className="text-lg font-bold">{item.quantity}</span>
                                    <button onClick={() => handleUpdateQuantity(item.id, 1)} className="quantity-btn bg-gray-700 w-8 h-8 rounded-full hover:bg-gray-600 transition duration-200">+</button>
                                </div>
                                <button onClick={() => handleRemoveItem(item.id)} className="remove-btn bg-red-500 text-white text-sm font-bold py-2 px-4 rounded-full ml-4 mt-4 md:mt-0 hover:bg-red-600 transition duration-300">Remove</button>
                            </div>
                        ))}
                    </div>
                    <div className="lg:w-1/3 bg-gray-800 rounded-xl p-8 shadow-lg h-fit">
                        <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
                        
                        {/* Discount Code Section */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-2">Discount Code</h3>
                            {appliedDiscount ? (
                                <div className="bg-green-900 p-3 rounded-lg mb-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-green-300">Applied: {appliedDiscount.code} ({appliedDiscount.amount}% off)</span>
                                        <button 
                                            onClick={removeDiscount}
                                            className="text-red-400 hover:text-red-300 text-sm"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={discountCode}
                                        onChange={(e) => setDiscountCode(e.target.value)}
                                        placeholder="Enter code"
                                        className="flex-1 p-2 rounded-lg bg-gray-700 border border-gray-600 text-sm"
                                    />
                                    <button 
                                        onClick={applyDiscount}
                                        disabled={isApplyingDiscount}
                                        className="bg-gray-600 text-white px-3 rounded-lg hover:bg-gray-500 transition duration-300 text-sm disabled:bg-gray-700 disabled:cursor-not-allowed"
                                    >
                                        {isApplyingDiscount ? '...' : 'Apply'}
                                    </button>
                                </div>
                            )}
                            {discountError && (
                                <p className="text-red-400 text-sm mt-1">{discountError}</p>
                            )}
                        </div>

                        <div className="text-gray-400 space-y-2">
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
                        <button onClick={handleCheckoutClick} className="w-full bg-red-500 text-white font-bold py-3 rounded-full mt-6 hover:bg-red-600 transition duration-300">
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
};

export default Cart;