# To-Do List for The Shadow Gallery E-commerce App (✅)

## 📝 High Priority (Must-Have)
- [✅] **Enhance Admin Security:** Harden the Admin Panel by implementing robust Firebase Security Rules for Firestore and Storage. This will ensure that only the hardcoded administrator UID (`r5kKMajgXLUBXIKrfaLzsBYzMkr2`) can add, edit, or delete products and that the database is not publicly writable.
- [] **Implement Order Tracking:** Add a status field to the `orders` collection in Firestore (e.g., 'Pending', 'Shipped', 'Delivered'). Create an interface in the Admin Panel for the curator to update an order's status, and display this status to the user on the "My Orders" page.
- [✅] **Add Inventory Management:**
  - [✅] Add a `stock` field to the products in Firestore.
  - [✅] Update the `handleAddToCart` function to check if an item is in stock before adding it to the cart.
  - [✅] Modify the `placeOrder` function to decrement the stock of each item after a successful order.
  - [✅] Add an input field to the Admin Panel for managing the stock quantity.

---

## 🚀 Medium Priority (Highly Recommended)
- [✅] **Enable Product Reviews and Ratings:**
  - [✅] Create a new Firestore collection (`reviews`) to store user-submitted reviews and ratings.
  - [✅] Add a form on the `ProductDetail` page where authenticated users can submit a review.
  - [✅] Display the average rating and a list of all reviews for a product.
- [] **Add Search and Filtering:** Implement a search functionality on the `Gallery` page that allows users to search for products by `name` or `description`. Add filters for sorting by `price` (low to high, high to low) and filtering by category (if categories are added).
- [✅] **Create a User Profile Page:** Develop a new component for a user profile where a logged-in user can view their personal information (email), past orders, and perhaps a list of wishlisted items.
- [] **Automate Email Confirmations:**
  - [] Integrate a transactional email service (e.g., SendGrid) or use Firebase Cloud Functions.
  - [] Configure the `placeOrder` function to send an email confirmation to the user upon a successful checkout, summarizing their order details.

---

## ✨ Low Priority (Nice-to-Have)
- [] **Implement a Wishlist Feature:** Add a "Wishlist" button to product cards and a new `Wishlist` page. This will allow users to save items for later, with a separate Firestore collection for each user's wishlist.
- [] **Introduce Discount Codes:**
  - [] Create a `discounts` collection in Firestore to store valid codes and their values.
  - [] Add an input field on the `Cart` or `Checkout` page for users to enter a discount code.
  - [] Implement logic to validate the code and apply the discount to the order total.
- [] **Optimize Image Loading:**
  - [] Explore using Firebase Cloud Functions to automatically resize images uploaded to Storage.
  - [] Update the product components to load smaller, optimized versions of the images to improve page load times.
- [] **Add Social Sharing:** Include social media share buttons on the `ProductDetail` page so users can share their favorite artifacts.