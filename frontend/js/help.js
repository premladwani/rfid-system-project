// CONTACT FORM

document.getElementById("contactForm").addEventListener("submit",async function(e){

e.preventDefault();

// Get form data
const name = this.querySelector('input[type="text"]').value;
const email = this.querySelector('input[type="email"]').value;
const message = this.querySelector('textarea').value;

// Create request object
const request = {
    id: Date.now(),
    type: 'contact',
    name: name,
    email: email,
    message: message,
    timestamp: new Date().toISOString(),
    status: 'pending'
};

try {
    // Send to backend
    const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
    });
    
    const result = await response.json();
    
    if (result.success) {
        alert("Message sent to Administrator!");
        this.reset();
    } else {
        alert("Failed to send message: " + result.message);
    }
} catch (error) {
    console.error('Error sending request:', error);
    alert("Failed to send message. Please try again.");
}

});


// ATTENDANCE CORRECTION FORM

document.getElementById("correctionForm").addEventListener("submit",async function(e){

e.preventDefault();

// Get form data
const name = this.querySelector('input[type="text"]').value;
const date = this.querySelector('input[type="date"]').value;
const issue = this.querySelector('textarea').value;

// Create correction request object
const request = {
    id: Date.now(),
    type: 'correction',
    name: name,
    date: date,
    issue: issue,
    timestamp: new Date().toISOString(),
    status: 'pending'
};

try {
    // Send to backend
    const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
    });
    
    const result = await response.json();
    
    if (result.success) {
        alert("Attendance Correction Request Submitted!");
        this.reset();
    } else {
        alert("Failed to submit correction: " + result.message);
    }
} catch (error) {
    console.error('Error submitting correction:', error);
    alert("Failed to submit correction. Please try again.");
}

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