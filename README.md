# Qutub Market

Qutub Market is a multi-vendor shopping platform built with Next.js. Customers can browse products from independent sellers, add items to a cart, and check out online. Vendors can manage their listings, while admins have tools for managing the marketplace.

## Features

- Product catalogue with product detail pages
- Customer registration, sign-in, cart, and order history
- Vendor dashboard for adding and managing products
- Admin pages for products, orders, users, and vendors
- Firestore updates for the product catalogue
- Stripe Checkout for card payments
- Responsive storefront with a custom loading screen

## Built with

- Next.js 16 and React 19
- TypeScript and Tailwind CSS
- Firebase Authentication and Firestore
- Stripe Checkout
- Cloudinary image uploads

## Run locally

1. Install the dependencies:

   ```bash
   npm install
   ```

2. Add the required server settings to `.env.local`:

   ```env
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   NEXT_PUBLIC_STRIPE_SECRET_KEY=your_stripe_secret_key
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_CLIENT_EMAIL=your_firebase_service_account_email
   FIREBASE_PRIVATE_KEY="your_firebase_service_account_private_key"
   ```

   The Firebase web app configuration is in `src/lib/firebase.ts`. Use your own Firebase project and enable Authentication and Firestore. The vendor product upload flow also needs a Cloudinary account configured in the app.

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

## Useful commands

```bash
npm run dev     # Start the local development server
npm run build   # Create a production build
npm run start   # Run the production build
npm run lint    # Check the project with ESLint
```

## Main routes

| Route | Purpose |
| --- | --- |
| `/` | Storefront |
| `/products` | Product catalogue |
| `/product?id=<product-id>` | Product details |
| `/cart` | Shopping cart |
| `/checkout` | Checkout |
| `/user-dashboard` | Customer orders |
| `/vendor-dashboard` | Vendor tools |
| `/admin` | Admin area |

