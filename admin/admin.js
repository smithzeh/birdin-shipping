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
      <td><button onclick="deleteParcel('${parcel.id}')">Delete</button></td>
    `;
    table.appendChild(row);
  });
}

// Delete parcel
window.deleteParcel = async function(id) {
  const { error } = await supabase.from("parcels").delete().eq("id", id);
  if (error) {
    console.error("Error deleting parcel:", error);
    alert("Failed to delete parcel. Check console.");
  } else {
    loadParcels();
  }
};

// Handle form submission
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("parcel-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const trackingCode = generateTrackingCode();

    const parcel = {
      tracking_code: trackingCode,
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

    const { error } = await supabase.from("parcels").insert([parcel]);

    if (error) {
      console.error("Error creating parcel:", error);
      alert("Failed to create parcel. Check console for details.");
      return;
    }

    alert(`Parcel created successfully!\nTracking Code: ${trackingCode}`);
    form.reset();
    loadParcels();
  });

  // Initial load of parcels
  loadParcels();
});
