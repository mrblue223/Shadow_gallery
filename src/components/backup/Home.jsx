import React from 'react';
const Home = ({ setPage, products }) => {
    return (
        <main className="container mx-auto px-6 py-12 lg:py-24">
            <section className="text-center mb-16">
                <h1 className="text-4xl md:text-6xl font-bold text-red-500">Welcome, Seeker of the Unknown</h1>
                <p className="mt-4 text-xl md:text-2xl text-gray-400">Step into a realm where artifacts of power and mystery are bought and sold.</p>
            </section>
            <section className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-200">Featured Artifacts</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {products.slice(0, 3).map(product => (
                        <div key={product.id} className="bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center hover:shadow-red-500/50 transition duration-300 transform hover:scale-105">
                            <img src={product.image} alt={product.name} className="rounded-lg mb-4 w-full h-48 object-cover"/>
                            <h3 className="text-xl font-semibold mb-2 text-gray-200">{product.name}</h3>
                            <p className="text-lg text-red-500 mb-4">${product.price.toFixed(2)}</p>
                            <button onClick={() => { setPage('product'); window.scrollTo(0, 0); }} className="add-to-cart-btn bg-red-500 text-white font-bold py-2 px-6 rounded-full shadow-lg hover:bg-red-600 transition duration-300">
                                View Details
                            </button>
                        </div>
                    ))}
                </div>
            </section>
            <section className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-200">Enter the Gallery</h2>
                <p className="mb-8 text-gray-400 max-w-2xl mx-auto">Explore our full collection of rare and powerful artifacts. Each piece has a story, a history, and a purpose waiting to be discovered by its next keeper.</p>
                <button onClick={() => setPage('gallery')} className="bg-red-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-red-600 transition duration-300 transform hover:scale-105">
                    View All Artifacts
                </button>
            </section>
        </main>
    );
};
export default Home;