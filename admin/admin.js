import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

const supabase = createClient(
'https://rirnbinprxnscfrfwrqt.supabase.co',
'sb_publishable_12CvBFHAfesHOwh5sKJKaA_iryIF9Mi'
)

const btn = document.getElementById("create-parcel")
const formBox = document.getElementById("parcel-form")
const form = document.getElementById("form")
const table = document.getElementById("parcel-list")

btn.onclick = () => {
formBox.style.display = "block"
}

function generateTracking(){

return "TRK" + Math.floor(Math.random()*100000000)

}

form.addEventListener("submit", async (e)=>{

e.preventDefault()

const tracking = generateTracking()

const sender = document.getElementById("sender").value
const receiver = document.getElementById("receiver").value
const destination = document.getElementById("destination").value
const details = document.getElementById("details").value
const dateSent = document.getElementById("dateSent").value
const delivery = document.getElementById("deliveryDate").value
const status = document.getElementById("status").value
const location = document.getElementById("location").value

await supabase.from("parcels").insert({

tracking_code: tracking,
sender_address: sender,
receiver_address: receiver,
destination: destination,
parcel_details: details,
date_sent: dateSent,
expected_delivery: delivery,
status: status,
current_location: location

})

loadParcels()

form.reset()

formBox.style.display="none"

})

async function loadParcels(){

table.innerHTML=""

const {data} = await supabase.from("parcels").select("*")

data.forEach(parcel => {

const row = document.createElement("tr")

row.innerHTML = `
<td>${parcel.tracking_code}</td>
<td>${parcel.sender_address}</td>
<td>${parcel.receiver_address}</td>
<td>${parcel.current_location}</td>
<td>${parcel.status}</td>
<td>
<button onclick="deleteParcel('${parcel.id}')">Delete</button>
</td>
`

table.appendChild(row)

})

}

window.deleteParcel = async function(id){

await supabase.from("parcels").delete().eq("id", id)

loadParcels()

}

loadParcels()
