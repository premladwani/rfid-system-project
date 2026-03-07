// Admin Profile JavaScript

// Toggle Theme Function
function toggleTheme() {
    document.body.classList.toggle('light');
    const button = document.querySelector('button[onclick="toggleTheme()"]');
    if (document.body.classList.contains('light')) {
        button.textContent = 'Dark Theme';
    } else {
        button.textContent = 'Light Theme';
    }
}

// Save Profile Function
function saveProfile() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    // In a real app, this would send data to server
    alert(`Profile saved!\nName: ${name}\nEmail: ${email}`);
    // Update display
    document.getElementById('displayName').textContent = name;
    document.getElementById('displayEmail').textContent = email;
}

// Terminate Session Function
function terminate() {
    if (confirm('Are you sure you want to terminate this session?')) {
        // In a real app, this would call an API
        alert('Session terminated.');
        // Remove the row (simple implementation)
        event.target.closest('tr').remove();
    }
}

// Avatar Upload Preview
document.getElementById('avatarInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('avatarPreview').style.backgroundImage = `url(${e.target.result})`;
            document.getElementById('avatarPreview').style.backgroundSize = 'cover';
            document.getElementById('avatarPreview').textContent = ''; // Remove initial letter
        };
        reader.readAsDataURL(file);
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Any initialization code here
    console.log('Admin Profile page loaded');
});