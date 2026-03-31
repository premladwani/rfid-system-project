let resources = [];
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
    fetchResources();
};

/* ================= LIVE API INTEGRATION ================= */
async function fetchResources() {
    try {
        const response = await fetch('/api/users');
        const data = await response.json();
        if (data.success && data.users) {
            resources = data.users;
            renderTable();
        }
    } catch (err) {
        console.error("Failed to fetch users", err);
        showToast("Error loading resources");
    }
}

/* ================= MAIN SYSTEM ================= */
function renderTable(){
    let body = document.getElementById("tableBody");
    body.innerHTML="";

    let search = document.getElementById("searchInput").value.toLowerCase().trim();
    let filterType = document.getElementById("filterType").value;

    resources.forEach((res,index)=>{
        let nameMatch = res.fullName.toLowerCase().includes(search);
        let rfidMatch = String(res.rfid).toLowerCase().includes(search);
        let mobileMatch = String(res.phone || "").toLowerCase().includes(search);
        let typeMatch = (filterType==="" || res.role===filterType);

        if((nameMatch || rfidMatch || mobileMatch) && typeMatch){
            let row = document.createElement("tr");
            row.innerHTML = `
                <td>${index+1}</td>
                <td>${res.fullName}</td>
                <td>${res.rfid}</td>
                <td>${res.role}</td>
                <td>${res.email || ""}</td>
                <td>${res.phone || ""}</td>
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
    document.getElementById("inactiveCount").innerText = resources.filter(r=>r.status==="Inactive" || !r.status).length;
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
    editIndex = null;
}

async function saveResource(){
    let nameVal=document.getElementById("name").value.trim();
    let rfidVal=document.getElementById("rfid").value.trim();
    let typeVal=document.getElementById("type").value;
    let emailVal=document.getElementById("email").value.trim();
    let mobileVal=document.getElementById("mobile").value.trim();
    let statusVal=document.getElementById("status").value;

    if(!nameVal || !rfidVal){
        showToast("Please fill required fields (Name & RFID)");
        return;
    }

    if(mobileVal && !/^[0-9]{10}$/.test(mobileVal)){
        showToast("Enter valid 10-digit Mobile No.");
        return;
    }

    const payload = {
        fullName: nameVal,
        rfid: rfidVal,
        role: typeVal,
        email: emailVal,
        phone: mobileVal,
        status: statusVal,
        password: "Welcome@123" // Default password for new users created here
    };

    try {
        if(editIndex === null){
            // Create New
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if(data.success) {
                showToast("Resource Added Successfully");
                fetchResources(); // Reload from DB
                closeModal();
            } else {
                showToast(data.message || "Error adding resource");
            }
        } else {
            // Update Existing
            const userId = resources[editIndex].id;
            const response = await fetch(`/api/users/full/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (data.success) {
                showToast("Resource Updated Successfully");
                fetchResources(); // Reload from DB
                closeModal();
            } else {
                showToast(data.message || "Error updating resource");
            }
        }
    } catch(err) {
        console.error("Save error", err);
        showToast("Failed to connect to server");
    }
}

function editResource(index){
    editIndex=index;
    let r=resources[index];
    document.getElementById("name").value=r.fullName;
    document.getElementById("rfid").value=r.rfid;
    document.getElementById("type").value=r.role;
    document.getElementById("email").value=r.email || "";
    document.getElementById("mobile").value=r.phone || "";
    document.getElementById("status").value=r.status || "Active";
    openModal();
}

async function deleteResource(index){
    if(confirm("Are you sure to delete this resource?")){
        const userId = resources[index].id;
        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (data.success) {
                showToast("Deleted Successfully");
                fetchResources();
            } else {
                showToast(data.message || "Failed to delete");
            }
        } catch (err) {
            console.error("Delete error:", err);
            showToast("Failed to connect to server");
        }
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
