let data=[

{id:1,name:"Record A",branch:"CS",section:"A",inTime:"09:00",outTime:"17:00",date:"2026-02-01"},
{id:2,name:"Record B",branch:"ME",section:"B",inTime:"08:30",outTime:"16:30",date:"2026-02-03"},
{id:3,name:"Record C",branch:"CS",section:"A",inTime:"09:15",outTime:"17:15",date:"2026-02-05"},
{id:4,name:"Record D",branch:"EE",section:"C",inTime:"08:45",outTime:"16:45",date:"2026-02-07"},
{id:5,name:"Record E",branch:"ME",section:"B",inTime:"09:00",outTime:"17:00",date:"2026-02-10"}

];

let filteredData=[...data];

function updateSummary(){

document.getElementById("totalCount").innerText=filteredData.length;

document.getElementById("activeCount").innerText=filteredData.length;

document.getElementById("pendingCount").innerText=filteredData.length;

}

function displayTable(){

const tableBody=document.getElementById("tableBody");

tableBody.innerHTML="";

if(filteredData.length===0){

document.getElementById("emptyMessage").innerText="No records found";

return;

}

document.getElementById("emptyMessage").innerText="";

filteredData.forEach(row=>{

tableBody.innerHTML+=`

<tr>

<td>${row.id}</td>
<td>${row.name}</td>
<td>${row.branch}</td>
<td>${row.section}</td>
<td>${row.inTime}</td>
<td>${row.outTime}</td>
<td>${row.date}</td>

</tr>

`;

});

updateSummary();

}

function applyFilter(){

const search=document.getElementById("searchInput").value.toLowerCase();

const start=document.getElementById("startDate").value;

const end=document.getElementById("endDate").value;

filteredData=data.filter(d=>{

return(

(!start||d.date>=start)&&
(!end||d.date<=end)&&
d.name.toLowerCase().includes(search)

);

});

displayTable();

}

function sortData(key){

filteredData.sort((a,b)=>a[key]>b[key]?1:-1);

displayTable();

}

function exportCSV(){

let csv="ID,Name,Branch,Section,In Time,Out Time,Date\n";

filteredData.forEach(r=>{

csv+=`${r.id},${r.name},${r.branch},${r.section},${r.inTime},${r.outTime},${r.date}\n`;

});

const blob=new Blob([csv],{type:"text/csv"});

const link=document.createElement("a");

link.href=URL.createObjectURL(blob);

link.download="report.csv";

link.click();

}

function exportPDF(){

const {jsPDF}=window.jspdf;

const doc=new jsPDF();

doc.text("Report Data",10,10);

let y=20;

filteredData.forEach(r=>{

doc.text(`${r.id} | ${r.name} | ${r.branch} | ${r.section} | ${r.inTime} | ${r.outTime} | ${r.date}`,10,y);

y+=8;

});

doc.save("report.pdf");

}

displayTable();

