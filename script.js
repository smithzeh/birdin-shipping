// Initialize Supabase
const SUPABASE_URL = 'https://rirnbinprxnscfrfwrqt.supabase.co'; // Replace with your Supabase URL
const SUPABASE_KEY = 'sb_publishable_12CvBFHAfesHOwh5sKJKaA_iryIF9Mi'; // Replace with your Supabase API key
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.getElementById('parcel-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const trackingCode = document.getElementById('tracking-code').value;
    const parcelDetails = document.getElementById('parcel-details').value;

    try {
        // Save parcel log to Supabase
        const { data, error } = await supabase
            .from('parcels') // Replace with your table name
            .insert([
                { tracking_code: trackingCode, details: parcelDetails }
            ]);

        if (error) {
            throw error;
        }

        alert('Parcel logged successfully!');
        event.target.reset();
    } catch (error) {
        console.error('Error logging parcel:', error);
        alert('Failed to log parcel. Please try again.');
    }
});

document.getElementById('tracking-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const trackingCode = document.getElementById('customer-tracking-code').value;

    try {
        // Fetch parcel details from Supabase
        const { data, error } = await supabase
            .from('parcels') // Replace with your table name
            .select('details')
            .eq('tracking_code', trackingCode)
            .single();

        const resultDiv = document.getElementById('tracking-result');

        if (error || !data) {
            resultDiv.textContent = 'Tracking code not found.';
        } else {
            resultDiv.textContent = `Parcel Details: ${data.details}`;
        }
    } catch (error) {
        console.error('Error fetching parcel details:', error);
        alert('Failed to fetch parcel details. Please try again.');
    }
});

document.getElementById('print-receipt').addEventListener('click', function() {
    const trackingCode = document.getElementById('customer-tracking-code').value;
    const resultDiv = document.getElementById('tracking-result').textContent;

    if (!trackingCode || !resultDiv) {
        alert('Please track a parcel first to print the receipt.');
        return;
    }

    const receiptContent = `
        <html>
        <head>
            <title>Receipt</title>
        </head>
        <body>
            <h1>Shipment Receipt</h1>
            <p><strong>Tracking Code:</strong> ${trackingCode}</p>
            <p><strong>Details:</strong> ${resultDiv.replace('Parcel Details: ', '')}</p>
        </body>
        </html>
    `;

    const receiptWindow = window.open('', '_blank');
    receiptWindow.document.write(receiptContent);
    receiptWindow.document.close();
    receiptWindow.print();
});

document.getElementById('create-parcel').addEventListener('click', function() {
    window.location.href = 'create-parcel.html'; // Redirect to a parcel creation page
});

function loadParcels() {
    supabase.from('parcels').select('*').then(({ data, error }) => {
        if (error) {
            console.error('Error loading parcels:', error);
            return;
        }

        const parcelList = document.getElementById('parcel-list');
        parcelList.innerHTML = '';

        data.forEach(parcel => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${parcel.tracking_code}</td>
                <td>${parcel.sender_name}</td>
                <td>${parcel.receiver_name}</td>
                <td>${parcel.current_location || 'N/A'}</td>
                <td>${parcel.status}</td>
                <td>
                    <button onclick="editParcel('${parcel.tracking_code}')">Edit</button>
                    <button onclick="deleteParcel('${parcel.tracking_code}')">Delete</button>
                    <button onclick="printReceipt('${parcel.tracking_code}')">Print Receipt</button>
                </td>
            `;

            parcelList.appendChild(row);
        });
    });
}

function editParcel(trackingCode) {
    window.location.href = `edit-parcel.html?trackingCode=${trackingCode}`;
}

function printReceipt(trackingCode) {
    supabase.from('parcels').select('*').eq('tracking_code', trackingCode).single().then(({ data, error }) => {
        if (error || !data) {
            alert('Failed to fetch parcel details for receipt.');
            return;
        }

        const receiptContent = `
            <html>
            <head>
                <title>Receipt</title>
            </head>
            <body>
                <h1>Birdin Shipment</h1>
                <h2>Shipment Receipt</h2>
                <p><strong>Tracking Code:</strong> ${data.tracking_code}</p>
                <p><strong>Sender:</strong> ${data.sender_name}</p>
                <p><strong>Receiver:</strong> ${data.receiver_name}</p>
                <p><strong>Current Location:</strong> ${data.current_location || 'N/A'}</p>
                <p><strong>Status:</strong> ${data.status}</p>
                <p><strong>Details:</strong> ${data.details}</p>
                <p><strong>Estimated Days:</strong> ${data.estimated_days}</p>
                <footer>
                    <p>&copy; 2026 Birdin Shipment</p>
                </footer>
            </body>
            </html>
        `;

        const receiptWindow = window.open('', '_blank');
        receiptWindow.document.write(receiptContent);
        receiptWindow.document.close();
        receiptWindow.print();
    });
}

// Load parcels on page load
loadParcels();