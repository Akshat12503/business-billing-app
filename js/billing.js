// ===== Current Bill =====

let currentBill = [];


// ===== Add Item =====

function addItemToBill() {

    const sellerType =
        document.getElementById("sellerType").value;

    const productId =
        document.getElementById("productSelect").value;

    const quantity =
        parseFloat(document.getElementById("quantity").value);

    if (!productId || !quantity || quantity <= 0) {

        alert("Please select product and enter quantity.");

        return;

    }


    const product = getProductById(productId);

    let rate = 0;

    switch (sellerType) {

        case "local":
            rate = product.localRate;
            break;

        case "general":
            rate = product.generalRate;
            break;

        case "retail":
            rate = product.retailRate;
            break;

    }


    const total = quantity * rate;


    currentBill.push({

        productId: product.id,

        name: product.name,

        unit: product.unit,

        quantity: quantity,

        rate: rate,

        total: total

    });


    renderBill();


    document.getElementById("quantity").value = "";

}



// ===== Render Bill Table =====

function renderBill() {

    const tbody =
        document.getElementById("billTableBody");

    tbody.innerHTML = "";

    let grandTotal = 0;


    currentBill.forEach((item, index) => {

        grandTotal += item.total;

        tbody.innerHTML += `
        <tr>

            <td>${index + 1}</td>

            <td>${item.name}</td>

            <td>
                ${item.quantity.toFixed(3)}
                ${item.unit}
            </td>

            <td>
                ₹ ${item.rate.toFixed(2)}
            </td>

            <td>
                ₹ ${item.total.toFixed(2)}
            </td>

            <td>

                <button
                    class="btn btn-danger btn-sm"
                    onclick="removeItem(${index})">

                    X

                </button>

            </td>

        </tr>
        `;

    });


    document.getElementById("grandTotal").innerText =
        grandTotal.toFixed(2);

}



// ===== Remove Item =====

function removeItem(index) {

    currentBill.splice(index, 1);

    renderBill();

}



// ===== Clear Bill =====

function clearBill() {

    currentBill = [];

    renderBill();

}



// ===== Save Bill =====

function saveBill() {

    const customerName =
        document.getElementById("customerName").value.trim();

    if (customerName === "") {

        alert("Enter customer name.");

        return;

    }


    const bills = getBills();

    const now = new Date();


    const bill = {

        date: now.toLocaleDateString(),

        time: now.toLocaleTimeString(),

        customerName: customerName,

        items: currentBill,

        grandTotal: Number(
            document.getElementById("grandTotal").innerText
        )

    };


    bills.push(bill);

    saveBills(bills);


    alert("Bill saved successfully.");

}