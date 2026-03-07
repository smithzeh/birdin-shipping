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
    if (error) throw error;

    const formPopup = document.getElementById("parcel-form-popup");
    const overlay = document.getElementById("overlay");
    const form = document.getElementById("parcelForm");

    formPopup.style.display = "block";
    overlay.style.display = "block";

    // Prefill form fields
    document.getElementById("parcel_id").value = data.id || "";
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

    form.scrollIntoView({ behavior: "smooth" });

  } catch (err) {
    console.error("Error fetching parcel:", err);
    alert("Failed to fetch parcel. Check console.");
  }
};

// ----------------------------
// CREATE / UPDATE PARCEL
// ----------------------------
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("parcelForm");
  const overlay = document.getElementById("overlay");
  const closeBtn = document.getElementById("close-form");
  const createBtn = document.getElementById("create-parcel");

  // Open popup
  if (createBtn) createBtn.onclick = () => {
    form.reset();
    document.getElementById("parcel_id").value = "";
    document.getElementById("parcel-form-popup").style.display = "block";
    overlay.style.display = "block";
  };

  // Close popup
  if (closeBtn) closeBtn.onclick = () => {
    form.reset();
    document.getElementById("parcel_id").value = "";
    document.getElementById("parcel-form-popup").style.display = "none";
    overlay.style.display = "none";
  };

  overlay.onclick = () => {
    form.reset();
    document.getElementById("parcel_id").value = "";
    document.getElementById("parcel-form-popup").style.display = "none";
    overlay.style.display = "none";
  };

  // Submit form
  form.addEventListener("submit", async e => {
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
        const { error } = await supabase.from("parcels").update(parcel).eq("id", parcelId);
        if (error) throw error;
        alert("Parcel updated successfully!");
      } else {
        parcel.tracking_code = generateTrackingCode();
        const { error } = await supabase.from("parcels").insert([parcel]);
        if (error) throw error;
        alert(`Parcel created successfully!\nTracking Code: ${parcel.tracking_code}`);
      }

      form.reset();
      document.getElementById("parcel_id").value = "";
      document.getElementById("parcel-form-popup").style.display = "none";
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
