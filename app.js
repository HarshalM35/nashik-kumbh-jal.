/* =========================================================
   NASHIK KUMBH JAL
   APP.JS
   Cart + Weight Shipping + PIN Shipping + Dynamic UPI QR
   + FIREBASE ORDER SAVE
   + ORDER ID AUTO SAVE / COPY / TRACK
   + INVOICE
   ========================================================= */


/* =========================================================
   0. FIREBASE
   ========================================================= */

let firebaseDB = null;
let firebaseAuth = null;
let firebaseReady = false;

async function initFirebase() {

    try {

        const firebase =
            await import("./firebase.js");

        firebaseDB = firebase.db;
        firebaseAuth = firebase.auth;

        await firebase.signInAnonymously(
            firebaseAuth
        );

        firebaseReady = true;

        console.log(
            "Firebase connected successfully."
        );

    } catch (error) {

        console.error(
            "Firebase connection error:",
            error
        );

        firebaseReady = false;
    }
}

initFirebase();


/* =========================================================
   1. UPI PAYMENT DETAILS
   ========================================================= */

const UPI_ID = "8468864800@naviaxis";
const BUSINESS_NAME = "Nashik Kumbh Jal";


/* =========================================================
   2. PRODUCT PACKED WEIGHTS
   ========================================================= */

const PRODUCT_WEIGHTS = {
    "250 ML": 350,
    "500 ML": 600,
    "1 Litre": 1100
};


/* =========================================================
   3. CART
   ========================================================= */

let cart =
    JSON.parse(
        localStorage.getItem("kumbhJalCart")
    ) || [];


/* =========================================================
   4. ADD TO CART
   ========================================================= */

function addToCart(name, price) {

    const existing =
        cart.find(item => item.name === name);

    if (existing) {

        existing.quantity += 1;

    } else {

        cart.push({
            name: name,
            price: Number(price),
            quantity: 1
        });
    }

    saveCart();

    alert(name + " added to cart!");
}


/* =========================================================
   5. SAVE CART
   ========================================================= */

function saveCart() {

    localStorage.setItem(
        "kumbhJalCart",
        JSON.stringify(cart)
    );

    updateCart();
}


/* =========================================================
   6. PRODUCT TOTAL
   ========================================================= */

function getProductTotal() {

    return cart.reduce(
        (total, item) => {

            return total +
                Number(item.price) *
                Number(item.quantity);

        },
        0
    );
}


/* =========================================================
   7. TOTAL PACKED WEIGHT
   ========================================================= */

function getTotalWeight() {

    return cart.reduce(
        (total, item) => {

            const weight =
                PRODUCT_WEIGHTS[item.name] || 0;

            return total +
                weight *
                Number(item.quantity);

        },
        0
    );
}


/* =========================================================
   8. UPDATE CART
   ========================================================= */

function updateCart() {

    const cartContainer =
        document.getElementById("cartItems");

    const cartCount =
        document.getElementById("cartCount");

    const cartTotal =
        document.getElementById("cartTotal");


    if (cartCount) {

        cartCount.innerText =
            cart.reduce(
                (sum, item) =>
                    sum + Number(item.quantity),
                0
            );
    }


    if (!cartContainer) return;


    cartContainer.innerHTML = "";


    if (cart.length === 0) {

        cartContainer.innerHTML =
            "<p>Your cart is empty.</p>";

        if (cartTotal) {

            cartTotal.innerText = "₹0";
        }

        return;
    }


    cart.forEach(
        (item, index) => {

            cartContainer.innerHTML += `

                <div class="cart-item">

                    <div>

                        <strong>
                            ${item.name}
                        </strong>

                        <p>
                            ₹${item.price}
                            ×
                            ${item.quantity}
                        </p>

                    </div>


                    <div>

                        <button
                            onclick="decreaseQuantity(${index})"
                        >
                            −
                        </button>


                        <span style="margin:0 8px;">
                            ${item.quantity}
                        </span>


                        <button
                            onclick="increaseQuantity(${index})"
                        >
                            +
                        </button>


                        <button
                            onclick="removeItem(${index})"
                        >
                            ✕
                        </button>

                    </div>

                </div>
            `;
        }
    );


    if (cartTotal) {

        cartTotal.innerText =
            "₹" + getProductTotal();
    }
}


