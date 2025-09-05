import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';

const Orders = ({ user, db, isAuthReady }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        let unsubscribe = () => {};
        if (isAuthReady && user) {
            const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
            const ordersCollectionRef = collection(db, `artifacts/${appId}/users/${user.uid}/orders`);
            const q = query(ordersCollectionRef);
            unsubscribe = onSnapshot(q, (querySnapshot) => {
                const fetchedOrders = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const orderDate = data.date ? new Date(data.date).toLocaleDateString() : 'N/A';
                    fetchedOrders.push({
                        id: doc.id,
                        ...data,
                        date: orderDate
                    });
                });
                fetchedOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
                setOrders(fetchedOrders);
                setLoading(false);
            }, (error) => {
                console.error("Error fetching orders:", error);
                setLoading(false);
            });
        } else if (isAuthReady && !user) {
            setLoading(false);
            setOrders([]);
        }
        return () => unsubscribe();
    }, [user, db, isAuthReady]);
    if (loading) {
        return (
            <main className="container mx-auto px-6 py-12 lg:py-24 text-center">
                <p className="text-xl text-gray-400">Loading your order history...</p>
            </main>
        );
    }
    if (!user) {
        return (
            <main className="container mx-auto px-6 py-12 lg:py-24 text-center">
                <p className="text-xl text-red-500">Please log in to view your order history.</p>
            </main>
        );
    }
    return (
        <main className="container mx-auto px-6 py-12 lg:py-24">
            <h1 className="text-4xl md:text-6xl font-bold text-red-500 text-center mb-12">My Orders</h1>
            <p className="text-center text-sm text-gray-500 mb-8">User ID: {user.uid}</p>
            {orders.length === 0 ? (
                <p className="text-center text-xl text-gray-400">You have no past orders. The gallery awaits your patronage!</p>
            ) : (
                <div className="space-y-8">
                    {orders.map(order => (
                        <div key={order.id} className="bg-gray-800 rounded-xl p-8 shadow-lg">
                            <h2 className="text-2xl font-bold mb-4 text-gray-200">Order ID: <span className="text-red-500 font-normal">{order.id}</span></h2>
                            <p className="text-lg text-gray-400 mb-4">Date: {order.date}</p>
                            <div className="space-y-4">
                                {order.items.map((item, index) => (
                                    <div key={index} className="flex flex-col sm:flex-row items-center bg-gray-700 p-4 rounded-lg">
                                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg mr-4 mb-2 sm:mb-0"/>
                                        <div className="grow">
                                            <p className="font-semibold">{item.name}</p>
                                            <p className="text-sm text-gray-400">Quantity: {item.quantity}</p>
                                        </div>
                                        <p className="font-bold text-lg text-red-500 mt-2 sm:mt-0">${item.price.toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end font-bold text-lg text-red-500 border-t border-gray-600 pt-4 mt-4">
                                <span>Total: ${order.total.toFixed(2)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
};
export default Orders;