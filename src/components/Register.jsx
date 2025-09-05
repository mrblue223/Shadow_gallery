import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';

const Register = ({ setPage, auth }) => {
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;

        if (!email || !password) {
            setMessage("Email and password fields cannot be empty.");
            setIsSuccess(false);
            return;
        }

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            
            setMessage("Registration successful! You can now log in.");
            setIsSuccess(true);
            setTimeout(() => setPage('login'), 3000);
        } catch (error) {
            console.error("Registration error:", error.code, error.message);
            switch (error.code) {
                case 'auth/email-already-in-use':
                    setMessage("This email is already claimed by another shadow. Please use a different one.");
                    break;
                case 'auth/invalid-email':
                    setMessage("The email address is not valid.");
                    break;
                case 'auth/weak-password':
                    setMessage("The password is too weak. Choose a stronger one, perhaps with more symbols and whispers.");
                    break;
                default:
                    setMessage(`An unknown error occurred: ${error.message}`);
                    break;
            }
            setIsSuccess(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-200 p-4">
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md">
                <h1 className="text-4xl font-bold text-center mb-6 text-red-500">Register</h1>
                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-gray-400 mb-2" htmlFor="email">Email</label>
                        <input type="email" id="email" name="email" className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="user@example.com" required />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2" htmlFor="password">Password</label>
                        <input type="password" id="password" name="password" className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Password" required />
                    </div>
                    {message && (
                        <p className={`text-center font-bold ${isSuccess ? 'text-green-500' : 'text-red-500'}`}>{message}</p>
                    )}
                    <button
                        type="submit"
                        className="w-full bg-red-500 text-white font-bold py-3 rounded-full mt-6 hover:bg-red-600 transition duration-300"
                    >
                        Register
                    </button>
                    <div className="text-center mt-4">
                        <button type="button" onClick={() => setPage('login')} className="text-gray-400 hover:text-red-500 transition duration-300">
                            Already have an identity? Login here.
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
};
export default Register;