/* =========================================================
   9. QUANTITY FUNCTIONS
   ========================================================= */

function increaseQuantity(index) {

    cart[index].quantity++;

    saveCart();
}


function decreaseQuantity(index) {

    if (cart[index].quantity > 1) {

        cart[index].quantity--;

    } else {

        cart.splice(index, 1);
    }

    saveCart();
}


function removeItem(index) {

    cart.splice(index, 1);

    saveCart();
}


/* =========================================================
   10. CART OPEN / CLOSE
   ========================================================= */

function openCart() {

    const modal =
        document.getElementById("cartModal");

    if (modal) {

        modal.style.display = "flex";
    }

    updateCart();
}


function closeCart() {

    const modal =
        document.getElementById("cartModal");

    if (modal) {

        modal.style.display = "none";
    }
}


/* =========================================================
   11. GO TO ORDER
   ========================================================= */

function goToOrder() {

    if (cart.length === 0) {

        alert("Your cart is empty!");

        return;
    }


    closeCart();


    const orderSection =
        document.getElementById("order");


    if (orderSection) {

        orderSection.scrollIntoView({
            behavior: "smooth"
        });
    }
}


/* =========================================================
   12. GET CUSTOMER DETAILS
   ========================================================= */

function getCustomerDetails() {

    const orderBox =
        document.querySelector(".order-box");


    if (!orderBox) {

        return null;
    }


    const inputs =
        orderBox.querySelectorAll("input");

    const textarea =
        orderBox.querySelector("textarea");


    let name = "";
    let mobile = "";
    let pin = "";


    if (inputs[0]) {

        name =
            inputs[0].value.trim();
    }


    if (inputs[1]) {

        mobile =
            inputs[1].value.trim();
    }


    const address =
        textarea
            ? textarea.value.trim()
            : "";


    if (inputs.length >= 3) {

        pin =
            inputs[inputs.length - 1]
                .value
                .trim();
    }


    return {
        name: name,
        mobile: mobile,
        address: address,
        pin: pin
    };
}


/* =========================================================
   13. START ORDER
   ========================================================= */

function startOrder() {

    if (cart.length === 0) {

        alert(
            "Please add some Nashik Kumbh Jal first."
        );

        return;
    }


    const customer =
        getCustomerDetails();


    if (!customer) {

        alert(
            "Order form not found."
        );

        return;
    }


    if (
        !customer.name ||
        !customer.mobile ||
        !customer.address ||
        !customer.pin
    ) {

        alert(
            "Please fill all customer details."
        );

        return;
    }


    if (
        !/^[0-9]{10}$/.test(
            customer.mobile
        )
    ) {

        alert(
            "Please enter a valid 10-digit mobile number."
        );

        return;
    }


    if (
        !/^[0-9]{6}$/.test(
            customer.pin
        )
    ) {

        alert(
            "Please enter a valid 6-digit PIN code."
        );

        return;
    }


    const productTotal =
        getProductTotal();


    const totalWeight =
        getTotalWeight();


    const shippingDetails =
        calculateShipping(
            customer.pin,
            totalWeight
        );


    const finalAmount =
        productTotal +
        shippingDetails.total;


    showPaymentScreen(
        productTotal,
        totalWeight,
        shippingDetails,
        finalAmount,
        customer
    );
}


/* =========================================================
   14. PIN CATEGORY
   ========================================================= */

function getPinCategory(pin) {

    pin = String(pin);


    if (pin.startsWith("422")) {

        return "local";
    }


    if (
        pin.startsWith("40") ||
        pin.startsWith("41") ||
        pin.startsWith("42") ||
        pin.startsWith("43") ||
        pin.startsWith("44")
    ) {

        return "state";
    }


    return "other";
}


/* =========================================================
   15. SHIPPING CALCULATION
   ========================================================= */

