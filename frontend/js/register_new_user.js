function toggleTheme(){
const body = document.body;
const themeBtn = document.getElementById("themeBtn");

if(body.classList.contains("dark-theme")){
body.classList.remove("dark-theme");
body.classList.add("light-theme");
themeBtn.textContent = "🌙 Dark Mode";
themeBtn.style.background = "linear-gradient(135deg, #667eea, #764ba2)";
}else{
body.classList.remove("light-theme");
body.classList.add("dark-theme");
themeBtn.textContent = "☀ Light Mode";
themeBtn.style.background = "linear-gradient(135deg, #2a2a3e, #1a1a2e)";
}
}

document.addEventListener('DOMContentLoaded', function() {

const body = document.body;
const themeBtn = document.getElementById("themeBtn");

const savedTheme = localStorage.getItem('theme') || 'light';

if(savedTheme === 'dark'){
body.classList.add("dark-theme");
themeBtn.textContent = "☀ Light Mode";
themeBtn.style.background = "linear-gradient(135deg, #2a2a3e, #1a1a2e)";
}else{
body.classList.add("light-theme");
themeBtn.textContent = "🌙 Dark Mode";
themeBtn.style.background = "linear-gradient(135deg, #667eea, #764ba2)";
}

});

document.getElementById('registrationForm').addEventListener('submit', function(e) {

e.preventDefault();

const fullName = document.getElementById('fullName').value;
const email = document.getElementById('email').value;
const phone = document.getElementById('phone').value;
const rfid = document.getElementById('rfid').value;
const role = document.getElementById('role').value;

if (!fullName || !email || !phone || !rfid || !role) {
showErrorModal('Please fill in all required fields.');
return;
}

const message = `User "${fullName}" has been successfully registered with RFID: ${rfid} and role: ${role}`;

showSuccessModal(message);

this.reset();

});

function showSuccessModal(message) {

const modal = document.getElementById('successModal');
const modalMessage = document.getElementById('modalMessage');

modalMessage.textContent = message;
modal.style.display = 'flex';

}

function showErrorModal(message) {

const modal = document.getElementById('successModal');
const modalIcon = modal.querySelector('.modal-icon');
const modalTitle = modal.querySelector('.modal-title');
const modalMessage = document.getElementById('modalMessage');

modalIcon.textContent = '❌';
modalTitle.textContent = 'Registration Failed!';
modalTitle.style.color = '#ff4b5c';

modalMessage.textContent = message;

modal.style.display = 'flex';

}

function closeModal(){

const modal = document.getElementById('successModal');
const modalIcon = modal.querySelector('.modal-icon');
const modalTitle = modal.querySelector('.modal-title');

modal.style.display = 'none';

modalIcon.textContent = '✅';
modalTitle.textContent = 'Registration Successful!';
modalTitle.style.color = '#56ccf2';

}

window.onclick = function(event){

const modal = document.getElementById('successModal');

if(event.target == modal){
closeModal();
}

}

