function toggleTheme(){
    document.body.classList.toggle("light-mode");
}

function saveConfig(){

    const config = {
        systemName: systemName.value,
        institutionName: institutionName.value,
        language: language.value,
        academicYear: academicYear.value,
        semester: semester.value,
        lateThreshold: lateThreshold.value,
        minAttendance: minAttendance.value,
        autoLogout: autoLogout.value,
        twoFactor: twoFactor.checked,
        notifyLow: notifyLow.checked,
        notifyDevice: notifyDevice.checked,
        emailReports: emailReports.checked
    };

    localStorage.setItem("rfidConfig", JSON.stringify(config));

    document.getElementById("successMsg").style.display="block";
    setTimeout(()=>{
        document.getElementById("successMsg").style.display="none";
    },3000);
}

function openModal(){
    document.getElementById("resetModal").style.display="flex";
}

function closeModal(){
    document.getElementById("resetModal").style.display="none";
}

function resetConfig(){
    localStorage.removeItem("rfidConfig");
    location.reload();
}

window.onload = function(){
    const saved = JSON.parse(localStorage.getItem("rfidConfig"));
    if(saved){
        systemName.value = saved.systemName || "";
        institutionName.value = saved.institutionName || "";
        language.value = saved.language || "English";
        academicYear.value = saved.academicYear || "";
        semester.value = saved.semester || "Semester 1";
        lateThreshold.value = saved.lateThreshold || 10;
        minAttendance.value = saved.minAttendance || 75;
        autoLogout.value = saved.autoLogout || 15;
        twoFactor.checked = saved.twoFactor || false;
        notifyLow.checked = saved.notifyLow || false;
        notifyDevice.checked = saved.notifyDevice || false;
        emailReports.checked = saved.emailReports || false;
    }
}