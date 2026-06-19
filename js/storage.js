// ===== Storage Keys =====

const CATEGORY_KEY = "categories";
const PRODUCT_KEY = "products";
const BILL_KEY = "bills";



// ===== Initialize Storage =====

function initializeStorage() {

    if (!localStorage.getItem(CATEGORY_KEY)) {

        localStorage.setItem(
            CATEGORY_KEY,
            JSON.stringify([
                "Rice",
                "Oil",
                "Spices"
            ])
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



// ===== Product ID =====

function generateProductId() {

    const products = getProducts();

    if (products.length === 0)
        return 1;

    return products[products.length - 1].id + 1;

}



// ===== Export =====

function exportData() {

    const backupData = {

        categories: getCategories(),

        products: getProducts(),

        bills: getBills()

    };


    const blob = new Blob(

        [JSON.stringify(backupData, null, 4)],

        {

            type: "application/json"

        }

    );


    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);

    const date = new Date()
        .toLocaleDateString("en-GB")
        .replaceAll("/", "-");

    link.download = `Backup_${date}.json`;

    link.click();

}



// ===== Import =====

function importData(file) {

    const reader = new FileReader();

    reader.onload = function (event) {

        const data = JSON.parse(event.target.result);

        if (data.categories)
            saveCategories(data.categories);

        if (data.products)
            saveProducts(data.products);

        if (data.bills)
            saveBills(data.bills);

        alert("Data imported successfully.");

        location.reload();

    };

    reader.readAsText(file);

}



// ===== Start =====

initializeStorage();