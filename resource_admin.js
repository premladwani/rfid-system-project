let resources = JSON.parse(localStorage.getItem("resources")) || [];
let editIndex = null;

/* ================= THEME TOGGLE ================= */
function toggleTheme(){
document.body.classList.toggle("light-theme");
let btn = document.getElementById("themeBtn");

if(document.body.classList.contains("light-theme")){
btn.innerHTML="🌙 Dark Mode";
localStorage.setItem("theme","light");
}else{
btn.innerHTML="☀ Light Mode";
localStorage.setItem("theme","dark");
}
}

window.onload = function(){
let savedTheme = localStorage.getItem("theme");
if(savedTheme === "light"){
document.body.classList.add("light-theme");
document.getElementById("themeBtn").innerHTML="🌙 Dark Mode";
}
renderTable();
};

/* ================= MAIN SYSTEM ================= */
function renderTable(){
let body = document.getElementById("tableBody");
body.innerHTML="";

let search = document.getElementById("searchInput").value.toLowerCase().trim();
let filterType = document.getElementById("filterType").value;

resources.forEach((res,index)=>{
let nameMatch = res.name.toLowerCase().includes(search);
let rfidMatch = String(res.rfid).toLowerCase().includes(search);
let mobileMatch = String(res.mobile || "").toLowerCase().includes(search);
let typeMatch = (filterType==="" || res.type===filterType);

if((nameMatch || rfidMatch || mobileMatch) && typeMatch){
let row = document.createElement("tr");
row.innerHTML = `
<td>${index+1}</td>
<td>${res.name}</td>
<td>${res.rfid}</td>
<td>${res.type}</td>
<td>${res.email || ""}</td>
<td>${res.mobile || ""}</td>
<td><span class="status ${res.status==='Active'?'active':'inactive'}">${res.status}</span></td>
<td>
<button class="btn-edit" onclick="editResource(${index})">Edit</button>
<button class="btn-danger" onclick="deleteResource(${index})">Delete</button>
</td>
`;
body.appendChild(row);
}
});

updateDashboard();
}

function updateDashboard(){
document.getElementById("totalCount").innerText = resources.length;
document.getElementById("activeCount").innerText = resources.filter(r=>r.status==="Active").length;
document.getElementById("inactiveCount").innerText = resources.filter(r=>r.status==="Inactive").length;
}

function openModal(){
document.getElementById("modal").style.display="flex";
}

function closeModal(){
document.getElementById("modal").style.display="none";
clearFields();
}

function clearFields(){
document.getElementById("name").value="";
document.getElementById("rfid").value="";
document.getElementById("email").value="";
document.getElementById("mobile").value="";
document.getElementById("type").value="Student";
document.getElementById("status").value="Active";
editIndex=null;
}

function saveResource(){
let nameVal=document.getElementById("name").value.trim();
let rfidVal=document.getElementById("rfid").value.trim();
let typeVal=document.getElementById("type").value;
let emailVal=document.getElementById("email").value.trim();
let mobileVal=document.getElementById("mobile").value.trim();
let statusVal=document.getElementById("status").value;

if(!nameVal || !rfidVal){
showToast("Please fill required fields");
return;
}

if(mobileVal && !/^[0-9]{10}$/.test(mobileVal)){
showToast("Enter valid 10-digit Mobile No.");
return;
}

let data={name:nameVal,rfid:rfidVal,type:typeVal,email:emailVal,mobile:mobileVal,status:statusVal};

if(editIndex===null){
if(resources.some(r=>String(r.rfid)===rfidVal)){
showToast("Duplicate RFID not allowed");
return;
}
resources.push(data);
showToast("Resource Added Successfully");
}else{
resources[editIndex]=data;
showToast("Resource Updated Successfully");
}

localStorage.setItem("resources",JSON.stringify(resources));
closeModal();
renderTable();
}

function editResource(index){
editIndex=index;
let r=resources[index];
document.getElementById("name").value=r.name;
document.getElementById("rfid").value=r.rfid;
document.getElementById("type").value=r.type;
document.getElementById("email").value=r.email || "";
document.getElementById("mobile").value=r.mobile || "";
document.getElementById("status").value=r.status;
openModal();
}

function deleteResource(index){
if(confirm("Are you sure to delete this resource?")){
resources.splice(index,1);
localStorage.setItem("resources",JSON.stringify(resources));
renderTable();
showToast("Deleted Successfully");
}
}

function showToast(msg){
let toast=document.getElementById("toast");
toast.innerText=msg;
toast.style.display="block";
setTimeout(()=>toast.style.display="none",2000);
}

document.getElementById("searchInput").addEventListener("input",renderTable);
document.getElementById("filterType").addEventListener("change",renderTable);
