import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://rirnbinprxnscfrfwrqt.supabase.co",
  "sb_publishable_12CvBFHAfesHOwh5sKJKaA_iryIF9Mi"
);

// Generate random tracking code
function generateTrackingCode() {
  return "TRK" + Math.floor(100000 + Math.random() * 900000);
}

// Load parcels into table
async function loadParcels() {
  const table = document.getElementById("parcel-list");
  table.innerHTML = "";

  const { data, error } = await supabase.from("parcels").select("*").order("date_sent", { ascending: false });

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
        <button onclick="deleteParcel('${parcel.id}')">Delete</button>
      </td>
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
}

// Handle popup form submission
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#parcel-form form");

  if (!form) {
    console.error("Form not found inside popup!");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const trackingCode = generateTrackingCode();

    const parcel = {
      tracking_code: trackingCode,
      sender_address: document.getElementById("sender").value,
      receiver_address: document.getElementById("receiver").value,
      destination: document.getElementById("destination").value,
      parcel_details: document.getElementById("details").value,
      date_sent: document.getElementById("dateSent").value,
      expected_delivery: document.getElementById("deliveryDate").value,
      status: document.getElementById("status").value,
      current_location: document.getElementById("location").value
    };

    try {
      const { data, error } = await supabase.from("parcels").insert([parcel]);
      if (error) {
        console.error("Error creating parcel:", error);
        alert("Failed to create parcel. Check console for details.");
        return;
      }

      alert(`Parcel created successfully!\nTracking Code: ${trackingCode}`);
      form.reset();

      // Close popup
      document.getElementById("parcel-form").style.display = "none";
      document.getElementById("overlay").style.display = "none";

      // Reload table
      loadParcels();
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("An unexpected error occurred. Check console.");
    }
  });

  // Initial load of parcels
  loadParcels();
});
