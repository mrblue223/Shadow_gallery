import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
const PasswordReset = ({ auth, setPage }) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setError(null);
        setMessage(null);
        if (!email) {
            setError('Please enter your email address.');
            return;
        }
        try {
            await sendPasswordResetEmail(auth, email);
            setMessage('Password reset email sent! Check your inbox.');
        } catch (err) {
            setError(err.message);
        }
    };
    return (
        <main className="container mx-auto px-6 py-12 lg:py-24 flex justify-center">
            <div className="w-full max-w-md bg-gray-800 rounded-xl p-8 shadow-lg text-center">
                <h1 className="text-3xl font-bold text-red-500 mb-6">Reset Your Password</h1>
                <p className="text-gray-400 mb-8">Enter your email to receive a link to reset your password and reclaim your access to the sanctum.</p>
                <form onSubmit={handlePasswordReset} className="space-y-6">
                    <div>
                        <label className="block text-gray-400 mb-2" htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-red-500 text-white font-bold py-3 rounded-full hover:bg-red-600 transition duration-300"
                    >
                        Send Reset Email
                    </button>
                </form>
                {error && <p className="text-red-500 mt-4">{error}</p>}
                {message && <p className="text-green-500 mt-4">{message}</p>}
                <button
                    type="button"
                    onClick={() => setPage('login')}
                    className="mt-4 text-gray-400 hover:text-red-500 transition duration-300"
                >
                    Back to Login
                </button>
            </div>
        </main>
    );
};
export default PasswordReset;