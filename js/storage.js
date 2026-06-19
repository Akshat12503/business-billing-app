// ===== Storage Keys =====

const CATEGORY_KEY = "categories";
const PRODUCT_KEY = "products";
const BILL_KEY = "bills";


// ===== Initialize Storage =====

function initializeStorage() {

    // Categories
    if (!localStorage.getItem(CATEGORY_KEY)) {

        const defaultCategories = [
            "Rice",
            "Oil",
            "Spices"
        ];

        localStorage.setItem(
            CATEGORY_KEY,
            JSON.stringify(defaultCategories)
        );
    }


    // Products
    if (!localStorage.getItem(PRODUCT_KEY)) {

        const defaultProducts = [

            {
                id: 1,
                name: "Basmati Rice",
                category: "Rice",
                unit: "kg",
                localRate: 80.00,
                generalRate: 85.00,
                retailRate: 90.00
            },

            {
                id: 2,
                name: "Mustard Oil",
                category: "Oil",
                unit: "kg",
                localRate: 140.00,
                generalRate: 145.00,
                retailRate: 150.00
            }

        ];

        localStorage.setItem(
            PRODUCT_KEY,
            JSON.stringify(defaultProducts)
        );
    }


    // Bills
    if (!localStorage.getItem(BILL_KEY)) {

        localStorage.setItem(
            BILL_KEY,
            JSON.stringify([])
        );

    }

}



// ===== Categories =====

function getCategories() {

    return JSON.parse(
        localStorage.getItem(CATEGORY_KEY)
    );

}


function saveCategories(categories) {

    localStorage.setItem(
        CATEGORY_KEY,
        JSON.stringify(categories)
    );

}



// ===== Products =====

function getProducts() {

    return JSON.parse(
        localStorage.getItem(PRODUCT_KEY)
    );

}


function saveProducts(products) {

    localStorage.setItem(
        PRODUCT_KEY,
        JSON.stringify(products)
    );

}



// ===== Bills =====

function getBills() {

    return JSON.parse(
        localStorage.getItem(BILL_KEY)
    );

}


function saveBills(bills) {

    localStorage.setItem(
        BILL_KEY,
        JSON.stringify(bills)
    );

}



// ===== Generate Product ID =====

function generateProductId() {

    const products = getProducts();

    if (products.length === 0) {
        return 1;
    }

    return products[products.length - 1].id + 1;
}



// ===== Start =====

initializeStorage();