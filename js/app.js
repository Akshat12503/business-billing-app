document.addEventListener("DOMContentLoaded", () => {

    loadCategories();

    loadProductTable();

});



// Category Change

document
    .getElementById("categorySelect")
    .addEventListener(
        "change",
        loadProducts
    );



// Add Item

document
    .getElementById("addItemBtn")
    .addEventListener(
        "click",
        addItemToBill
    );



// Save Bill

document
    .getElementById("saveBillBtn")
    .addEventListener(
        "click",
        saveBill
    );



// Clear Bill

document
    .getElementById("clearBillBtn")
    .addEventListener("click", () => {

        if (confirm("Clear bill?")) {

            clearBill();

        }

    });



// Product Management

document
    .getElementById("manageProductsBtn")
    .addEventListener("click", () => {

        const modal = new bootstrap.Modal(

            document.getElementById("productModal")

        );

        loadCategories();

        loadProductTable();

        modal.show();

    });



// Add Category

document
    .getElementById("addCategoryBtn")
    .addEventListener("click", () => {

        const categoryName =
            document.getElementById("newCategory").value;

        addCategory(categoryName);

        document.getElementById("newCategory").value = "";

    });



// Add Product

document
    .getElementById("addProductBtn")
    .addEventListener("click", () => {

        const name =
            document.getElementById("newProductName").value;

        const category =
            document.getElementById("newProductCategory").value;

        const unit =
            document.getElementById("newProductUnit").value;

        const localRate =
            document.getElementById("localRate").value;

        const generalRate =
            document.getElementById("generalRate").value;

        const retailRate =
            document.getElementById("retailRate").value;


        if (
            !name ||
            !category ||
            !localRate ||
            !generalRate ||
            !retailRate
        ) {

            alert("Fill all fields");

            return;

        }


        addProduct(

            name,
            category,
            unit,
            localRate,
            generalRate,
            retailRate

        );


        document.getElementById("newProductName").value = "";
        document.getElementById("localRate").value = "";
        document.getElementById("generalRate").value = "";
        document.getElementById("retailRate").value = "";

        loadProducts();

    });



// Export

document
    .getElementById("exportBtn")
    .addEventListener(
        "click",
        exportData
    );



// Import

document
    .getElementById("importBtn")
    .addEventListener("click", () => {

        document
            .getElementById("importFile")
            .click();

    });



document
    .getElementById("importFile")
    .addEventListener("change", event => {

        const file = event.target.files[0];

        if (file) {

            importData(file);

        }

    });



// PDF

document
    .getElementById("pdfBtn")
    .addEventListener(
        "click",
        generatePDF
    );



// WhatsApp

document
    .getElementById("whatsappBtn")
    .addEventListener("click", () => {

        alert("WhatsApp sharing coming next.");

    });



// Print

document
    .getElementById("printBtn")
    .addEventListener("click", () => {

        window.print();

    });

document
    .getElementById("billHistoryBtn")
    .addEventListener("click", () => {

        const modal =
            new bootstrap.Modal(

                document.getElementById(
                    "billHistoryModal"
                )

            );

        loadBillHistory();

        modal.show();

    });



document
    .getElementById("billSearch")
    .addEventListener(
        "keyup",
        searchBills
    );

// ===== Bill History =====

document
    .getElementById("billHistoryBtn")
    .addEventListener("click", () => {

        loadBillHistory();

        const modal = new bootstrap.Modal(
            document.getElementById(
                "billHistoryModal"
            )
        );

        modal.show();

    });

// ===== Search Bills =====

document
    .getElementById("billSearch")
    .addEventListener(
        "keyup",
        searchBills
    );

// ===== Delete Bill From Modal =====

document
    .getElementById("historyDeleteBtn")
    .addEventListener(
        "click",
        deleteBillFromModal
    );

// ===== PDF From Bill History =====

document
    .getElementById("historyPdfBtn")
    .addEventListener(
        "click",
        generatePDFFromHistory
    );

// ===== WhatsApp Share =====

document
    .getElementById(
        "historyWhatsappBtn"
    )
    .addEventListener(
        "click",
        shareBillOnWhatsapp
    );