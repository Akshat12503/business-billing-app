// ===== Storage Keys =====

const CATEGORY_KEY = "billing_categories";
const PRODUCT_KEY  = "billing_products";
const BILL_KEY     = "billing_bills";
const STOCK_KEY    = "billing_stock";


// ===== Initialize with Sample Data =====

function initializeStorage() {

    if (!localStorage.getItem(CATEGORY_KEY)) {
        localStorage.setItem(
            CATEGORY_KEY,
            JSON.stringify(["Rice", "Oil", "Spices"])
        );
    }

    if (!localStorage.getItem(PRODUCT_KEY)) {
        localStorage.setItem(
            PRODUCT_KEY,
            JSON.stringify([
                {
                    id: 1,
                    name: "Basmati Rice",
                    category: "Rice",
                    unit: "kg",
                    localRate: 80,
                    generalRate: 85,
                    retailRate: 90
                },
                {
                    id: 2,
                    name: "Mustard Oil",
                    category: "Oil",
                    unit: "kg",
                    localRate: 140,
                    generalRate: 145,
                    retailRate: 150
                }
            ])
        );
    }

    if (!localStorage.getItem(BILL_KEY)) {
        localStorage.setItem(BILL_KEY, JSON.stringify([]));
    }

    if (!localStorage.getItem(STOCK_KEY)) {
        localStorage.setItem(STOCK_KEY, JSON.stringify({}));
    }

}


// ===== Categories =====

function getCategories() {
    return JSON.parse(localStorage.getItem(CATEGORY_KEY)) || [];
}

function saveCategories(categories) {
    localStorage.setItem(CATEGORY_KEY, JSON.stringify(categories));
}


// ===== Products =====

function getProducts() {
    return JSON.parse(localStorage.getItem(PRODUCT_KEY)) || [];
}

function saveProducts(products) {
    localStorage.setItem(PRODUCT_KEY, JSON.stringify(products));
}

function updateProduct(id, name, category, unit, localRate, generalRate, retailRate) {
    const products = getProducts();
    const index = products.findIndex(p => p.id == id);
    if (index === -1) return;

    products[index] = {
        id: products[index].id,
        name,
        category,
        unit,
        localRate,
        generalRate,
        retailRate
    };

    saveProducts(products);
}


// ===== Bills =====

function getBills() {
    return JSON.parse(localStorage.getItem(BILL_KEY)) || [];
}

function saveBills(bills) {
    localStorage.setItem(BILL_KEY, JSON.stringify(bills));
}


// ===== Stock =====
// Stock is stored as { productId: quantity, ... }

function getStock() {
    return JSON.parse(localStorage.getItem(STOCK_KEY)) || {};
}

function saveStock(stock) {
    localStorage.setItem(STOCK_KEY, JSON.stringify(stock));
}

// Get stock level for a single product (returns 0 if never set)
function getStockById(productId) {
    const stock = getStock();
    return stock[productId] !== undefined ? stock[productId] : 0;
}

// Add stock manually (purchase/receive goods)
function addStock(productId, qty) {
    const stock = getStock();
    stock[productId] = parseFloat(((stock[productId] || 0) + qty).toFixed(3));
    saveStock(stock);
}

// Reduce stock when a bill item is added
function reduceStock(productId, qty) {
    const stock = getStock();
    const current = stock[productId] || 0;
    stock[productId] = parseFloat((current - qty).toFixed(3));
    saveStock(stock);
}

// Set stock to a specific value (for manual correction)
function setStock(productId, qty) {
    const stock = getStock();
    stock[productId] = parseFloat(qty.toFixed(3));
    saveStock(stock);
}

// Remove stock entry when a product is deleted
function removeStockEntry(productId) {
    const stock = getStock();
    delete stock[productId];
    saveStock(stock);
}


// ===== Helpers =====

function generateProductId() {
    const products = getProducts();
    if (products.length === 0) return 1;
    return Math.max(...products.map(p => p.id)) + 1;
}


// ===== Export =====

function exportData() {
    const backupData = {
        categories: getCategories(),
        products:   getProducts(),
        bills:      getBills(),
        stock:      getStock()
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

function importData(file) {
    const reader = new FileReader();

    reader.onload = function (event) {
        try {
            const data = JSON.parse(event.target.result);

            if (data.categories) saveCategories(data.categories);
            if (data.products)   saveProducts(data.products);
            if (data.bills)      saveBills(data.bills);
            if (data.stock)      saveStock(data.stock);

            alert("Data imported successfully.");
            location.reload();

        } catch (e) {
            alert("Invalid file. Please import a valid backup JSON.");
        }
    };

    reader.readAsText(file);
}


// ===== Boot =====

initializeStorage();