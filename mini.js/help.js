// CONTACT FORM

document.getElementById("contactForm").addEventListener("submit",function(e){

e.preventDefault();

alert("Message sent to Administrator!");

this.reset();

});


// ATTENDANCE CORRECTION FORM

document.getElementById("correctionForm").addEventListener("submit",function(e){

e.preventDefault();

alert("Attendance Correction Request Submitted!");

this.reset();

});


// FAQ ACCORDION

let faqItems=document.querySelectorAll(".faq-item");

faqItems.forEach(item=>{

let question=item.querySelector(".faq-question");

question.addEventListener("click",()=>{

let answer=item.querySelector(".faq-answer");

if(answer.style.display==="block"){
answer.style.display="none";
}
else{
answer.style.display="block";
}

});

});