import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://rirnbinprxnscfrfwrqt.supabase.co",
  "sb_publishable_12CvBFHAfesHOwh5sKJKaA_iryIF9Mi"
);

// Generate random tracking code
function generateTrackingCode() {
  return "TRK" + Math.floor(100000 + Math.random() * 900000);
}

// Handle form submission
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("parcel-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const trackingCode = generateTrackingCode();

    // Build parcel object matching Supabase table columns
    const parcel = {
      tracking_code: trackingCode,
      sender_name: document.getElementById("sender_name").value,
      sender_email: document.getElementById("sender_email").value,
      sender_address: document.getElementById("sender_address").value,
      
      receiver_name: document.getElementById("receiver_name").value,
      receiver_email: document.getElementById("receiver_email").value,
      receiver_address: document.getElementById("receiver_address").value,
      
      destination: document.getElementById("destination").value,
      parcel_details: document.getElementById("details").value,
      
      date_sent: document.getElementById("date_sent").value,
      expected_delivery: document.getElementById("expected_delivery").value,
      
      status: document.getElementById("status").value,
      current_location: document.getElementById("current_location").value
    };

    // Insert into Supabase
    const { data, error } = await supabase.from("parcels").insert([parcel]);

    if (error) {
      console.error("Error creating parcel:", error);
      alert("Failed to create parcel. Check console for details.");
      return;
    }

    alert(`Parcel created successfully!\nTracking Code: ${trackingCode}`);
    form.reset();
  });
});
