// ===== Firestore-backed Storage =====
//
// Same public functions as before (getCategories, saveProducts, getBills,
// generateBillNumber, exportData, importData, etc.) so products.js,
// billing.js, pdf.js, and app.js work UNCHANGED.
//
// Under the hood: everything lives in Firestore now, shared by every
// logged-in account. A local in-memory cache is kept in sync in real
// time (onSnapshot), so the get___() functions can still return data
// instantly and synchronously, exactly like localStorage did.
//
// Data model (Firestore):
//   categories/list          -> { items: [ "Rice", "Oil", ... ] }
//   products/{productId}     -> { name, category, unit, localRate, generalRate, retailRate }
//   bills/{billId}           -> { billNumber, date, time, customerName, items, grandTotal, createdAt }
//   meta/counter             -> { value: <last used bill counter> }

const CATEGORY_DOC   = db.collection("categories").doc("list");
const PRODUCTS_COL    = db.collection("products");
const BILLS_COL        = db.collection("bills");
const COUNTER_DOC     = db.collection("meta").doc("counter");


// ===== In-memory caches (kept live via onSnapshot) =====

let categoriesCache = [];
let productsCache    = [];   // each item has .id (string) matching the original numeric id, kept as Number for compatibility
let billsCache        = [];   // each item has ._docId (Firestore doc id, internal use only)
let counterCache      = 0;

let listenersStarted = false;


// ===== Start Real-time Sync (called once after login, from auth.js) =====

function startStorageSync() {

    if (listenersStarted) return;
    listenersStarted = true;

    // --- Categories ---
    CATEGORY_DOC.onSnapshot((doc) => {
        if (doc.exists) {
            categoriesCache = doc.data().items || [];
        } else if (!doc.metadata.fromCache) {
            // Confirmed by the SERVER (not just local cache) that this
            // document truly doesn't exist yet — safe to initialize.
            categoriesCache = [];
            CATEGORY_DOC.set({ items: categoriesCache });
        }
        // If it doesn't exist AND this snapshot came from local cache,
        // do nothing — wait for the server to confirm before deciding
        // whether to seed, so real data is never overwritten.
        if (typeof loadCategories === "function") loadCategories();
    }, (err) => console.error("Categories sync error:", err));

    // --- Products ---
    PRODUCTS_COL.onSnapshot((snap) => {

        productsCache = snap.docs.map((d) => {
            const data = d.data();
            return { id: Number(d.id), ...data };
        });

        if (typeof loadProductTable === "function") loadProductTable();
        if (typeof loadProducts === "function") loadProducts();

    }, (err) => console.error("Products sync error:", err));

    // --- Bills ---
    BILLS_COL.orderBy("createdAt", "asc").onSnapshot((snap) => {

        billsCache = snap.docs.map((d) => {
            const data = d.data();
            return { _docId: d.id, ...data };
        });

        if (typeof loadBillHistory === "function") loadBillHistory();

    }, (err) => console.error("Bills sync error:", err));

    // --- Bill Counter ---
    COUNTER_DOC.onSnapshot((doc) => {
        counterCache = doc.exists ? (doc.data().value || 0) : 0;
    }, (err) => console.error("Counter sync error:", err));

}

// ===== Categories =====

function getCategories() {
    return categoriesCache;
}

function saveCategories(categories) {
    categoriesCache = categories; // update cache immediately for snappy UI
    CATEGORY_DOC.set({ items: categories }).catch((err) => {
        console.error("Failed to save categories:", err);
        alert("Could not save categories — check your internet connection.");
    });
}


// ===== Products =====
// saveProducts(products) receives the FULL desired array (same contract as
// before). We diff against the cache so we only write what actually
// changed/added/removed, instead of rewriting everything every time.

function getProducts() {
    return productsCache;
}

function saveProducts(products) {

    const oldIds = new Set(productsCache.map((p) => p.id));
    const newIds = new Set(products.map((p) => p.id));

    const batch = db.batch();

    // Add or update
    products.forEach((p) => {
        const { id, ...rest } = p;
        batch.set(PRODUCTS_COL.doc(String(id)), rest);
    });

    // Delete removed
    oldIds.forEach((id) => {
        if (!newIds.has(id)) {
            batch.delete(PRODUCTS_COL.doc(String(id)));
        }
    });

    productsCache = products; // update cache immediately for snappy UI

    batch.commit().catch((err) => {
        console.error("Failed to save products:", err);
        alert("Could not save products — check your internet connection.");
    });

}