function calculateShipping(
    pin,
    weight
) {

    const category =
        getPinCategory(pin);


    let postage = 0;

    let categoryName = "";


    if (category === "local") {

        categoryName =
            "Nashik Local";

    }

    else if (category === "state") {

        categoryName =
            "Maharashtra";

    }

    else {

        categoryName =
            "Other State";
    }


    if (weight <= 500) {

        if (category === "local") {

            postage = 28;

        }

        else if (category === "state") {

            postage = 65;

        }

        else {

            postage = 72;
        }
    }


    else if (weight <= 1000) {

        if (category === "local") {

            postage = 48;

        }

        else if (category === "state") {

            postage = 91;

        }

        else {

            postage = 114;
        }
    }


    else if (weight <= 1500) {

        if (category === "local") {

            postage = 60;

        }

        else if (category === "state") {

            postage = 117;

        }

        else {

            postage = 171;
        }
    }


    else if (weight <= 2000) {

        if (category === "local") {

            postage = 87;

        }

        else if (category === "state") {

            postage = 160;

        }

        else {

            postage = 239;
        }
    }


    else if (weight <= 3000) {

        if (category === "local") {

            postage = 116;

        }

        else if (category === "state") {

            postage = 219;

        }

        else {

            postage = 337;
        }
    }


    else if (weight <= 4000) {

        if (category === "local") {

            postage = 145;

        }

        else if (category === "state") {

            postage = 268;

        }

        else {

            postage = 420;
        }
    }


    else if (weight <= 5000) {

        if (category === "local") {

            postage = 174;

        }

        else if (category === "state") {

            postage = 324;

        }

        else {

            postage = 515;
        }
    }


    else {

        if (category === "local") {

            postage = 174;

        }

        else if (category === "state") {

            postage = 324;

        }

        else {

            postage = 515;
        }


        const extraWeight =
            weight - 5000;


        const extraKg =
            Math.ceil(
                extraWeight / 1000
            );


        let extraRate = 0;


        if (category === "local") {

            extraRate = 30;

        }

        else if (category === "state") {

            extraRate = 50;

        }

        else {

            extraRate = 90;
        }


        postage +=
            extraKg * extraRate;
    }


    const packingCharge = 15;


    return {

        category:
            categoryName,

        postage:
            postage,

        packing:
            packingCharge,

        total:
            postage +
            packingCharge
    };
}


/* =========================================================
   16. CREATE DYNAMIC UPI LINK
   ========================================================= */

function createUPILink(
    amount,
    orderId
) {

    const upiLink =
        "upi://pay" +

        "?pa=" +
        encodeURIComponent(
            UPI_ID
        ) +

        "&pn=" +
        encodeURIComponent(
            BUSINESS_NAME
        ) +

        "&am=" +
        encodeURIComponent(
            Number(amount).toFixed(2)
        ) +

        "&cu=INR" +

        "&tn=" +
        encodeURIComponent(
            "Nashik Kumbh Jal " +
            orderId
        );


    return upiLink;
}


/* =========================================================
   17. GENERATE QR
   ========================================================= */

function generateQR(
    qrElement,
    upiLink
) {

    function makeQR() {

        qrElement.innerHTML = "";


        new QRCode(
            qrElement,
            {
                text: upiLink,

                width: 230,

                height: 230,

                correctLevel:
                    QRCode.CorrectLevel.H
            }
        );
    }


    if (
        typeof QRCode !==
        "undefined"
    ) {

        makeQR();

        return;
    }


    const script =
        document.createElement(
            "script"
        );


    script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";


    script.onload =
        function () {

            makeQR();
        };


    script.onerror =
        function () {

            qrElement.innerHTML = `

                <p style="
                    color:#ff7777;
                    padding:20px;
                ">

                    QR generator could not load.

                    <br><br>

                    Please check your
                    internet connection.

                </p>
            `;
        };


    document.head.appendChild(
        script
    );
}


/* =========================================================
   18. PAYMENT SCREEN
   ========================================================= */

