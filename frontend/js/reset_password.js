document.getElementById("resetForm").addEventListener("submit", function(e){

e.preventDefault();

let newPassword = document.getElementById("newPassword").value;
let confirmPassword = document.getElementById("confirmPassword").value;
let message = document.getElementById("message");

if(newPassword !== confirmPassword)
{
message.style.color = "red";
message.innerText = "Passwords do not match.";
}
else
{
message.style.color = "green";
message.innerText = "Password reset successful! Redirecting to login...";

setTimeout(function(){
window.location.href = "login.html";
},2000);

}

});