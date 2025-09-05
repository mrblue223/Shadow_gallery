import React from 'react';
const Footer = () => {
    return (
        <footer className="bg-gray-800 p-8 mt-16 rounded-t-xl">
            <div className="container mx-auto px-6 text-center text-sm">
                <p>&copy; 2024 The Shadow Gallery. All shadows reserved.</p>
                <div className="mt-4">
                    <a href="#" className="hover:text-red-500 mx-2">Tome of Covenants</a> |
                    <a href="#" className="hover:text-red-500 mx-2">Archive of Whispers</a>
                </div>
            </div>
        </footer>
    );
};
export default Footer;