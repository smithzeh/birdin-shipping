import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

// Supabase connection
const SUPABASE_URL = "https://rirnbinprxnscfrfwrqt.supabase.co"
const SUPABASE_KEY = "sb_publishable_12CvBFHAfesHOwh5sKJKaA_iryIF9Mi"

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)



/* =========================
   TRACK PARCEL (PUBLIC PAGE)
========================= */

const trackingForm = document.getElementById("tracking-form")

if (trackingForm) {

trackingForm.addEventListener("submit", async function(event) {

event.preventDefault()

const trackingCode = document.getElementById("customer-tracking-code").value
const resultDiv = document.getElementById("tracking-result")

try {

const { data, error } = await supabase
.from("parcels")
.select("*")
.eq("tracking_code", trackingCode)
.single()

if (error || !data) {

resultDiv.innerHTML = "<p>Tracking code not found.</p>"

} else {

resultDiv.innerHTML = `
<h3>Tracking Result</h3>
<p><strong>Tracking Code:</strong> ${data.tracking_code}</p>
<p><strong>Status:</strong> ${data.status}</p>
<p><strong>Current Location:</strong> ${data.current_location || "Processing Center"}</p>
<p><strong>Details:</strong> ${data.details}</p>
<p><strong>Estimated Delivery:</strong> ${data.estimated_days || "N/A"}</p>
`

}

} catch (error) {

console.error("Tracking error:", error)
alert("Failed to fetch parcel details.")

}

})

}



/* =========================
   PRINT RECEIPT
========================= */

const printBtn = document.getElementById("print-receipt")

if (printBtn) {

printBtn.addEventListener("click", function() {

const trackingCode = document.getElementById("customer-tracking-code").value
const resultDiv = document.getElementById("tracking-result").textContent

if (!trackingCode || !resultDiv) {

alert("Please track a parcel first to print receipt.")
return

}

const receiptContent = `
<html>
<head>
<title>Shipment Receipt</title>
</head>
<body>
<h1>Birdin Shipment</h1>
<p><strong>Tracking Code:</strong> ${trackingCode}</p>
<p>${resultDiv}</p>
<footer>
<p>&copy; 2026 Birdin Shipment</p>
</footer>
</body>
</html>
`

const receiptWindow = window.open("", "_blank")
receiptWindow.document.write(receiptContent)
receiptWindow.document.close()
receiptWindow.print()

})

}



/* =========================
   LOAD PARCELS (ADMIN DASHBOARD)
========================= */

async function loadParcels() {

const parcelList = document.getElementById("parcel-list")

if (!parcelList) return

try {

const { data, error } = await supabase
.from("parcels")
.select("*")

if (error) {
console.error("Error loading parcels:", error)
return
}

parcelList.innerHTML = ""

data.forEach(parcel => {

const row = document.createElement("tr")

row.innerHTML = `
<td>${parcel.tracking_code}</td>
<td>${parcel.sender_name || "N/A"}</td>
<td>${parcel.receiver_name || "N/A"}</td>
<td>${parcel.current_location || "N/A"}</td>
<td>${parcel.status || "Pending"}</td>
<td>
<button onclick="editParcel('${parcel.tracking_code}')">Edit</button>
<button onclick="deleteParcel('${parcel.tracking_code}')">Delete</button>
<button onclick="printParcelReceipt('${parcel.tracking_code}')">Print</button>
</td>
`

parcelList.appendChild(row)

})

} catch (error) {

console.error("Failed to load parcels:", error)

}

}



/* =========================
   DELETE PARCEL
========================= */

window.deleteParcel = async function(trackingCode) {

const confirmDelete = confirm("Delete this parcel?")

if (!confirmDelete) return

await supabase
.from("parcels")
.delete()
.eq("tracking_code", trackingCode)

loadParcels()

}



/* =========================
   EDIT PARCEL
========================= */

window.editParcel = function(trackingCode) {

window.location.href = `edit-parcel.html?trackingCode=${trackingCode}`

}



/* =========================
   PRINT RECEIPT FROM ADMIN
========================= */

window.printParcelReceipt = async function(trackingCode) {

const { data, error } = await supabase
.from("parcels")
.select("*")
.eq("tracking_code", trackingCode)
.single()

if (error || !data) {

alert("Failed to fetch parcel details.")
return

}

const receiptContent = `
<html>
<head>
<title>Shipment Receipt</title>
</head>
<body>
<h1>Birdin Shipment</h1>
<h2>Shipment Receipt</h2>

<p><strong>Tracking Code:</strong> ${data.tracking_code}</p>
<p><strong>Sender:</strong> ${data.sender_name}</p>
<p><strong>Receiver:</strong> ${data.receiver_name}</p>
<p><strong>Status:</strong> ${data.status}</p>
<p><strong>Current Location:</strong> ${data.current_location}</p>
<p><strong>Details:</strong> ${data.details}</p>

<footer>
<p>&copy; 2026 Birdin Shipment</p>
</footer>

</body>
</html>
`

const receiptWindow = window.open("", "_blank")
receiptWindow.document.write(receiptContent)
receiptWindow.document.close()
receiptWindow.print()

}



/* =========================
   INITIAL LOAD
========================= */

loadParcels()
