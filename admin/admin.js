import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// ----------------------------
// SUPABASE CONNECTION
// ----------------------------
const SUPABASE_URL = "https://rirnbinprxnscfrfwrqt.supabase.co";
const SUPABASE_KEY = "sb_publishable_12CvBFHAfesHOwh5sKJKaA_iryIF9Mi";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ----------------------------
// Generate random tracking code
// ----------------------------
function generateTrackingCode() {
  return "TRK" + Math.floor(100000 + Math.random() * 900000);
}

// ----------------------------
// LOAD PARCELS INTO TABLE
// ----------------------------
async function loadParcels() {
  const table = document.getElementById("parcel-list");
  if (!table) return;

  table.innerHTML = "";

  try {
    const { data, error } = await supabase
      .from("parcels")
      .select("*")
      .order("date_sent", { ascending: false });

    if (error) throw error;

    data.forEach(parcel => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${parcel.tracking_code}</td>
        <td>${parcel.sender_name || parcel.sender_address}</td>
        <td>${parcel.receiver_name || parcel.receiver_address}</td>
        <td>${parcel.current_location || ""}</td>
        <td>${parcel.status}</td>
        <td>
          <button onclick="editParcel('${parcel.id}')">Edit</button>
          <button onclick="deleteParcel('${parcel.id}')">Delete</button>
          <button onclick="printParcel('${parcel.id}')">Print</button>
        </td>
      `;
      table.appendChild(row);
    });
  } catch (err) {
    console.error("Error loading parcels:", err);
    alert("Failed to load parcels. Check console.");
  }
}

// ----------------------------
// DELETE PARCEL
// ----------------------------
window.deleteParcel = async function(id) {
  const confirmDelete = confirm("Delete this parcel?");
  if (!confirmDelete) return;

  try {
    const { error } = await supabase.from("parcels").delete().eq("id", id);
    if (error) throw error;
    loadParcels();
  } catch (err) {
    console.error("Error deleting parcel:", err);
    alert("Failed to delete parcel. Check console.");
  }
};

// ----------------------------
// EDIT PARCEL
// ----------------------------
window.editParcel = async function(id) {
  try {
    const { data, error } = await supabase.from("parcels").select("*").eq("id", id).single();
    if (error) throw error;

    // Show the form popup
    document.getElementById("parcel-form").style.display = "block";
    document.getElementById("overlay").style.display = "block";

    // Prefill form fields
    document.getElementById("parcel_id").value = data.id;
    document.getElementById("sender_name").value = data.sender_name || "";
    document.getElementById("sender_email").value = data.sender_email || "";
    document.getElementById("sender_address").value = data.sender_address || "";
    document.getElementById("receiver_name").value = data.receiver_name || "";
    document.getElementById("receiver_email").value = data.receiver_email || "";
    document.getElementById("receiver_address").value = data.receiver_address || "";
    document.getElementById("destination").value = data.destination || "";
    document.getElementById("parcel_details").value = data.parcel_details || "";
    document.getElementById("date_sent").value = data.date_sent || "";
    document.getElementById("expected_delivery").value = data.expected_delivery || "";
    document.getElementById("status").value = data.status || "Pending";
    document.getElementById("current_location").value = data.current_location || "";

    // Scroll to form
    document.getElementById("parcel-form").scrollIntoView({ behavior: "smooth" });
  } catch (err) {
    console.error("Error fetching parcel:", err);
    alert("Failed to fetch parcel. Check console.");
  }
};

// ----------------------------
// PRINT PARCEL RECEIPT
// ----------------------------
window.printParcel = async function(id) {
  try {
    const { data, error } = await supabase.from("parcels").select("*").eq("id", id).single();
    if (error) throw error;

    const receiptHTML = `
    <html>
    <head>
      <title>Shipment Receipt</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
        .receipt { max-width: 700px; margin: auto; border: 1px solid #ccc; padding: 30px; border-radius: 8px; }
        .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #ff6600; padding-bottom: 10px; margin-bottom: 20px; }
        .logo { height: 60px; }
        .company { font-size: 24px; font-weight: bold; color: #ff6600; }
        .title { text-align: center; font-size: 22px; margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        td { padding: 10px; border-bottom: 1px solid #eee; }
        .label { font-weight: bold; width: 200px; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #777; }
        .tracking { font-size: 18px; font-weight: bold; text-align: center; margin-top: 10px; }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <div><img src="logo.png" class="logo"></div>
          <div class="company">Birdin Shipment</div>
        </div>
        <div class="title">Shipment Receipt</div>
        <div class="tracking">Tracking Code: ${data.tracking_code}</div>
        <table>
          <tr><td class="label">Sender</td><td>${data.sender_name} (${data.sender_email})</td></tr>
          <tr><td class="label">Receiver</td><td>${data.receiver_name} (${data.receiver_email})</td></tr>
          <tr><td class="label">Destination</td><td>${data.destination}</td></tr>
          <tr><td class="label">Parcel Details</td><td>${data.parcel_details}</td></tr>
          <tr><td class="label">Current Status</td><td>${data.status}</td></tr>
          <tr><td class="label">Current Location</td><td>${data.current_location}</td></tr>
          <tr><td class="label">Date Sent</td><td>${data.date_sent}</td></tr>
          <tr><td class="label">Expected Delivery</td><td>${data.expected_delivery}</td></tr>
        </table>
        <div class="footer">
          <p>Birdin Shipment Logistics</p>
          <p>Thank you for shipping with us.</p>
          <p>© 2026 Birdin Shipment</p>
        </div>
      </div>
      <script>window.print();</script>
    </body>
    </html>
    `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
  } catch (err) {
    console.error("Error printing parcel:", err);
    alert("Failed to print parcel. Check console.");
  }
};

// ----------------------------
// HANDLE CREATE OR UPDATE PARCEL
// ----------------------------
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("parcel-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const parcelId = document.getElementById("parcel_id").value;

    const parcel = {
      sender_name: document.getElementById("sender_name").value,
      sender_email: document.getElementById("sender_email").value,
      sender_address: document.getElementById("sender_address").value,
      receiver_name: document.getElementById("receiver_name").value,
      receiver_email: document.getElementById("receiver_email").value,
      receiver_address: document.getElementById("receiver_address").value,
      destination: document.getElementById("destination").value,
      parcel_details: document.getElementById("parcel_details").value,
      date_sent: document.getElementById("date_sent").value,
      expected_delivery: document.getElementById("expected_delivery").value,
      status: document.getElementById("status").value,
      current_location: document.getElementById("current_location").value
    };

    try {
      if (parcelId) {
        // Update existing parcel
        const { error } = await supabase.from("parcels").update(parcel).eq("id", parcelId);
        if (error) throw error;
        alert("Parcel updated successfully!");
      } else {
        // Create new parcel
        parcel.tracking_code = generateTrackingCode();
        const { error } = await supabase.from("parcels").insert([parcel]);
        if (error) throw error;
        alert(`Parcel created successfully!\nTracking Code: ${parcel.tracking_code}`);
      }

      form.reset();
      document.getElementById("parcel_id").value = "";
      document.getElementById("parcel-form").style.display = "none";
      document.getElementById("overlay").style.display = "none";
      loadParcels();
    } catch (err) {
      console.error("Error saving parcel:", err);
      alert("Failed to save parcel. Check console.");
    }
  });

  // Initial load
  loadParcels();
});
