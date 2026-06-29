// ===== Storage Keys =====

const CATEGORY_KEY   = "billing_categories";
const PRODUCT_KEY    = "billing_products";
const BILL_KEY       = "billing_bills";
const BILL_COUNTER_KEY = "billing_bill_counter";


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

    if (!localStorage.getItem(BILL_COUNTER_KEY)) {
        localStorage.setItem(BILL_COUNTER_KEY, "0");
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


// ===== Bill Number =====
// Format: A1 → A100, then B1 → B100, etc.

function generateBillNumber() {
    const counter = parseInt(localStorage.getItem(BILL_COUNTER_KEY) || "0") + 1;
    localStorage.setItem(BILL_COUNTER_KEY, String(counter));

    const letterIndex = Math.floor((counter - 1) / 100);
    const number      = ((counter - 1) % 100) + 1;
    const letter      = String.fromCharCode(65 + letterIndex); // A, B, C...

    return `${letter}${number}`;
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
        categories:  getCategories(),
        products:    getProducts(),
        bills:       getBills(),
        billCounter: localStorage.getItem(BILL_COUNTER_KEY) || "0"
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

            if (data.categories)  saveCategories(data.categories);
            if (data.products)    saveProducts(data.products);
            if (data.bills)       saveBills(data.bills);
            if (data.billCounter) localStorage.setItem(BILL_COUNTER_KEY, data.billCounter);

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