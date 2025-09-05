// App.jsx
import './index.css';
import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, updateDoc, doc, deleteDoc, onSnapshot, query, orderBy, increment, arrayUnion, getDoc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Import all separated components
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './components/Home.jsx';
import Gallery from './components/Gallery.jsx';
import ProductDetail from './components/ProductDetail.jsx';
import Cart from './components/Cart.jsx';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import Orders from './components/Orders.jsx';
import Admin from './components/Admin.jsx';
import Contact from './components/Contact.jsx';
import PasswordReset from './components/PasswordReset.jsx';
import CheckoutForm from './components/CheckoutForm.jsx';
import Profile from './components/Profile.jsx';
import Wishlist from './components/Wishlist.jsx';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyASlPkZpJeOUkHnJjh_c4VDa7l6zDqP6UU",
  authDomain: "shadow-82df7.firebaseapp.com",
  projectId: "shadow-82df7",
  storageBucket: "shadow-82df7.firebasestorage.app",
  messagingSenderId: "689430150259",
  appId: "1:689430150259:web:35509930983d98f731a55c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const App = () => {
    const [page, setPage] = useState('home');
    const [user, setUser] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [appliedDiscount, setAppliedDiscount] = useState(null);

    // Auth state listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setIsAuthReady(true);
        });
        return () => unsubscribe();
    }, [auth]);

    // Firestore products listener
    useEffect(() => {
        const productsCollectionRef = collection(db, 'products');
        const q = query(productsCollectionRef, orderBy('name'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedProducts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setProducts(fetchedProducts);
        }, (error) => {
            console.error("Error fetching products:", error);
        });
        return () => unsubscribe();
    }, [db]);

    const uploadImage = async (file) => {
        const storageRef = ref(storage, `images/${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        return url;
    };

    const handleAddToCart = (product) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === product.id);
            if (existingItem) {
                return prevItems.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                return [...prevItems, { ...product, quantity: 1 }];
            }
        });
        showNotification('Item added to cart!', 'success');
    };

    // Corrected handleAddToWishlist function to handle new user documents
    const handleAddToWishlist = async (product) => {
        if (!user) {
            showNotification('Please log in to add to your wishlist.', 'error');
            return;
        }
        try {
            const userDocRef = doc(db, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (!userDocSnap.exists()) {
                // Create the user document if it doesn't exist
                await setDoc(userDocRef, { wishlist: [product.id] });
            } else {
                // If the document exists, update the wishlist
                await updateDoc(userDocRef, {
                    wishlist: arrayUnion(product.id)
                });
            }
            showNotification('Product added to your wishlist!', 'success');
        } catch (error) {
            console.error("Error adding to wishlist:", error);
            showNotification('An error occurred while adding to your wishlist.', 'error');
        }
    };

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification({ message: '', type: '' });
        }, 3000); // Notification disappears after 3 seconds
    };

    const handleRemoveFromCart = (productId) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    };

    const handleUpdateQuantity = (productId, quantity) => {
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === productId ? { ...item, quantity: quantity } : item
            ).filter(item => item.quantity > 0)
        );
    };

    const calculateTotals = (discount = appliedDiscount) => {
        const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
        const discountAmount = discount ? subtotal * (discount.amount / 100) : 0;
        const discountedSubtotal = subtotal - discountAmount;
        const tax = discountedSubtotal * 0.08;
        const total = discountedSubtotal + tax;
        return { subtotal, discountAmount, tax, total };
    };

    const renderPage = () => {
        if (!isAuthReady) {
            return <div className="text-center py-24">Loading authentication...</div>;
        }
        switch (page) {
            case 'home':
                return <Home setPage={setPage} products={products} />;
            case 'gallery':
                return <Gallery setPage={setPage} setSelectedProduct={setSelectedProduct} handleAddToCart={handleAddToCart} handleAddToWishlist={handleAddToWishlist} products={products} />;
            case 'product':
                return <ProductDetail setPage={setPage} selectedProduct={selectedProduct} handleAddToCart={handleAddToCart} handleAddToWishlist={handleAddToWishlist} isAuthenticated={!!user} db={db} user={user} />;
            case 'cart':
                return <Cart 
                    setPage={setPage} 
                    cartItems={cartItems} 
                    setCartItems={setCartItems} 
                    calculateTotals={calculateTotals} 
                    db={db} 
                    appliedDiscount={appliedDiscount}
                    setAppliedDiscount={setAppliedDiscount}
                />;
            case 'checkoutInfo':
                return <CheckoutForm 
                    setPage={setPage} 
                    cartItems={cartItems} 
                    setCartItems={setCartItems} 
                    calculateTotals={calculateTotals} 
                    user={user} 
                    db={db} 
                    isAuthReady={isAuthReady}
                    appliedDiscount={appliedDiscount}
                />;
            case 'login':
                return <Login setPage={setPage} auth={auth} />;
            case 'register':
                return <Register setPage={setPage} auth={auth} />;
            case 'orders':
                return <Orders user={user} db={db} isAuthReady={isAuthReady} />;
            case 'admin':
                return <Admin db={db} isAuthReady={isAuthReady} products={products} setPage={setPage} uploadImage={uploadImage} />;
            case 'contact':
                return <Contact />;
            case 'passwordReset':
                return <PasswordReset setPage={setPage} auth={auth} />;
            case 'profile':
                return <Profile auth={auth} storage={storage} user={user} setPage={setPage} />;
            case 'wishlist':
                return <Wishlist user={user} db={db} setPage={setPage} setSelectedProduct={setSelectedProduct} products={products} />;
            default:
                return <Home setPage={setPage} products={products} />;
        }
    };

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <div className="bg-gray-900 text-gray-200 min-h-screen font-cinzel">
            <Header page={page} setPage={setPage} cartCount={cartCount} user={user} auth={auth} />
            {renderPage()}
            {/* MODIFIED: Notification component with top-left positioning */}
            {notification.message && (
                <div className={`fixed top-4 left-4 p-4 rounded-lg shadow-xl text-white transition-opacity duration-500 z-50 ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {notification.message}
                </div>
            )}
            <Footer />
        </div>
    );
};

export default App;