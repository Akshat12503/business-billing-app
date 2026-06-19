// ===== Load Categories into Dropdown =====

function loadCategories() {

    const categorySelect = document.getElementById("categorySelect");

    categorySelect.innerHTML =
        '<option value="">Select Category</option>';

    const categories = getCategories();

    categories.forEach(category => {

        const option = document.createElement("option");

        option.value = category;
        option.textContent = category;

        categorySelect.appendChild(option);

    });

}



// ===== Load Products According to Category =====

function loadProducts() {

    const category = document.getElementById("categorySelect").value;

    const productSelect = document.getElementById("productSelect");

    productSelect.innerHTML =
        '<option value="">Select Product</option>';

    const products = getProducts();

    products
        .filter(product => product.category === category)
        .forEach(product => {

            const option = document.createElement("option");

            option.value = product.id;
            option.textContent = product.name;

            productSelect.appendChild(option);

        });

}



// ===== Get Product By ID =====

function getProductById(productId) {

    const products = getProducts();

    return products.find(
        product => product.id == productId
    );

}



// ===== Add Category =====

function addCategory(categoryName) {

    const categories = getCategories();

    categories.push(categoryName);

    saveCategories(categories);

    loadCategories();

}



// ===== Delete Category =====

function deleteCategory(categoryName) {

    let categories = getCategories();

    categories = categories.filter(
        category => category !== categoryName
    );

    saveCategories(categories);

    loadCategories();

}



// ===== Add Product =====

function addProduct(
    name,
    category,
    unit,
    localRate,
    generalRate,
    retailRate
) {

    const products = getProducts();

    products.push({

        id: generateProductId(),

        name: name,

        category: category,

        unit: unit,

        localRate: Number(localRate),

        generalRate: Number(generalRate),

        retailRate: Number(retailRate)

    });

    saveProducts(products);

}



// ===== Delete Product =====

function deleteProduct(productId) {

    let products = getProducts();

    products = products.filter(
        product => product.id != productId
    );

    saveProducts(products);

}



// ===== Update Product =====

function updateProduct(
    productId,
    name,
    category,
    unit,
    localRate,
    generalRate,
    retailRate
) {

    const products = getProducts();

    const product = products.find(
        p => p.id == productId
    );

    if (!product) return;


    product.name = name;
    product.category = category;
    product.unit = unit;
    product.localRate = Number(localRate);
    product.generalRate = Number(generalRate);
    product.retailRate = Number(retailRate);

    saveProducts(products);

}