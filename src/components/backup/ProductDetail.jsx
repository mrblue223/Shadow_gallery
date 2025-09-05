// ProductDetail.jsx
import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, onSnapshot, query, where, orderBy, getDoc } from 'firebase/firestore';

const ProductDetail = ({ setPage, selectedProduct, handleAddToCart, handleAddToWishlist, isAuthenticated, db, user }) => {
    const [reviewText, setReviewText] = useState('');
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviews, setReviews] = useState([]);
    const [notification, setNotification] = useState({ message: '', type: '' });

    // Effect to fetch reviews for the current product
    useEffect(() => {
        if (!selectedProduct || !db) return;

        const q = query(
            collection(db, 'reviews'),
            where('productId', '==', selectedProduct.id),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedReviews = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setReviews(fetchedReviews);
        }, (error) => {
            console.error("Error fetching reviews:", error);
        });

        // Clean up the listener on component unmount
        return () => unsubscribe();
    }, [selectedProduct, db]);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification({ message: '', type: '' });
        }, 3000);
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            showNotification('You must be logged in to submit a review.', 'error');
            return;
        }
        if (rating === 0) {
            showNotification('Please provide a rating by clicking on a star.', 'error');
            return;
        }

        try {
            await addDoc(collection(db, 'reviews'), {
                productId: selectedProduct.id,
                userId: user.uid,
                userName: user.displayName || user.email,
                review: reviewText,
                rating: Number(rating),
                createdAt: serverTimestamp()
            });
            showNotification('Review submitted successfully!');
            setReviewText('');
            setRating(0);
        } catch (error) {
            console.error('Error submitting review:', error);
            showNotification('An error occurred while submitting your review.', 'error');
        }
    };

    const renderStarRating = (starRating) => {
        return [...Array(5)].map((_, index) => {
            return (
                <span
                    key={index}
                    className={`text-2xl ${
                        index < starRating ? 'text-yellow-400' : 'text-gray-500'
                    }`}
                >
                    ★
                </span>
            );
        });
    };

    if (!selectedProduct) {
        return (
            <main className="container mx-auto px-6 py-12 lg:py-24 text-center">
                <p className="text-xl text-red-500">Artifact not found. Please return to the gallery.</p>
                <button onClick={() => setPage('gallery')} className="mt-4 bg-gray-600 text-white font-bold py-2 px-4 rounded-full shadow-lg hover:bg-gray-700 transition duration-300">
                    Back to Gallery
                </button>
            </main>
        );
    }
    return (
        <main className="container mx-auto px-6 py-12 lg:py-24">
            {/* Notification - Positioned top-left */}
            {notification.message && (
                <div className={`fixed top-4 left-4 p-4 rounded-lg shadow-xl text-white transition-opacity duration-500 z-50 ${
                    notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                }`}>
                    {notification.message}
                </div>
            )}
            
            <section className="flex flex-col lg:flex-row items-center lg:items-start gap-12">
                <div className="lg:w-1/2 w-full">
                    <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full rounded-xl shadow-lg"/>
                </div>
                <div className="lg:w-1/2 w-full text-center lg:text-left">
                    <h1 className="text-4xl md:text-5xl font-bold text-red-500 mb-4">{selectedProduct.name}</h1>
                    <p className="text-2xl text-gray-400 mb-6">${parseFloat(selectedProduct.price).toFixed(2)}</p>
                    <p className="text-lg mb-8 leading-relaxed">{selectedProduct.description}</p>
                    {selectedProduct.stock !== undefined && (
                        <p className={`text-xl font-bold mb-4 ${selectedProduct.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {selectedProduct.stock > 0 ? `In Stock: ${selectedProduct.stock}` : 'Out of Stock'}
                        </p>
                    )}
                    <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                        <button onClick={() => handleAddToCart(selectedProduct)} className={`add-to-cart-btn text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 transform hover:scale-105 ${selectedProduct.stock > 0 ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-500 cursor-not-allowed'}`} disabled={selectedProduct.stock === 0}>
                            {selectedProduct.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                        <button onClick={() => handleAddToWishlist(selectedProduct)} className="bg-gray-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-700 transition duration-300 transform hover:scale-105">
                            Add to Wishlist
                        </button>
                        <button onClick={() => setPage('gallery')} className="bg-gray-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-700 transition duration-300 transform hover:scale-105">
                            Back to Gallery
                        </button>
                    </div>
                </div>
            </section>
            
            <hr className="my-12 border-gray-300"/>

            <section className="mt-12">
                <h2 className="text-3xl font-bold text-red-500 mb-6 text-center lg:text-left">Customer Reviews</h2>
                
                {isAuthenticated ? (
                    <form onSubmit={handleReviewSubmit} className="bg-gray-800 p-8 rounded-xl shadow-lg">
                        <h3 className="text-2xl font-semibold mb-4 text-white">Submit Your Review</h3>
                        <div className="mb-4">
                            <label htmlFor="review" className="block text-gray-300 font-bold mb-2">Your Review:</label>
                            <textarea
                                id="review"
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                className="w-full p-4 rounded-lg border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                rows="4"
                                placeholder="Share your thoughts on this artifact..."
                                required
                            ></textarea>
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-300 font-bold mb-2">Rating:</label>
                            <div className="flex text-2xl">
                                {[...Array(5)].map((_, index) => {
                                    const starValue = index + 1;
                                    return (
                                        <span
                                            key={starValue}
                                            className={`cursor-pointer transition-colors duration-200 ${
                                                starValue <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-500'
                                            }`}
                                            onClick={() => setRating(starValue)}
                                            onMouseEnter={() => setHoverRating(starValue)}
                                            onMouseLeave={() => setHoverRating(0)}
                                        >
                                            ★
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-red-500 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 transform hover:scale-105 hover:bg-red-600"
                        >
                            Submit Review
                        </button>
                    </form>
                ) : (
                    <div className="text-center p-8 bg-gray-800 rounded-xl shadow-lg">
                        <p className="text-xl text-gray-300">Please <button onClick={() => setPage('login')} className="text-red-500 underline font-bold">log in</button> to submit a review.</p>
                    </div>
                )}

                <hr className="my-12 border-gray-300"/>

                <div className="mt-12">
                    <h3 className="text-2xl font-semibold mb-4 text-white">All Reviews</h3>
                    {reviews.length > 0 ? (
                        <div className="space-y-6">
                            {reviews.map((review) => (
                                <div key={review.id} className="bg-gray-800 p-6 rounded-xl shadow-md">
                                    <div className="flex items-center mb-2">
                                        <p className="text-lg font-bold text-white mr-2">{review.userName}</p>
                                        <div className="flex">
                                            {renderStarRating(review.rating)}
                                        </div>
                                    </div>
                                    <p className="text-gray-300">{review.review}</p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        {review.createdAt?.toDate().toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center p-8">
                            <p className="text-gray-400">There are no reviews for this product yet. Be the first to add one!</p>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
};

export default ProductDetail;