function showPaymentScreen(
    productTotal,
    totalWeight,
    shippingDetails,
    finalAmount,
    customer
) {

    const old =
        document.getElementById(
            "paymentOverlay"
        );


    if (old) {

        old.remove();
    }


    const tempOrderId =
        "KJ" +
        Date.now()
            .toString()
            .slice(-8);


    const upiLink =
        createUPILink(
            finalAmount,
            tempOrderId
        );


    const overlay =
        document.createElement(
            "div"
        );


    overlay.id =
        "paymentOverlay";


    overlay.style.cssText = `

        position:fixed;

        inset:0;

        background:
            rgba(0,0,0,0.90);

        z-index:99999;

        display:flex;

        justify-content:center;

        align-items:center;

        padding:20px;

        overflow:auto;
    `;


    overlay.innerHTML = `

        <div style="

            width:100%;

            max-width:430px;

            background:#08152b;

            color:white;

            border-radius:22px;

            padding:25px;

            text-align:center;

            border:
                1px solid
                rgba(255,215,120,.45);

            box-shadow:
                0 20px 60px
                rgba(0,0,0,.6);

        ">


            <h2 style="
                color:#ffd76a;
                margin-top:0;
            ">

                🪔 Divine Payment

            </h2>


            <p style="opacity:.8;">

                Nashik Kumbh Jal

            </p>


            <div style="

                background:
                    rgba(255,255,255,.06);

                padding:16px;

                border-radius:15px;

                margin:15px 0;

                text-align:left;

            ">


                <p>
                    Product Total:
                    <strong>
                        ₹${productTotal}
                    </strong>
                </p>


                <p>
                    Packed Weight:
                    <strong>
                        ${totalWeight} g
                    </strong>
                </p>


                <p>
                    Delivery:
                    <strong>
                        ${shippingDetails.category}
                    </strong>
                </p>


                <p>
                    India Post:
                    <strong>
                        ₹${shippingDetails.postage}
                    </strong>
                </p>


                <p>
                    Packing:
                    <strong>
                        ₹${shippingDetails.packing}
                    </strong>
                </p>


                <hr style="
                    border:0;
                    border-top:
                        1px solid
                        rgba(255,255,255,.15);
                ">


                <p style="

                    font-size:25px;

                    color:#ffd76a;

                    margin-bottom:5px;

                ">

                    Final Amount:

                    <strong>
                        ₹${finalAmount}
                    </strong>

                </p>


                <p style="

                    font-size:13px;

                    color:#9de7ff;

                ">

                    Scan QR to pay exactly
                    ₹${finalAmount}

                </p>

            </div>


            <div

                id="dynamicUPIQR"

                style="

                    width:230px;

                    height:230px;

                    margin:15px auto;

                    background:white;

                    padding:10px;

                    border-radius:15px;

                    box-sizing:content-box;

                    display:flex;

                    align-items:center;

                    justify-content:center;

                "

            >

                <span style="
                    color:#222;
                    font-size:13px;
                ">

                    Generating QR...

                </span>

            </div>


            <p style="
                font-size:12px;
                color:#aaa;
            ">

                UPI:
                ${UPI_ID}

            </p>


            <p style="
                font-size:13px;
                color:#ffd76a;
            ">

                Amount is fixed at
                ₹${finalAmount}

            </p>


            <input

                id="utrNumber"

                type="text"

                placeholder=
                    "Enter UTR / Transaction ID"

                style="

                    width:100%;

                    box-sizing:border-box;

                    margin-top:15px;

                    padding:14px;

                    border-radius:10px;

                    border:
                        1px solid #555;

                    background:#101f38;

                    color:white;

                    outline:none;

                "

            >


            <button

                onclick="submitPayment()"

                style="

                    width:100%;

                    margin-top:14px;

                    padding:14px;

                    border:0;

                    border-radius:12px;

                    background:
                        linear-gradient(
                            135deg,
                            #ffd76a,
                            #ffad42
                        );

                    color:#241600;

                    font-weight:bold;

                    font-size:16px;

                    cursor:pointer;

                "

            >

                Payment Done —
                Submit Order

            </button>


            <button

                onclick="closePayment()"

                style="

                    margin-top:12px;

                    background:none;

                    border:0;

                    color:#aaa;

                    cursor:pointer;

                "

            >

                Cancel

            </button>


        </div>
    `;


    document.body.appendChild(
        overlay
    );


    const qrElement =
        document.getElementById(
            "dynamicUPIQR"
        );


    generateQR(
        qrElement,
        upiLink
    );


    window.pendingKumbhOrder = {

        orderId:
            tempOrderId,

        customer:
            customer,

        cart:
            JSON.parse(
                JSON.stringify(cart)
            ),

        productTotal:
            productTotal,

        totalWeight:
            totalWeight,

        shipping:
            shippingDetails.total,

        shippingDetails:
            shippingDetails,

        finalAmount:
            finalAmount,

        upiId:
            UPI_ID,

        createdAt:
            new Date().toISOString()
    };
}


