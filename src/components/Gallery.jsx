// Gallery.jsx
import React from 'react';
const Gallery = ({ setPage, setSelectedProduct, handleAddToCart, handleAddToWishlist, products }) => {
    const handleViewDetails = (product) => {
        setSelectedProduct(product);
        setPage('product');
        window.scrollTo(0, 0);
    };
    return (
        <main className="container mx-auto px-6 py-12 lg:py-24">
            <section className="text-center mb-16">
                <h1 className="text-4xl md:text-6xl font-bold text-red-500">The Grand Gallery</h1>
                <p className="mt-4 text-xl md:text-2xl text-gray-400">A collection of items beyond the veil of ordinary perception.</p>
            </section>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.length === 0 ? (
                    <p className="text-center text-xl text-gray-400 col-span-full">No artifacts found in the gallery. The shadows are empty.</p>
                ) : (
                    products.map(product => (
                        <div key={product.id} className="bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center hover:shadow-red-500/50 transition duration-300 transform hover:scale-105">
                            <img src={product.image} alt={product.name} className="rounded-lg mb-4 w-full h-48 object-cover"/>
                            <h3 className="text-xl font-semibold mb-2 text-gray-200 text-center">{product.name}</h3>
                            <p className="text-lg text-red-500 mb-4">${parseFloat(product.price).toFixed(2)}</p>
                            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                                <button onClick={() => handleViewDetails(product)} className="flex-1 bg-gray-600 text-white font-bold py-2 px-4 rounded-full shadow-lg hover:bg-gray-700 transition duration-300">
                                    View Details
                                </button>
                                <button onClick={() => handleAddToCart(product)} className={`flex-1 text-white font-bold py-2 px-4 rounded-full shadow-lg transition duration-300 ${product.stock > 0 ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-500 cursor-not-allowed'}`} disabled={product.stock === 0}>
                                    {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                                </button>
                                <button onClick={() => handleAddToWishlist(product)} className="flex-1 text-white font-bold py-2 px-4 rounded-full shadow-lg transition duration-300 bg-gray-600 hover:bg-gray-700">
                                    Add to Wishlist
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </main>
    );
};
export default Gallery;