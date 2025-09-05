// Header.jsx
import React from 'react';
import { FaHeart } from 'react-icons/fa';

const Header = ({ page, setPage, cartCount, user, auth }) => {

    const handleLogout = async () => {
        try {
            await auth.signOut();
            setPage('home');
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950 text-white shadow-xl">
            <nav className="container mx-auto flex items-center justify-between p-4">
                <div className="flex items-center">
                    <button onClick={() => setPage('home')} className="text-2xl font-bold text-red-500 hover:text-red-400 transition-colors duration-300 mr-8">
                        Shadow Gallery
                    </button>
                    <div className="hidden md:flex space-x-6">
                        <button onClick={() => setPage('gallery')} className={`hover:text-red-500 transition-colors duration-300 ${page === 'gallery' ? 'font-bold text-red-500' : ''}`}>Gallery</button>
                        <button onClick={() => setPage('contact')} className={`hover:text-red-500 transition-colors duration-300 ${page === 'contact' ? 'font-bold text-red-500' : ''}`}>Contact</button>
                        {user && <button onClick={() => setPage('orders')} className={`hover:text-red-500 transition-colors duration-300 ${page === 'orders' ? 'font-bold text-red-500' : ''}`}>Orders</button>}
                        {user?.email === 'samr03257@gmail.com' && <button onClick={() => setPage('admin')} className={`hover:text-red-500 transition-colors duration-300 ${page === 'admin' ? 'font-bold text-red-500' : ''}`}>Admin</button>}
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <button onClick={() => setPage('wishlist')} className="relative p-2 text-white hover:text-red-400 transition-colors">
                        <FaHeart size={24} />
                    </button>
                    <button onClick={() => setPage('cart')} className="relative p-2 rounded-full hover:bg-gray-800 transition-colors duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {cartCount > 0 && (
                            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                                {cartCount}
                            </span>
                        )}
                    </button>
                    {user ? (
                        <>
                            {/* NEW: Profile Button */}
                            <button onClick={() => setPage('profile')} className="flex items-center space-x-2">
                                <img
                                    src={user.photoURL || "https://www.gravatar.com/avatar/?d=retro"}
                                    alt="Profile"
                                    className="w-8 h-8 rounded-full border-2 border-red-500"
                                />
                            </button>
                            <button onClick={handleLogout} className="bg-red-500 text-white font-bold py-2 px-4 rounded-full hover:bg-red-600 transition duration-300">
                                Logout
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setPage('login')} className="bg-red-500 text-white font-bold py-2 px-4 rounded-full hover:bg-red-600 transition duration-300">
                            Login
                        </button>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Header;