/* =========================================================
   19. SUBMIT PAYMENT + FIREBASE
   ========================================================= */

async function submitPayment() {

    const utrInput =
        document.getElementById(
            "utrNumber"
        );


    if (!utrInput) return;


    const utr =
        utrInput.value.trim();


    if (!utr) {

        alert(
            "Please enter UTR / Transaction ID."
        );

        return;
    }


    if (!window.pendingKumbhOrder) {

        alert(
            "Order session expired. Please try again."
        );

        return;
    }


    /*
       Firebase connection check
    */

    if (!firebaseReady) {

        alert(
            "Firebase is still connecting. Please wait a moment and try again."
        );

        return;
    }


    const order = {

        ...window.pendingKumbhOrder,

        utr:
            utr,

        paymentStatus:
            "Pending Verification",

        orderStatus:
            "Payment Submitted",

        trackingNumber:
            "",

        createdAt:
            new Date().toISOString()
    };


    /* =====================================================
       SAVE TO FIRESTORE
       ===================================================== */

    try {

        const firestore =
            await import(
                "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js"
            );


        const orderRef =
            firestore.doc(
                firebaseDB,
                "Orders",
                order.orderId
            );


        await firestore.setDoc(
            orderRef,
            {
                ...order,

                customerUID:
                    firebaseAuth.currentUser
                        ? firebaseAuth.currentUser.uid
                        : "",

                firebaseSavedAt:
                    new Date().toISOString()
            }
        );


        console.log(
            "Order saved to Firebase:",
            order.orderId
        );


    } catch (error) {

        console.error(
            "Firebase order save failed:",
            error
        );


        alert(
            "Order could not be saved online. Please try again."
        );

        return;
    }


    /* =====================================================
       CURRENT ORDER
       ===================================================== */

    localStorage.setItem(
        "kumbhJalCurrentOrder",
        JSON.stringify(order)
    );


    /* =====================================================
       SAVE ORDER ID FOR EASY TRACKING
       ===================================================== */

    localStorage.setItem(
        "kumbhJalLastOrderId",
        order.orderId
    );


    localStorage.setItem(
        "kumbhJalLastOrderMobile",
        order.customer.mobile
    );


    /* =====================================================
       ALL ORDERS
       ===================================================== */

    const orders =
        JSON.parse(
            localStorage.getItem(
                "kumbhJalOrders"
            )
        ) || [];


    orders.push(order);


    localStorage.setItem(
        "kumbhJalOrders",
        JSON.stringify(orders)
    );


    /* =====================================================
       CLEAR CART
       ===================================================== */

    cart = [];

    saveCart();


    closePayment();


    showOrderSuccess(
        order
    );
}


/* =========================================================
   20. CLOSE PAYMENT
   ========================================================= */

function closePayment() {

    const overlay =
        document.getElementById(
            "paymentOverlay"
        );


    if (overlay) {

        overlay.remove();
    }


    window.pendingKumbhOrder =
        null;
}


/* =========================================================
   21. SUCCESS SCREEN
   ========================================================= */