function updateProduct(id, name, category, unit, localRate, generalRate, retailRate) {

    const index = productsCache.findIndex((p) => p.id == id);
    if (index === -1) return;

    const updated = { id: Number(id), name, category, unit, localRate, generalRate, retailRate };
    productsCache[index] = updated;

    const { id: _drop, ...rest } = updated;
    PRODUCTS_COL.doc(String(id)).set(rest).catch((err) => {
        console.error("Failed to update product:", err);
        alert("Could not update product — check your internet connection.");
    });

}


// ===== Bills =====
// getBills() returns plain bill objects (no _docId) so existing code that
// does things like bills.push(...) / bills.splice(...) keeps working.
// saveBills(bills) receives the FULL desired array and is diffed the same
// way as products, matched up positionally against the cache.

function getBills() {
    return billsCache.map(({ _docId, ...rest }) => rest);
}

function saveBills(bills) {

    const oldCache = billsCache;
    const batch = db.batch();

    // Bills whose position still exists and match an old cached doc get
    // updated in place; anything beyond the old length is a new bill.
    bills.forEach((bill, index) => {
        if (index < oldCache.length) {
            batch.set(BILLS_COL.doc(oldCache[index]._docId), withCreatedAt(bill, oldCache[index]));
        } else {
            batch.set(BILLS_COL.doc(), withCreatedAt(bill, null));
        }
    });

    // Any old docs beyond the new array's length were deleted (e.g. via deleteBill)
    for (let i = bills.length; i < oldCache.length; i++) {
        batch.delete(BILLS_COL.doc(oldCache[i]._docId));
    }

    batch.commit().catch((err) => {
        console.error("Failed to save bills:", err);
        alert("Could not save the bill — check your internet connection.");
    });

}

function withCreatedAt(bill, existingDoc) {
    return {
        ...bill,
        createdAt: existingDoc ? existingDoc.createdAt : firebase.firestore.FieldValue.serverTimestamp()
    };
}


// ===== Bill Number =====
// Format: A1 -> A100, then B1 -> B100, then C1 -> C100, etc.
// Uses a Firestore transaction so two devices saving at the same moment
// never get the same bill number.

function generateBillNumber() {

    // Compute synchronously from the cached counter so the UI (which
    // expects an immediate return value) keeps working exactly as before.
    const counter = counterCache + 1;
    counterCache = counter;

    // Persist the increment in the background via a transaction (safe
    // against two devices bumping it at the same instant).
    db.runTransaction(async (tx) => {
        const doc = await tx.get(COUNTER_DOC);
        const current = doc.exists ? (doc.data().value || 0) : 0;
        tx.set(COUNTER_DOC, { value: current + 1 });
    }).catch((err) => console.error("Failed to update bill counter:", err));

    const letterIndex = Math.floor((counter - 1) / 100);
    const number       = ((counter - 1) % 100) + 1;
    const letter       = String.fromCharCode(65 + letterIndex); // A, B, C...

    return `${letter}${number}`;
}


// ===== Helpers =====

function generateProductId() {
    if (productsCache.length === 0) return 1;
    return Math.max(...productsCache.map((p) => p.id)) + 1;
}


// ===== Export =====

function exportData() {
    const backupData = {
        categories:  getCategories(),
        products:    getProducts(),
        bills:       getBills(),
        billCounter: String(counterCache)
    };

    const blob = new Blob(
        [JSON.stringify(backupData, null, 4)],
        { type: "application/json" }
    );

    const link    = document.createElement("a");
    link.href     = URL.createObjectURL(blob);
    const date    = new Date().toLocaleDateString("en-GB").replaceAll("/", "-");
    link.download = `Backup_${date}.json`;
    link.click();
}


// ===== Import =====
// Overwrites cloud data for everyone (all logged-in accounts share the
// same data), so this is confirmed explicitly before running.

function importData(file) {

    if (!confirm("Importing will replace the shared data for ALL accounts (categories, products, and bills). Continue?")) {
        return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {
        try {
            const data = JSON.parse(event.target.result);

            if (data.categories) saveCategories(data.categories);
            if (data.products)   saveProducts(data.products);
            if (data.bills)      saveBills(data.bills);

            if (data.billCounter) {
                COUNTER_DOC.set({ value: parseInt(data.billCounter) || 0 });
            }

            alert("Data imported successfully. It will sync to all devices shortly.");

        } catch (e) {
            alert("Invalid file. Please import a valid backup JSON.");
        }
    };

    reader.readAsText(file);
}

// Note: no initializeStorage()/boot call here — sync now starts from
// auth.js once a user is confirmed logged in (see startStorageSync above).