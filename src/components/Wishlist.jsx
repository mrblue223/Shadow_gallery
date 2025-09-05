// src/components/Wishlist.jsx
import React, { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

const Wishlist = ({ user, db, setPage, setSelectedProduct, products }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch wishlist items from Firestore
  useEffect(() => {
    if (!user) {
      setError('Please log in to view your wishlist.');
      setLoading(false);
      return;
    }

    const fetchWishlist = async () => {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const itemIds = userData.wishlist || [];
          const items = products.filter(p => itemIds.includes(p.id));
          setWishlistItems(items);
        }
      } catch (err) {
        console.error('Error fetching wishlist:', err);
        setError('Failed to load wishlist. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [user, db, products]);

  // Handle removing a product from the wishlist
  const handleRemoveFromWishlist = async (productId) => {
    if (!user) return;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        wishlist: arrayRemove(productId),
      });
      setWishlistItems(prevItems => prevItems.filter(item => item.id !== productId));
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      setError('Failed to remove item. Please try again.');
    }
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setPage('product');
  };

  if (loading) {
    return <div className="text-center py-12">Loading wishlist...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-12">{error}</div>;
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 pt-24">
        <h2 className="text-4xl md:text-5xl font-bold mb-8 text-center tracking-wide text-red-500">My Wishlist</h2>
        <div className="bg-gray-800 p-10 rounded-xl shadow-2xl text-center max-w-2xl mx-auto">
          <p className="text-xl md:text-2xl font-semibold mb-4 text-red-500">Your wishlist is empty.</p>
          <p className="text-lg text-gray-400 mb-6">Start adding your favorite items from the gallery!</p>
          <button
            onClick={() => setPage('gallery')}
            // MODIFIED: Changed the button color to red
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 transform hover:scale-105"
          >
            Explore Gallery
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 pt-24">
      <h2 className="text-4xl md:text-5xl font-bold mb-8 text-center tracking-wide text-red-500">My Wishlist</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {wishlistItems.map(item => (
          <div key={item.id} className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:shadow-glow-blue flex flex-col p-6">
            <div className="relative w-full h-64 overflow-hidden rounded-lg mb-6">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" />
            </div>
            <div className="flex flex-col flex-grow text-center">
              <h3 className="text-2xl font-semibold mb-2 text-white">{item.name}</h3>
              <p className="text-lg font-bold text-gray-400 mb-4">${item.price.toFixed(2)}</p>
              <div className="mt-auto flex flex-col sm:flex-row gap-4 w-full justify-center">
                <button
                  onClick={() => handleViewProduct(item)}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleRemoveFromWishlist(item.id)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;