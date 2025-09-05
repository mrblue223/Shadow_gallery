import React from 'react';
const Contact = () => {
    return (
        <main className="container mx-auto px-6 py-12 lg:py-24 flex justify-center">
            <div className="w-full max-w-xl bg-gray-800 rounded-xl p-8 shadow-lg text-center">
                <h1 className="text-3xl md:text-4xl font-bold text-red-500 mb-6">Contact the Keeper</h1>
                <p className="text-lg text-gray-400 mb-8">
                    To commune with the unseen force that tends to The Shadow Gallery, fill out the form below.
                </p>
                <form className="space-y-6">
                    <div>
                        <label className="block text-gray-400 mb-2" htmlFor="name">Your Name</label>
                        <input type="text" id="name" name="name" className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500" required />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2" htmlFor="email">Your Email</label>
                        <input type="email" id="email" name="email" className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500" required />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2" htmlFor="message">Your Message</label>
                        <textarea id="message" name="message" className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500" rows="5" required></textarea>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-red-500 text-white font-bold py-3 rounded-full mt-6 hover:bg-red-600 transition duration-300"
                    >
                        Send a Message
                    </button>
                </form>
            </div>
        </main>
    );
};
export default Contact;