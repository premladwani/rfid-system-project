/* SIDEBAR */

function toggleSidebar(){
const sidebar = document.getElementById("sidebar");
const body = document.body;
    
sidebar.classList.toggle("active");
    
// Prevent body scroll when sidebar is active
if (sidebar.classList.contains("active")) {
    body.style.overflow = "hidden";
} else {
    body.style.overflow = "";
}
}

/* PREVENT BODY SCROLL WHEN SIDEBAR IS OPEN */
function handleSidebarScroll(e) {
    const sidebar = document.getElementById("sidebar");
    const navLinks = document.querySelector(".nav-links");
    
    // If sidebar is open and scroll is within sidebar
    if (sidebar.classList.contains("active") && navLinks.contains(e.target)) {
        e.stopPropagation();
        // Allow sidebar to scroll normally
        return;
    }
    
    // Prevent body scroll when sidebar is open
    if (sidebar.classList.contains("active")) {
        e.preventDefault();
    }
}

/* INITIALIZE SCROLL BEHAVIOR */
document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById("sidebar");
    const body = document.body;
    
    // Add scroll event listener to sidebar
    sidebar.addEventListener('wheel', handleSidebarScroll, { passive: false });
    sidebar.addEventListener('touchmove', handleSidebarScroll, { passive: false });
    
    // Close sidebar when clicking outside
    document.addEventListener('click', function(e) {
        if (sidebar.classList.contains("active") && 
            !sidebar.contains(e.target) && 
            !e.target.closest('.rfid-btn')) {
            sidebar.classList.remove("active");
            body.style.overflow = "";
        }
    });
    
    // Reset body overflow when sidebar is closed
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === "class") {
                if (!sidebar.classList.contains("active")) {
                    body.style.overflow = "";
                }
            }
        });
    });
    
    observer.observe(sidebar, { attributes: true });
});

/* LOAD USER PROFILE */
function loadUserProfile() {
    try {
        // Check for admin first, then user
        const adminDataStr = localStorage.getItem('currentAdmin');
        const userDataStr = localStorage.getItem('currentUser');
        
        if (adminDataStr) {
            // Load admin profile
            const admin = JSON.parse(adminDataStr);
            updateAdminProfile(admin);
        } else if (userDataStr) {
            // Load user profile (existing logic)
            const user = JSON.parse(userDataStr);
            const profileNameEl = document.getElementById('profileName');
            const profileEmailEl = document.getElementById('profileEmail');
            const profilePhoneEl = document.getElementById('profilePhone');
            const profileRFIDEl = document.getElementById('profileRFID');
            
            if (profileNameEl) profileNameEl.textContent = user.name || 'User';
            if (profileEmailEl) profileEmailEl.textContent = user.email || 'email@example.com';
            if (profilePhoneEl) profilePhoneEl.textContent = user.phone || '---';
            if (profileRFIDEl) profileRFIDEl.textContent = user.rfidNumber || '---';
        }
    } catch(e) {
        console.log('Error loading profile');
    }
}

/* UPDATE ADMIN PROFILE - Can be called after nav loads */
function updateAdminProfile(admin) {
    // Update navigation profile
    const navAdminName = document.getElementById('navAdminName');
    const navAdminRole = document.getElementById('navAdminRole');
    
    if (navAdminName) navAdminName.textContent = admin.fullName || 'Admin';
    if (navAdminRole) navAdminRole.textContent = admin.role || 'System Manager';
    
    // Update sidebar profile (if on admin profile page)
    const sidebarAdminName = document.getElementById('sidebarAdminName');
    const sidebarAdminRole = document.getElementById('sidebarAdminRole');
    
    if (sidebarAdminName) sidebarAdminName.textContent = admin.fullName || 'Admin';
    if (sidebarAdminRole) sidebarAdminRole.textContent = admin.role || 'System Manager';
    
    console.log('Admin profile updated:', admin.fullName);
}

// Load profile when document is ready
document.addEventListener('DOMContentLoaded', loadUserProfile);

/* THEME */

function toggleTheme(){
const body = document.body;
const themeBtn = document.querySelector(".toggle");
    
if(body.classList.contains("dark-theme")){
body.classList.remove("dark-theme");
body.classList.add("light-theme");
themeBtn.textContent = "☀ Light Mode";
themeBtn.style.background = "linear-gradient(135deg, #667eea, #764ba2)";
}else{
body.classList.remove("light-theme");
body.classList.add("dark-theme");
themeBtn.textContent = "🌙 Dark Mode";
themeBtn.style.background = "linear-gradient(135deg, #2a2a3e, #1a1a2e)";
}
}

/* SEARCH FUNCTIONALITY */

function filterLinks() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        const text = link.textContent.toLowerCase();
        if (text.includes(searchInput)) {
            link.style.display = 'flex';
        } else {
            link.style.display = 'none';
        }
    });
}

/* CLICK OUTSIDE TO CLOSE */

document.addEventListener('click', function(event) {
    const sidebar = document.getElementById('sidebar');
    const rfidBtn = document.querySelector('.rfid-btn');
    
    if (sidebar.classList.contains('active') && 
        !sidebar.contains(event.target) && 
        !rfidBtn.contains(event.target)) {
        sidebar.classList.remove('active');
    }
});

/* LOGOUT FUNCTIONALITY */

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear login data
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentAdmin');
        sessionStorage.clear();
        
        // Redirect to user registration page (login)
        window.location.href = 'userregister.html';
    }
}
