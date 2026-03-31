let totalUsersCount = 0;
let currentAdmin = null;
let userRequests = [];

// Authenticate Admin
const adminData = localStorage.getItem('currentAdmin');
if (!adminData) {
    alert("Admin Session Expired: Please log in.");
    window.location.href = "adminregister.html";
} else {
    currentAdmin = JSON.parse(adminData);
}

// Fetch metrics on load
document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('/api/metrics');
        const data = await response.json();
        if (data.success && data.metrics) {
             const metricCards = document.querySelectorAll('.cards .card h2');
             if (metricCards.length >= 2) {
                 totalUsersCount = data.metrics.totalUsers || 0;
                 metricCards[0].textContent = totalUsersCount;
                 metricCards[1].textContent = data.metrics.todayAttendance || 0;
             }
        }
        
        await fetchRecentLogs();
        loadUserRequests();
    } catch(err) {
        console.error("Failed to fetch dashboard metrics", err);
    }
});

async function fetchRecentLogs() {
    try {
        const response = await fetch('/api/attendance');
        const data = await response.json();
        if(data.success && data.logs) {
            const table = document.getElementById('attendanceTable');
            // Keep the header row, clear the rest
            while(table.rows.length > 1) {
                table.deleteRow(1);
            }
            
            // Take top 5 recent logs for dashboard
            const recentLogs = data.logs.slice(0, 5);
            recentLogs.forEach(log => {
                const row = table.insertRow(-1);
                row.insertCell(0).textContent = log.fullName || 'Unknown';
                row.insertCell(1).textContent = log.rfid;
                
                const dateObj = new Date(log.timestamp);
                const timeStr = dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                row.insertCell(2).textContent = timeStr;
                
                row.insertCell(3).textContent = log.status;
            });
            
            initCharts(data.logs, totalUsersCount);
        }
    } catch (err) {
        console.error("Failed to fetch attendance logs", err);
    }
}

// Charts
let attendanceChartObj = null;
let weeklyChartObj = null;

function initCharts(logs, totalUsers) {
    const todayLogs = logs.filter(log => {
        const todayStr = new Date().toISOString().split('T')[0];
        return log.timestamp.startsWith(todayStr);
    });
    
    // De-duplicate users by RFID to count unique present users today
    const presentUsers = new Set(todayLogs.map(l => l.rfid)).size;
    const absentUsers = Math.max(0, totalUsers - presentUsers);
    
    // Doughnut Chart (Today's Attendance)
    const ctxDoughnut = document.getElementById('attendanceChart');
    if (ctxDoughnut) {
        if (attendanceChartObj) attendanceChartObj.destroy();
        attendanceChartObj = new Chart(ctxDoughnut, {
            type: 'doughnut',
            data: {
                labels: ['Present','Absent'],
                datasets: [{
                    data: [presentUsers, absentUsers],
                    backgroundColor: ['#22c55e','#ef4444']
                }]
            }
        });
    }

    // Weekly Chart
    const weeklyData = [0,0,0,0,0];
    const now = new Date();
    const today = now.getDay() || 7; // 1-7, Mon-Sun
    
    // Only map Mon-Fri (1-5) for this specific simple summary chart
    for (let i = 1; i <= 5; i++) {
        const targetDate = new Date(now);
        targetDate.setDate(now.getDate() - (today - i));
        const targetDateStr = targetDate.toISOString().split('T')[0];
        
        const logsOnDate = logs.filter(log => log.timestamp.startsWith(targetDateStr));
        const uniquePresent = new Set(logsOnDate.map(l => l.rfid)).size;
        
        // Calculate percentage. Using totalUsers, fallback to 1 to avoid div by zero
        const percent = totalUsers > 0 ? Math.round((uniquePresent / totalUsers) * 100) : 0;
        weeklyData[i-1] = percent;
    }
    
    const ctxWeekly = document.getElementById('weeklyChart');
    if (ctxWeekly) {
        if (weeklyChartObj) weeklyChartObj.destroy();
        weeklyChartObj = new Chart(ctxWeekly, {
            type: 'line',
            data: {
                labels: ['Mon','Tue','Wed','Thu','Fri'],
                datasets: [{
                    label: 'Attendance %',
                    data: weeklyData,
                    borderColor: '#38bdf8',
                    tension: 0.4
                }]
            }
        });
    }
}



// Search functionality
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('searchInput');
  
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const value = this.value.toLowerCase();
      const rows = document.querySelectorAll('#attendanceTable tr');
      
      rows.forEach((row, index) => {
        if (index === 0) return; // Skip header row
        
        const nameCell = row.cells[0];
        if (nameCell) {
          const name = nameCell.textContent.toLowerCase();
          row.style.display = name.includes(value) ? '' : 'none';
        }
      });
    });
  }
});

