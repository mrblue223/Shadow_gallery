import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Replace with your actual Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyASlPkZpJeOUkHnJjh_c4VDa7l6zDqP6UU",
    authDomain: "shadow-82df7.firebaseapp.com",
    projectId: "shadow-82df7",
    storageBucket: "shadow-82df7.firebasestorage.app",
    messagingSenderId: "689430154495",
    appId: "1:689430154495:web:e0946edeeb6ab535f8d0ca",
    measurementId: "G-TXHMXLM10D"
};

window.__firebase_config = JSON.stringify(firebaseConfig);
window.__initial_auth_token = "some-token";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);