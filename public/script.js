import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

/* =========================
   SUPABASE CONNECTION
========================= */

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

    const trackingCode = document.getElementById("customer-tracking-code").value.trim()
    const resultDiv = document.getElementById("tracking-result")

    resultDiv.innerHTML = "<p>Tracking shipment...</p>"

    try {
      const { data, error } = await supabase
        .from("parcels")
        .select("*")
        .eq("tracking_code", trackingCode)
        .single()

      if (error || !data) {
        resultDiv.innerHTML = `
          <div style="padding:15px;border-radius:6px;background:#ffecec;color:#cc0000;">
          ❌ Tracking code not found. Please check and try again.
          </div>
        `
        return
      }

      /* =========================
         STATUS PROGRESS LOGIC
      ========================= */

      const statusSteps = {
        "pending": 1,
        "shipped": 2,
        "in transit": 3,
        "delivered": 4
      }

      const currentStep = statusSteps[(data.status || "").toLowerCase()] || 1
      const progressWidth = ((currentStep - 1) / 3) * 100

      resultDiv.innerHTML = `
        <div style="background:#f4f7fb;padding:20px;border-radius:8px;margin-top:15px">

        <h3 style="margin-bottom:15px;color:#2c3e50;">Shipment Details</h3>

        <p><strong>Tracking Code:</strong> ${data.tracking_code}</p>
        <p><strong>Sender:</strong> ${data.sender_name || "N/A"}</p>
        <p><strong>Receiver:</strong> ${data.receiver_name || "N/A"}</p>
        <p><strong>Current Location:</strong> ${data.current_location || "Processing Center"}</p>
        <p><strong>Package Details:</strong> ${data.details || "N/A"}</p>
        <p><strong>Expected Delivery:</strong> ${data.expected_delivery || "N/A"}</p>

        <div class="tracker">
          <h4>Status: ${data.status}</h4>
          <div class="tracker-line">
            <div class="progress-fill" style="width:${progressWidth}%"></div>

            <div class="step ${currentStep >= 1 ? "completed" : ""} ${currentStep === 1 ? "active" : ""}">
              <div class="dot"></div>
              <div class="label">Pending</div>
            </div>

            <div class="step ${currentStep >= 2 ? "completed" : ""} ${currentStep === 2 ? "active" : ""}">
              <div class="dot"></div>
              <div class="label">Shipped</div>
            </div>

            <div class="step ${currentStep >= 3 ? "completed" : ""} ${currentStep === 3 ? "active" : ""}">
              <div class="dot"></div>
              <div class="label">In Transit</div>
            </div>

            <div class="step ${currentStep >= 4 ? "completed" : ""} ${currentStep === 4 ? "active" : ""}">
              <div class="dot"></div>
              <div class="label">Delivered</div>
            </div>
          </div>
        </div>

        </div>
      `
    } catch (error) {
      console.error("Tracking error:", error)
      resultDiv.innerHTML = `
        <div style="padding:15px;border-radius:6px;background:#ffecec;color:#cc0000;">
        ⚠ Error fetching shipment. Try again later.
        </div>
      `
    }
  })
}

/* =========================
   PRINT RECEIPT (PUBLIC)
========================= */

const printBtn = document.getElementById("print-receipt")
if (printBtn) {
  printBtn.addEventListener("click", function() {
    const content = document.getElementById("tracking-result").innerHTML
    if (!content) {
      alert("Please track a parcel first.")
      return
    }

    const receiptWindow = window.open("", "_blank")
    receiptWindow.document.write(`
      <html>
      <head>
      <title>Shipment Receipt</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
        h1 { color: #ff6600; text-align: center; }
      </style>
      </head>
      <body>
      <h1>Birdin Shipment</h1>
      ${content}
      <p style="text-align:center;">© 2026 Birdin Shipment</p>
      </body>
      </html>
    `)
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
    const { data, error } = await supabase.from("parcels").select("*")
    if (error) throw error

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
          <button onclick="editParcel('${parcel.id}')">Edit</button>
          <button onclick="deleteParcel('${parcel.id}')">Delete</button>
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

window.deleteParcel = async function(id) {
  const confirmDelete = confirm("Delete this parcel?")
  if (!confirmDelete) return

  await supabase.from("parcels").delete().eq("id", id)
  loadParcels()
}

/* =========================
   EDIT PARCEL
========================= */

window.editParcel = async function(id) {
  try {
    const { data, error } = await supabase.from("parcels").select("*").eq("id", id).single()
    if (error || !data) throw error

    // Open the same parcel creation form with prefilled data
    document.getElementById("parcel-form").style.display = "block"
    document.getElementById("overlay").style.display = "block"

    document.getElementById("parcel_id").value = data.id
    document.getElementById("sender_name").value = data.sender_name
    document.getElementById("sender_email").value = data.sender_email
    document.getElementById("sender_address").value = data.sender_address
    document.getElementById("receiver_name").value = data.receiver_name
    document.getElementById("receiver_email").value = data.receiver_email
    document.getElementById("receiver_address").value = data.receiver_address
    document.getElementById("destination").value = data.destination
    document.getElementById("parcel_details").value = data.parcel_details
    document.getElementById("date_sent").value = data.date_sent
    document.getElementById("expected_delivery").value = data.expected_delivery
    document.getElementById("status").value = data.status
    document.getElementById("current_location").value = data.current_location
  } catch (error) {
    console.error("Error fetching parcel for edit:", error)
    alert("Failed to fetch parcel. Check console.")
  }
}

/* =========================
   INITIAL LOAD
========================= */

loadParcels()
