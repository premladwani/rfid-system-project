document.getElementById("forgotForm").addEventListener("submit", function(e){

e.preventDefault();

let email = document.getElementById("email").value;
let message = document.getElementById("message");

if(email === "")
{
message.style.color = "red";
message.innerText = "Please enter your email address.";
}
else
{
message.style.color = "green";
message.innerText = "Reset link sent to your email. Redirecting...";

setTimeout(function(){
window.location.href = "reset_password.html";
},2000);

}

});