import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://rirnbinprxnscfrfwrqt.supabase.co";
const SUPABASE_KEY = "sb_publishable_12CvBFHAfesHOwh5sKJKaA_iryIF9Mi";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Generate random tracking code
function generateTrackingCode() {
  return "TRK" + Math.floor(100000 + Math.random() * 900000);
}

// Load parcels into table
async function loadParcels() {
  const table = document.getElementById("parcel-list");
  table.innerHTML = "";

  const { data, error } = await supabase
    .from("parcels")
    .select("*")
    .order("date_sent", { ascending: false });

  if (error) {
    console.error("Error loading parcels:", error);
    alert("Failed to load parcels. Check console.");
    return;
  }

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
}

// Delete parcel (already existing)
window.deleteParcel = async function(id) {
  const { error } = await supabase.from("parcels").delete().eq("id", id);
  if (error) {
    console.error("Error deleting parcel:", error);
    alert("Failed to delete parcel. Check console.");
  } else {
    loadParcels();
  }
};

// ---------- NEW: Edit Parcel ----------
window.editParcel = async function(id) {
  const { data, error } = await supabase.from("parcels").select("*").eq("id", id).single();
  if (error) {
    console.error("Error fetching parcel:", error);
    alert("Failed to fetch parcel. Check console.");
    return;
  }

  // Prefill form with existing data
  document.getElementById("parcel_id").value = data.id; // hidden field for editing
  document.getElementById("sender_name").value = data.sender_name;
  document.getElementById("sender_email").value = data.sender_email;
  document.getElementById("sender_address").value = data.sender_address;

  document.getElementById("receiver_name").value = data.receiver_name;
  document.getElementById("receiver_email").value = data.receiver_email;
  document.getElementById("receiver_address").value = data.receiver_address;

  document.getElementById("destination").value = data.destination;
  document.getElementById("parcel_details").value = data.parcel_details;

  document.getElementById("date_sent").value = data.date_sent;
  document.getElementById("expected_delivery").value = data.expected_delivery;

  document.getElementById("status").value = data.status;
  document.getElementById("current_location").value = data.current_location;

  // Scroll to form
  document.getElementById("parcel-form").scrollIntoView({ behavior: "smooth" });
};

// ---------- NEW: Print Parcel ----------
window.printParcel = async function(id) {
  const { data, error } = await supabase.from("parcels").select("*").eq("id", id).single();
  if (error) {
    console.error("Error fetching parcel for print:", error);
    alert("Failed to fetch parcel. Check console.");
    return;
  }

  const content = `
    <h2>Parcel Receipt</h2>
    <p>Tracking Code: ${data.tracking_code}</p>
    <p>Sender: ${data.sender_name} (${data.sender_email})</p>
    <p>Receiver: ${data.receiver_name} (${data.receiver_email})</p>
    <p>Destination: ${data.destination}</p>
    <p>Parcel Details: ${data.parcel_details}</p>
    <p>Status: ${data.status}</p>
    <p>Current Location: ${data.current_location}</p>
    <p>Date Sent: ${data.date_sent}</p>
    <p>Expected Delivery: ${data.expected_delivery}</p>
  `;

  const printWindow = window.open("", "_blank");
  printWindow.document.write(content);
  printWindow.print();
  printWindow.close();
};

// Handle form submission (existing create logic modified for edit)
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("parcel-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const parcelId = document.getElementById("parcel_id").value; // hidden field

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
      document.getElementById("parcel_id").value = ""; // reset hidden field
      loadParcels();
    } catch (err) {
      console.error("Error saving parcel:", err);
      alert("Failed to save parcel. Check console.");
    }
  });

  // Initial load of parcels
  loadParcels();
});
