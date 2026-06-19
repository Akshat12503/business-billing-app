    // ===== Page Load =====

document.addEventListener("DOMContentLoaded", () => {

    // Load categories
    loadCategories();

});



// ===== Category Change =====

document
    .getElementById("categorySelect")
    .addEventListener("change", () => {

        loadProducts();

    });




// ===== Add Item Button =====

document
    .getElementById("addItemBtn")
    .addEventListener("click", () => {

        addItemToBill();

    });




// ===== Save Bill Button =====

document
    .getElementById("saveBillBtn")
    .addEventListener("click", () => {

        saveBill();

    });




// ===== Clear Bill Button =====

document
    .getElementById("clearBillBtn")
    .addEventListener("click", () => {

        if (confirm("Clear current bill?")) {

            clearBill();

        }

    });




// ===== Export Button =====

document
    .getElementById("exportBtn")
    .addEventListener("click", () => {

        alert("Export feature coming soon.");

    });




// ===== Import Button =====

document
    .getElementById("importBtn")
    .addEventListener("click", () => {

        alert("Import feature coming soon.");

    });




// ===== Manage Products Button =====

document
    .getElementById("manageProductsBtn")
    .addEventListener("click", () => {

        alert("Product management panel coming soon.");

    });




// ===== PDF Button =====

document
    .getElementById("pdfBtn")
    .addEventListener("click", () => {

        alert("PDF generation coming soon.");

    });




// ===== Print Button =====

document
    .getElementById("printBtn")
    .addEventListener("click", () => {

        window.print();

    });




// ===== WhatsApp Button =====

document
    .getElementById("whatsappBtn")
    .addEventListener("click", () => {

        alert("WhatsApp sharing coming soon.");

    });