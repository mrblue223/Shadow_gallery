## Shadow Gallery

"Shadow Gallery" is an e-commerce application built with React, offering users an immersive experience to browse, purchase, and manage "artifacts of power and mystery". The app features a full-fledged authentication system, a product gallery,      detailed product pages with user reviews, and a personalized profile and order history for each user.

## ✨ Features

    User Authentication: Secure user registration, login, and password reset functionalities using Firebase Authentication.

    User Profiles: Registered users can update their display name, email, and password. They can also upload a custom profile picture.

    Product Catalog: Browse a gallery of "artifacts" with detailed information for each item.

    Product Reviews: Users can submit star ratings and text reviews for products.

    Wishlist: Add products to a personal wishlist for easy access.

    Order History: View past purchases with details on items, total cost, and order date.

    Responsive Design: The application's layout is designed to be fully responsive for all device sizes.

## ⚙️ How to Configure the App

This application relies on Google's Firebase for backend services, including Authentication, Firestore for the database, and Storage for profile images.

## 1. Firebase Project Setup

    Create a Firebase Project: Go to the Firebase Console and create a new project.

    Enable Services: In the Firebase Console, enable the following services:

        Authentication: Enable Email/Password Sign-in.

        Firestore Database: Start a new database in "production mode."

        Cloud Storage: Set up Cloud Storage to handle profile picture uploads.

    Get Your Config: In your project settings, find and copy your Firebase SDK configuration object. It will look similar to this:
    JavaScript

    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_STORAGE_BUCKET",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID"
    };

    Create Firestore Collections: You will need to create the following collections in Firestore for the app to function correctly:

        products: Stores all product information.

        reviews: Stores user reviews for each product.

        users: Stores user data, including wishlists.

## 2. Local Configuration

    Clone the Repository: Clone the project to your local machine.

    Install Dependencies: Navigate to the project directory and install the required packages:
    Bash

    npm install

    Add Firebase Config: In your src/ directory, create a new file named firebase.js (or similar) and paste your Firebase configuration into it. This file will be responsible for initializing Firebase in your application.

## ▶️ How to Start It

Once you have configured the Firebase project and installed the dependencies, you can start the development server.
Bash

    npm run dev

This will run the app in development mode. Open http://localhost:3000 to view it in your browser.

📜 Rules & Usage

    Public Access: Users can view the gallery of products without needing to log in.

    User-Only Features: To use features like adding products to a wishlist, writing reviews, and viewing orders, users must be logged in.

    Account Management: In the profile section, users must provide their current password to update their email address or password for security reasons.

    Admin Access: The app includes a hardcoded UID which after setting up "Athentication" in firebase copy the UID into your rules,
