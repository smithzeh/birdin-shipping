import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// ----------------------------
// SUPABASE CONNECTION
// ----------------------------
const SUPABASE_URL = "https://rirnbinprxnscfrfwrqt.supabase.co";
const SUPABASE_KEY = "sb_publishable_12CvBFHAfesHOwh5sKJKaA_iryIF9Mi";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ----------------------------
// GENERATE RANDOM TRACKING CODE
// ----------------------------
function generateTrackingCode() {
  return "TRK" + Math.floor(100000 + Math.random() * 900000);
}

// ----------------------------
// LOAD PARCELS INTO TABLE
// ----------------------------
async function loadParcels() {
  const parcelList = document.getElementById("parcel-list");
  if (!parcelList) return;

  try {
    const { data, error } = await supabase
      .from("parcels")
      .select("*")
      .order("date_sent", { ascending: false });

    if (error) throw error;

    parcelList.innerHTML = "";

    data.forEach(parcel => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${parcel.tracking_code}</td>
        <td>${parcel.sender_name || "N/A"}</td>
        <td>${parcel.receiver_name || "N/A"}</td>
        <td>${parcel.current_location || "N/A"}</td>
        <td>${parcel.status || "Pending"}</td>
        <td>
          <button onclick="editParcel('${parcel.id}')">Edit</button>
          <button onclick="deleteParcel('${parcel.id}')">Delete</button>
          <button onclick="printParcel('${parcel.id}')">Print</button>
        </td>
      `;
      parcelList.appendChild(row);
    });
  } catch (err) {
    console.error("Failed to load parcels:", err);
  }
}

// ----------------------------
// DELETE PARCEL
// ----------------------------
window.deleteParcel = async function(id) {
  if (!confirm("Delete this parcel?")) return;
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
    if (error || !data) throw error;

    const form = document.getElementById("parcelForm");
    const overlay = document.getElementById("overlay");

    if (!form) return;

    // Show the popup
    form.parentElement.style.display = "block";
    overlay.style.display = "block";

    // Prefill form fields safely
    document.getElementById("parcel_id").value = data.id || "";
    document.getElementById("sender_name").value = data.sender_name || "";
    if (document.getElementById("sender_email")) document.getElementById("sender_email").value = data.sender_email || "";
    if (document.getElementById("sender_address")) document.getElementById("sender_address").value = data.sender_address || "";
    document.getElementById("receiver_name").value = data.receiver_name || "";
    if (document.getElementById("receiver_email")) document.getElementById("receiver_email").value = data.receiver_email || "";
    if (document.getElementById("receiver_address")) document.getElementById("receiver_address").value = data.receiver_address || "";
    document.getElementById("destination").value = data.destination || "";
    document.getElementById("parcel_details").value = data.parcel_details || "";
    document.getElementById("date_sent").value = data.date_sent || "";
    document.getElementById("expected_delivery").value = data.expected_delivery || "";
    document.getElementById("status").value = data.status || "Pending";
    document.getElementById("current_location").value = data.current_location || "";
  } catch (err) {
    console.error("Error fetching parcel for edit:", err);
    alert("Failed to fetch parcel. Check console.");
  }
};

// ----------------------------
// HANDLE CREATE OR UPDATE PARCEL
// ----------------------------
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("parcelForm");
  const overlay = document.getElementById("overlay");
  const closeBtn = document.getElementById("close-form");

  if (!form) return;

  // Close button
  closeBtn?.addEventListener("click", () => {
    form.reset();
    document.getElementById("parcel_id").value = "";
    form.parentElement.style.display = "none";
    overlay.style.display = "none";
  });

  // Submit form
  form.addEventListener("submit", async e => {
    e.preventDefault();

    const parcelId = document.getElementById("parcel_id").value;

    const parcel = {
      sender_name: document.getElementById("sender_name").value,
      sender_email: document.getElementById("sender_email")?.value || "",
      sender_address: document.getElementById("sender_address")?.value || "",
      receiver_name: document.getElementById("receiver_name").value,
      receiver_email: document.getElementById("receiver_email")?.value || "",
      receiver_address: document.getElementById("receiver_address")?.value || "",
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
      form.parentElement.style.display = "none";
      overlay.style.display = "none";
      loadParcels();
    } catch (err) {
      console.error("Error saving parcel:", err);
      alert("Failed to save parcel. Check console.");
    }
  });

  // Initial load
  loadParcels();
});