function showOrderSuccess(order) {

    /* =====================================================
       SAVE ORDER ID AGAIN
       ===================================================== */

    localStorage.setItem(
        "kumbhJalLastOrderId",
        order.orderId
    );


    localStorage.setItem(
        "kumbhJalLastOrderMobile",
        order.customer.mobile
    );


    const overlay =
        document.createElement(
            "div"
        );


    overlay.style.cssText = `

        position:fixed;

        inset:0;

        background:
            rgba(0,0,0,.90);

        z-index:100000;

        display:flex;

        align-items:center;

        justify-content:center;

        padding:20px;

        overflow:auto;

    `;


    overlay.innerHTML = `

        <div style="

            max-width:420px;

            width:100%;

            background:#08152b;

            color:white;

            padding:30px;

            border-radius:22px;

            text-align:center;

            border:
                1px solid
                rgba(255,215,120,.35);

            box-shadow:
                0 20px 60px
                rgba(0,0,0,.5);

        ">


            <div style="
                font-size:55px;
            ">

                🪔

            </div>


            <h2 style="
                color:#ffd76a;
            ">

                Order Submitted!

            </h2>


            <p>

                Thank you for ordering
                Nashik Kumbh Jal.

            </p>


            <!-- ORDER ID -->

            <div style="

                margin:20px 0;

                padding:15px;

                background:
                    rgba(255,255,255,.06);

                border-radius:14px;

                border:
                    1px solid
                    rgba(255,255,255,.12);

            ">

                <p style="
                    margin:0 0 7px;
                    color:#aaa;
                    font-size:13px;
                ">

                    Your Order ID

                </p>


                <h2
                    id="successOrderId"
                    style="
                        color:#ffd76a;
                        margin:0;
                        letter-spacing:1px;
                    "
                >

                    ${order.orderId}

                </h2>

            </div>


            <!-- COPY ORDER ID -->

            <button

                onclick="
                    copyOrderId(
                        '${order.orderId}'
                    )
                "

                style="

                    width:100%;

                    padding:13px;

                    border:0;

                    border-radius:10px;

                    background:#9de7ff;

                    color:#061321;

                    cursor:pointer;

                    font-weight:bold;

                    font-size:15px;

                "

            >

                📋 Copy Order ID

            </button>


            <!-- TRACK ORDER -->

            <button

                onclick="
                    window.location.href =
                    'track.html'
                "

                style="

                    width:100%;

                    margin-top:10px;

                    padding:13px;

                    border:0;

                    border-radius:10px;

                    background:
                        linear-gradient(
                            135deg,
                            #ffd76a,
                            #ffad42
                        );

                    color:#241600;

                    cursor:pointer;

                    font-weight:bold;

                    font-size:15px;

                "

            >

                📦 Track Order

            </button>


            <!-- INVOICE -->

            <button

                onclick="
                    window.location.href =
                    'invoice.html?orderId=${order.orderId}'
                "

                style="

                    width:100%;

                    margin-top:10px;

                    padding:13px;

                    border:0;

                    border-radius:10px;

                    background:#ffffff;

                    color:#061321;

                    cursor:pointer;

                    font-weight:bold;

                    font-size:15px;

                "

            >

                🧾 View Invoice

            </button>


            <p style="margin-top:18px;">

                Amount:

                <strong>
                    ₹${order.finalAmount}
                </strong>

            </p>


            <p>

                Weight:

                <strong>
                    ${order.totalWeight} g
                </strong>

            </p>


            <p style="
                color:#9de7ff;
            ">

                Payment will be verified
                before dispatch.

            </p>


            <button

                onclick="
                    this.parentElement
                    .parentElement
                    .remove()
                "

                style="

                    margin-top:8px;

                    padding:13px 25px;

                    border:0;

                    border-radius:10px;

                    background:#333;

                    color:white;

                    cursor:pointer;

                    font-weight:bold;

                "

            >

                Done

            </button>


        </div>
    `;


    document.body.appendChild(
        overlay
    );
}


/* =========================================================
   22. COPY ORDER ID
   ========================================================= */

window.copyOrderId =
    async function (orderId) {

        try {

            await navigator.clipboard.writeText(
                orderId
            );


            alert(
                "Order ID copied successfully!"
            );

        } catch (error) {

            const tempInput =
                document.createElement(
                    "input"
                );


            tempInput.value =
                orderId;


            document.body.appendChild(
                tempInput
            );


            tempInput.select();


            document.execCommand(
                "copy"
            );


            tempInput.remove();


            alert(
                "Order ID copied successfully!"
            );
        }
    };


/* =========================================================
   23. PAGE LOAD
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        updateCart();

    }
);