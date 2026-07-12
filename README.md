# BillBook/EzeeBill

A simple, fast billing application built for small shops. Add products and categories, generate bills, share them on WhatsApp, print thermal/A4 receipts, and keep everything backed up and synced across devices in real time.

## Features

- **Product & Category Management** — add, edit, and delete categories and products, each with three pricing tiers (Local, General, Retail)
- **Quick Billing** — search-as-you-type product lookup or manual category/product selection, inline editing of item name/quantity/rate directly in the bill
- **Bill History** — every saved bill is searchable by bill number, customer name, or date, with full item-level detail on demand
- **PDF Generation** — clean, printable A4 "Rough Estimate" bill format
- **Thermal Receipt Printing** — a compact receipt layout that works on both A4 and thermal printers
- **WhatsApp Sharing** — downloads the bill as PDF and opens WhatsApp to share it in one action
- **Data Export / Import** — download a full backup (categories, products, bills) as JSON, and restore from it anytime
- **Multi-User Login** — 2-4 shop accounts (owner/manager/etc.) can log in independently, all working on the exact same shared, real-time data
- **Cloud Sync** — powered by Firebase/Firestore, so data is never tied to a single device or browser; lose your phone and nothing is lost
- **Installable App (PWA)** — can be installed to a phone or desktop home screen via "Add to Home Screen" / browser install prompt, and works offline for viewing cached data

## Tech Stack

- **Frontend:** Plain HTML, CSS, JavaScript (no framework/build step)
- **UI:** Bootstrap 5
- **PDF Generation:** jsPDF + jsPDF-AutoTable
- **Backend/Database:** Firebase Firestore (real-time, cloud-hosted)
- **Authentication:** Firebase Authentication (Email/Password)
- **Hosting:** Firebase Hosting
- **Offline Support:** Service Worker (cache-first for static assets) + Firestore offline persistence

## Project Structure

```
Business-Billing-App/
├── index.html              # Main app shell + login overlay
├── manifest.json           # PWA manifest (installable app metadata)
├── service-worker.js       # Caches static assets for offline use
├── firestore.rules         # Firestore security rules (auth-only access)
├── css/
│   └── style.css           # App styling
├── icons/                  # App icons (various sizes, for PWA install)
├── js/
│   ├── firebase-config.js  # Firebase project initialization
│   ├── auth.js             # Login screen, logout, session/auth state handling
│   ├── storage.js          # Firestore-backed data layer (categories, products, bills)
│   ├── products.js         # Category & product CRUD, product table rendering
│   ├── billing.js          # Current bill logic, bill history, WhatsApp/print actions
│   ├── pdf.js               # PDF generation for bills
│   └── app.js               # App entry point — wires up all event listeners
└── data/
    └── sampleData.json      # (Legacy) sample data reference, not auto-loaded
```

## How Data Storage Works

All data — categories, products, and bills — lives in **Firebase Firestore**, shared across every logged-in account. The app keeps a local in-memory cache that stays synced in real time via Firestore listeners, so the UI feels instant while data is actually being read from and written to the cloud in the background.

Firestore data model:

| Collection/Doc         | Purpose                                              |
|-------------------------|-------------------------------------------------------|
| `categories/list`       | Single document holding the array of category names   |
| `products/{productId}`  | One document per product                             |
| `bills/{billId}`        | One document per saved bill                          |
| `meta/counter`          | Tracks the running bill number counter (A1, A2, ... B1, ...) |

## Authentication & Access

- Login is required before the app loads (email + password).
- Accounts are created manually in Firebase Console → Authentication → Users — there is no public sign-up.
- All accounts currently have equal access (view, add, edit, delete) to the same shared data.
- Firestore security rules restrict all reads/writes to authenticated users only.

## Backup & Restore

Use **Export Data** (in the app's menu) regularly to download a full JSON backup of categories, products, bills, and the bill counter. Keep this file somewhere safe (Drive, email, USB). If data ever needs to be cleared or something goes wrong, **Import Data** restores everything from that backup file.

> Note: Import overwrites the current shared cloud data for all accounts, so use it deliberately.

## Local Development

1. Clone the repository and open the folder in VS Code.
2. Use the **Live Server** extension (or any static file server) to serve `index.html`.
3. Firebase config is already wired in `js/firebase-config.js` — no additional setup needed to run locally, as long as the Firebase project's Firestore rules and Authentication are already configured.

## Deployment

Deployed via **Firebase Hosting**:

```
firebase login
firebase init hosting
firebase deploy --only hosting
```

Re-deploy anytime after making changes by running `firebase deploy --only hosting` again from the project root.

## Notes for Future Development

- All `storage.js` functions (`getCategories`, `saveProducts`, `getBills`, `saveBills`, `generateBillNumber`, etc.) intentionally keep the same names/signatures as the original localStorage-based version, so `products.js`, `billing.js`, `pdf.js`, and `app.js` never need to change even if the storage backend changes again in the future.
- `saveProducts()` and `saveBills()` diff against the local cache before writing to Firestore, to avoid unnecessary writes and stay well within Firebase's free-tier daily quotas as data grows.
- Sample/demo data auto-seeding has been removed — a fresh database starts empty.
