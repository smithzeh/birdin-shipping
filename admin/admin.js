import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://rirnbinprxnscfrfwrqt.supabase.co",
  "sb_publishable_12CvBFHAfesHOwh5sKJKaA_iryIF9Mi"
);

function generateTrackingCode() {
  return "TRK" + Math.floor(100000 + Math.random() * 900000);
}

// Load parcels into table
async function loadParcels() {
  const tbody = document.querySelector("#parcel-list tbody");
  tbody.innerHTML = "";

  const { data, error } = await supabase.from("parcels").select("*").order("date_sent", { ascending: false });

  if (error) {
    console.error("Error loading parcels:", error);
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
        <button class="edit-btn" data-id="${parcel.id}">Edit</button>
        <button class="delete-btn" data-id="${parcel.id}">Delete</button>
        <button class="print-btn" data-id="${parcel.id}">Print</button>
      </td>
    `;
    tbody.appendChild(row);
  });

  // Attach actions
  document.querySelectorAll(".edit-btn").forEach(btn => btn.addEventListener("click", editParcel));
  document.querySelectorAll(".delete-btn").forEach(btn => btn.addEventListener("click", deleteParcel));
  document.querySelectorAll(".print-btn").forEach(btn => btn.addEventListener("click", printParcel));
}

// Create / Update Parcel
async function saveParcel(e) {
  e.preventDefault();

  const id = document.getElementById("parcel_id").value;
  const parcel = {
    tracking_code: id ? undefined : generateTrackingCode(),
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
    if (id) {
      // Update
      const { error } = await supabase.from("parcels").update(parcel).eq("id", id);
      if (error) throw error;
      alert("Parcel updated successfully!");
    } else {
      // Insert
      const { error } = await supabase.from("parcels").insert([parcel]);
      if (error) throw error;
      alert(`Parcel created!\nTracking Code: ${parcel.tracking_code}`);
    }

    document.getElementById("parcel-form").reset();
    document.getElementById("parcel_id").value = "";
    loadParcels();
  } catch (err) {
    console.error(err);
    alert("Error saving parcel. Check console.");
  }
}

// Edit parcel
async function editParcel(e) {
  const id = e.target.dataset.id;
  const { data, error } = await supabase.from("parcels").select("*").eq("id", id).single();
  if (error) return console.error(error);

  document.getElementById("parcel_id").value = data.id;
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
}

// Delete parcel
async function deleteParcel(e) {
  const id = e.target.dataset.id;
  if (!confirm("Are you sure you want to delete this parcel?")) return;
  const { error } = await supabase.from("parcels").delete().eq("id", id);
  if (error) console.error(error);
  loadParcels();
}

// Print parcel receipt
async function printParcel(e) {
  const id = e.target.dataset.id;
  const { data, error } = await supabase.from("parcels").select("*").eq("id", id).single();
  if (error) return console.error(error);

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
}

// Init
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("parcel-form").addEventListener("submit", saveParcel);
  document.getElementById("cancel").addEventListener("click", () => {
    document.getElementById("parcel-form").reset();
    document.getElementById("parcel_id").value = "";
  });
  loadParcels();
});
