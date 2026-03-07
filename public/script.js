import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// ----------------------------
// SUPABASE CONNECTION
// ----------------------------
const SUPABASE_URL = "https://rirnbinprxnscfrfwrqt.supabase.co";
const SUPABASE_KEY = "sb_publishable_12CvBFHAfesHOwh5sKJKaA_iryIF9Mi";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ----------------------------
// TRACK PARCEL (PUBLIC PAGE)
// ----------------------------
const trackingForm = document.getElementById("tracking-form");

if (trackingForm) {
  trackingForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const trackingCode = document.getElementById("customer-tracking-code").value.trim();
    const resultDiv = document.getElementById("tracking-result");

    resultDiv.innerHTML = "<p>Tracking shipment...</p>";

    try {
      const { data, error } = await supabase
        .from("parcels")
        .select("*")
        .eq("tracking_code", trackingCode)
        .single();

      if (error || !data) {
        resultDiv.innerHTML = `
          <div style="padding:15px;border-radius:6px;background:#ffecec;color:#cc0000;">
            ❌ Tracking code not found. Please check and try again.
          </div>
        `;
        return;
      }

      // ----------------------------
      // Status Progress Logic
      // ----------------------------
      const statusSteps = {
        "pending": 1,
        "shipped": 2,
        "in transit": 3,
        "delivered": 4
      };

      const currentStep = statusSteps[(data.status || "").toLowerCase()] || 1;
      const progressWidth = ((currentStep - 1) / 3) * 100;

      // ----------------------------
      // Display Parcel Info
      // ----------------------------
      resultDiv.innerHTML = `
        <div style="background:#f4f7fb;padding:20px;border-radius:8px;margin-top:15px">

          <h3 style="margin-bottom:15px;color:#2c3e50;">Shipment Details</h3>

          <p><strong>Tracking Code:</strong> ${data.tracking_code}</p>
          <p><strong>Sender:</strong> ${data.sender_name || "N/A"} (${data.sender_email || "N/A"})</p>
          <p><strong>Receiver:</strong> ${data.receiver_name || "N/A"} (${data.receiver_email || "N/A"})</p>
          <p><strong>Current Location:</strong> ${data.current_location || "Processing Center"}</p>
          <p><strong>Package Details:</strong> ${data.parcel_details || "N/A"}</p>
          <p><strong>Destination:</strong> ${data.destination || "N/A"}</p>
          <p><strong>Expected Delivery:</strong> ${data.expected_delivery || "N/A"}</p>

          <div class="tracker" style="margin-top:20px">
            <h4>Status Progress</h4>
            <div class="tracker-line" style="position:relative;height:10px;background:#ddd;border-radius:5px">
              <div class="progress-fill" style="
                position:absolute;
                left:0;
                top:0;
                height:100%;
                width:${progressWidth}%;
                background:#4caf50;
                border-radius:5px;
                transition: width 0.5s;"></div>
            </div>

            <div style="display:flex;justify-content:space-between;margin-top:10px">
              <div style="text-align:center">
                <div class="dot" style="
                  width:15px;
                  height:15px;
                  background:${currentStep >= 1 ? '#4caf50' : '#fff'};
                  border:2px solid #4caf50;
                  border-radius:50%;
                  margin:auto;
                  transition: background 0.3s;"></div>
                <span style="display:block;font-size:12px;margin-top:5px;font-weight:${currentStep===1?'bold':''}">Pending</span>
              </div>

              <div style="text-align:center">
                <div class="dot" style="
                  width:15px;
                  height:15px;
                  background:${currentStep >= 2 ? '#4caf50' : '#fff'};
                  border:2px solid #4caf50;
                  border-radius:50%;
                  margin:auto;
                  transition: background 0.3s;"></div>
                <span style="display:block;font-size:12px;margin-top:5px;font-weight:${currentStep===2?'bold':''}">Shipped</span>
              </div>

              <div style="text-align:center">
                <div class="dot" style="
                  width:15px;
                  height:15px;
                  background:${currentStep >= 3 ? '#4caf50' : '#fff'};
                  border:2px solid #4caf50;
                  border-radius:50%;
                  margin:auto;
                  transition: background 0.3s;"></div>
                <span style="display:block;font-size:12px;margin-top:5px;font-weight:${currentStep===3?'bold':''}">In Transit</span>
              </div>

              <div style="text-align:center">
                <div class="dot" style="
                  width:15px;
                  height:15px;
                  background:${currentStep >= 4 ? '#4caf50' : '#fff'};
                  border:2px solid #4caf50;
                  border-radius:50%;
                  margin:auto;
                  transition: background 0.3s;"></div>
                <span style="display:block;font-size:12px;margin-top:5px;font-weight:${currentStep===4?'bold':''}">Delivered</span>
              </div>
            </div>
          </div>
        </div>
      `;
    } catch (err) {
      console.error("Tracking error:", err);
      resultDiv.innerHTML = `
        <div style="padding:15px;border-radius:6px;background:#ffecec;color:#cc0000;">
          ⚠ Error fetching shipment. Try again later.
        </div>
      `;
    }
  });
}

// ----------------------------
// PRINT RECEIPT
// ----------------------------
const printBtn = document.getElementById("print-receipt");
if (printBtn) {
  printBtn.addEventListener("click", () => {
    const content = document.getElementById("tracking-result").innerHTML;
    if (!content) {
      alert("Please track a parcel first.");
      return;
    }

    const receiptWindow = window.open("", "_blank");
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
    `);
    receiptWindow.document.close();
    receiptWindow.print();
  });
}
