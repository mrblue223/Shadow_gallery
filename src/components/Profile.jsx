import React, { useState, useEffect } from 'react';
import { updateProfile, updateEmail, updatePassword, signOut, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const Profile = ({ auth, storage, user, setPage }) => {
    const [name, setName] = useState(user?.displayName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [profileImage, setProfileImage] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            setName(user.displayName || '');
            setEmail(user.email || '');
        }
    }, [user]);

    const handleSave = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (!user) {
            setError('You must be logged in to update your profile.');
            return;
        }
        
        // Flags to track which fields have changed
        const isNameChanged = name !== user.displayName;
        const isEmailChanged = email !== user.email;
        const isPasswordChanged = !!newPassword;
        const isImageChanged = !!profileImage;
        const hasSensitiveChange = isEmailChanged || isPasswordChanged;
        
        // Early exit if no changes were made
        if (!isNameChanged && !isEmailChanged && !isPasswordChanged && !isImageChanged) {
            setError('No changes to save.');
            return;
        }
        
        // --- Step 1: Handle Name and Profile Image Updates (Non-sensitive) ---
        if (isNameChanged || isImageChanged) {
            try {
                let updatedProfile = {};
                if (isNameChanged) {
                    updatedProfile.displayName = name;
                }
                
                if (isImageChanged) {
                    // This is the updated line to include the file name in the path.
                    const storageRef = ref(storage, `profile_pictures/${user.uid}/${profileImage.name}`);
                    await uploadBytes(storageRef, profileImage);
                    const imageUrl = await getDownloadURL(storageRef);
                    updatedProfile.photoURL = imageUrl;
                }
                await updateProfile(user, updatedProfile);
                setMessage('Profile picture and display name updated successfully!');
            } catch (err) {
                setError('Failed to update display name or profile picture. Please try again.');
                console.error("Profile update error:", err);
                return; // Stop execution if this critical part fails
            }
        }
        
        // --- Step 2: Handle Sensitive Changes (Email or Password) ---
        if (hasSensitiveChange) {
            if (!oldPassword) {
                setError('Please enter your current password to change your email or password.');
                return;
            }
            
            try {
                const credential = EmailAuthProvider.credential(user.email, oldPassword);
                await reauthenticateWithCredential(user, credential);
                
                if (isEmailChanged) {
                    await updateEmail(user, email);
                    setMessage('Email updated successfully!');
                }
                
                if (isPasswordChanged) {
                    await updatePassword(user, newPassword);
                    setMessage('Password updated successfully!');
                }
            } catch (err) {
                if (err.code === 'auth/wrong-password') {
                    setError('Incorrect current password. Please try again.');
                } else if (err.code === 'auth/email-already-in-use') {
                    setError('The new email address is already in use by another account.');
                } else {
                    setError('Failed to update email or password. Please try again.');
                    console.error("Sensitive update error:", err);
                }
                return;
            }
        }
        
        // If we reach here, everything was successful or non-sensitive updates were made.
        setOldPassword('');
        setNewPassword('');
        setProfileImage(null);
    };

    const handleLogout = async () => {
        await signOut(auth);
        setPage('home');
    };

    if (!user) {
        return (
            <main className="container mx-auto px-6 py-12 lg:py-24 text-center">
                <p className="text-xl text-red-500">Please log in to view your profile.</p>
                <button onClick={() => setPage('login')} className="mt-4 bg-gray-600 text-white font-bold py-2 px-4 rounded-full shadow-lg hover:bg-gray-700 transition duration-300">
                    Go to Login
                </button>
            </main>
        );
    }

    return (
        <main className="container mx-auto px-6 py-12 lg:py-24">
            <h1 className="text-4xl md:text-6xl font-bold text-red-500 text-center mb-12">User Profile</h1>
            <div className="bg-gray-800 p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
                {message && <p className="text-green-400 text-center mb-4">{message}</p>}
                {error && <p className="text-red-400 text-center mb-4">{error}</p>}
                
                <div className="text-center mb-8">
                    <img src={user.photoURL || 'https://via.placeholder.com/150'} alt="Profile" className="w-32 h-32 rounded-full mx-auto mb-4 object-cover" />
                    <h2 className="text-2xl font-bold text-white">{user.displayName || user.email}</h2>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    <div>
                        <label htmlFor="profile-image" className="block text-gray-400">Profile Picture</label>
                        <input type="file" id="profile-image" onChange={(e) => setProfileImage(e.target.files[0])} className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white" />
                    </div>
                    <div>
                        <label htmlFor="name" className="block text-gray-400">Display Name</label>
                        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-gray-400">Email</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white" required />
                    </div>
                    <div>
                        <label htmlFor="old-password" className="block text-gray-400">Current Password</label>
                        <input type="password" id="old-password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white" placeholder="Required for email or password change" />
                    </div>
                    <div>
                        <label htmlFor="new-password" className="block text-gray-400">New Password</label>
                        <input type="password" id="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white" />
                    </div>
                    <button type="submit" className="w-full bg-red-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-red-600 transition duration-300">
                        Save Changes
                    </button>
                </form>
                
                <div className="mt-8 text-center">
                    <button onClick={handleLogout} className="text-gray-400 underline hover:text-red-500 transition duration-300">
                        Logout
                    </button>
                </div>
            </div>
        </main>
    );
};

export default Profile;
