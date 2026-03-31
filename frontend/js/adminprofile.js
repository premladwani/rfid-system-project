// Admin Profile JavaScript
let currentAdmin = null;

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
async function saveProfile() {
    if (!currentAdmin) return;
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    
    try {
        const response = await fetch(`/api/users/${currentAdmin.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName: name, email: email })
        });
        
        const data = await response.json();
        if (data.success) {
            alert(`Profile saved successfully!`);
            
            // Update local storage so changes persist
            currentAdmin.fullName = name;
            currentAdmin.email = email;
            localStorage.setItem('currentAdmin', JSON.stringify(currentAdmin));
            
            // Update display
            document.getElementById('displayName').textContent = name;
            document.getElementById('displayEmail').textContent = email;
        } else {
            alert('Error updating profile: ' + data.message);
        }
    } catch(err) {
        console.error('Failed to save profile:', err);
    }
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
    // Authenticate Admin Session
    const adminData = localStorage.getItem('currentAdmin');
    if (!adminData) {
        alert("Session Expired: Please log in.");
        window.location.href = "adminregister.html";
        return;
    }
    
    currentAdmin = JSON.parse(adminData);
    
    // Populate interface
    document.getElementById('displayName').textContent = currentAdmin.fullName || 'Admin User';
    document.getElementById('displayEmail').textContent = currentAdmin.email || 'admin@company.com';
    
    // Update sidebar profile
    const sidebarName = document.getElementById('sidebarAdminName');
    const sidebarRole = document.getElementById('sidebarAdminRole');
    if (sidebarName) sidebarName.textContent = currentAdmin.fullName || 'Admin User';
    if (sidebarRole) sidebarRole.textContent = currentAdmin.role || 'System Manager';
    
    // Update navigation profile (if nav.html is loaded)
    const navAdminName = document.getElementById('navAdminName');
    const navAdminRole = document.getElementById('navAdminRole');
    if (navAdminName) navAdminName.textContent = currentAdmin.fullName || 'Admin User';
    if (navAdminRole) navAdminRole.textContent = currentAdmin.role || 'System Manager';
    
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    if (nameInput) nameInput.value = currentAdmin.fullName || 'Admin User';
    if (emailInput) emailInput.value = currentAdmin.email || 'admin@company.com';
    
    console.log('Admin Profile integration loaded!');
});