function clearSearch() {
  const searchInput = document.getElementById('searchInput');
  const rows = document.querySelectorAll('#attendanceTable tr');
  
  if (searchInput) {
    searchInput.value = '';
  }
  
  rows.forEach(row => {
    row.style.display = '';
  });
}



// Theme toggle

function toggleTheme(){

  document.body.classList.toggle('dark');

  const btn = document.getElementById('themeBtn');

  if (btn) {

    btn.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';

  }

  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');

}



// Initialize theme on page load

document.addEventListener('DOMContentLoaded', function(){

  const savedTheme = localStorage.getItem('theme');

  if (savedTheme === 'dark') {

    document.body.classList.add('dark');

    const btn = document.getElementById('themeBtn');

    if (btn) btn.textContent = '☀️';

  }

});

// User Requests Functions
function loadUserRequests() {
    // Fetch requests from backend
    fetch('/api/user-requests')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                userRequests = data.requests;
                displayUserRequests();
            } else {
                console.error('Failed to load user requests:', data.message);
                userRequests = [];
            }
        })
        .catch(error => {
            console.error('Error loading user requests:', error);
            userRequests = [];
        });
}

function displayUserRequests() {
    const requestsList = document.getElementById('userRequestsList');
    if (!requestsList) return;
    
    if (userRequests.length === 0) {
        requestsList.innerHTML = '<div class="statusItem"><strong>No requests</strong></div>';
        return;
    }
    
    // Show only latest 3 requests for dashboard
    const latestRequests = userRequests.slice(-3).reverse();
    
    requestsList.innerHTML = latestRequests.map(request => {
        const statusClass = getStatusClass(request.status);
        const statusIcon = getStatusIcon(request.status);
        const date = new Date(request.date);
        const timeAgo = getTimeAgo(date);
        
        // Show action buttons only for pending requests
        const actionButtons = request.status === 'pending' ? `
            <div style="margin-top: 8px; display: flex; gap: 8px;">
                <button onclick="updateRequestStatus(${request.id}, 'approved')" 
                        class="approve-btn" style="padding: 4px 12px; border: none; border-radius: 6px; 
                               background: #10b981; color: white; cursor: pointer; font-size: 12px;">
                    ✅ Approve
                </button>
                <button onclick="updateRequestStatus(${request.id}, 'rejected')" 
                        class="reject-btn" style="padding: 4px 12px; border: none; border-radius: 6px; 
                               background: #ef4444; color: white; cursor: pointer; font-size: 12px;">
                    ❌ Reject
                </button>
            </div>
        ` : '';
        
        return `
            <div class="statusItem ${statusClass}">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong>${request.userName}</strong>
                    <span style="font-size: 12px;">${statusIcon} ${request.status}</span>
                </div>
                <div style="font-size: 11px; margin-top: 4px; opacity: 0.8;">
                    ${request.message.substring(0, 50)}${request.message.length > 50 ? '...' : ''}
                </div>
                <div style="font-size: 10px; opacity: 0.7;">
                    ${timeAgo}
                </div>
                ${actionButtons}
            </div>
        `;
    }).join('');
}

function getStatusClass(status) {
    switch(status) {
        case 'pending': return '';
        case 'approved': return 'leave';
        case 'rejected': return 'late';
        default: return '';
    }
}

function getStatusIcon(status) {
    switch(status) {
        case 'pending': return '⏳';
        case 'approved': return '✅';
        case 'rejected': return '❌';
        default: return '📤';
    }
}

function getTimeAgo(date) {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds
    
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
}

function updateRequestStatus(requestId, newStatus) {
    // Prepare admin response message
    let adminResponse = '';
    if (newStatus === 'approved') {
        adminResponse = 'Your request has been approved and processed by admin.';
    } else if (newStatus === 'rejected') {
        adminResponse = 'Your request has been rejected by admin. Please contact support for more details.';
    }
    
    // Send update to backend
    fetch(`/api/user-requests/${requestId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            status: newStatus,
            response: adminResponse
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Show confirmation message
            const statusMessage = newStatus === 'approved' ? 'approved' : 'rejected';
            showAdminAlert(`Request ${statusMessage} successfully!`, 'success');
            
            // Refresh the display
            loadUserRequests();
        } else {
            showAdminAlert(data.message || 'Failed to update request', 'error');
        }
    })
    .catch(error => {
        console.error('Error updating request:', error);
        showAdminAlert('Failed to update request. Please try again.', 'error');
    });
}

function showAdminAlert(message, type = 'success') {
    // Create alert element
    const alert = document.createElement('div');
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-weight: 600;
        animation: slideIn 0.3s ease;
    `;
    alert.textContent = message;
    
    // Add to page
    document.body.appendChild(alert);
    
    // Remove after 3 seconds
    setTimeout(() => {
        alert.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(alert);
        }, 300);
    }, 3000);
}

// Auto-refresh requests every 30 seconds
setInterval(loadUserRequests, 30000);

