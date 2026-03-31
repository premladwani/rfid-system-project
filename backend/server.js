const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const db = require('../database/db');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Default route to serve the role selection page
app.get('/', (req, res) => {
    res.redirect('/role.html');
});

// ---------------------------
// API ENDPOINTS
// ---------------------------

// Password Validation Helper
const validatePassword = (password) => {
    if (!password) return "Password is required.";
    if (password.length < 8) return "Password must be at least 8 characters long.";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter (A-Z).";
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter (a-z).";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number (0-9).";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "Password must contain at least one special character.";
    return null;
};

// 1. Register a new user
app.post('/api/register', (req, res) => {
    const { fullName, email, phone, rfid, role, password } = req.body;

    const passwordError = validatePassword(password);
    if (passwordError) {
        return res.status(400).json({ success: false, message: passwordError });
    }

    // In a real app, you should hash the password using bcrypt.
    // For this mini-project, we'll store it as plain text. (DO NOT do this in production)

    const query = `INSERT INTO users (fullName, email, phone, rfid, role, password) VALUES (?, ?, ?, ?, ?, ?)`;
    db.run(query, [fullName, email, phone, rfid, role, password], function (err) {
        if (err) {
            console.error(err);
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ success: false, message: "Email or RFID already exists." });
            }
            return res.status(500).json({ success: false, message: "Database error." });
        }
        res.json({ success: true, message: "User registered successfully!", userId: this.lastID });
    });
});

// 2. Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const query = `SELECT id, fullName, email, phone, role, rfid, status FROM users WHERE email = ? AND password = ?`;

    db.get(query, [email, password], (err, user) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Database error." });
        }
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid email or password." });
        }
        if (user.status !== 'Active') {
            return res.status(403).json({ success: false, message: "Account is inactive. Contact Administrator." });
        }
        res.json({ success: true, message: "Login successful!", user });
    });
});

// 2b. Admin Register
app.post('/api/admin/register', (req, res) => {
    const { fullName, email, phone, password } = req.body;

    const passwordError = validatePassword(password);
    if (passwordError) {
        return res.status(400).json({ success: false, message: passwordError });
    }

    const query = `INSERT INTO admins (fullName, email, phone, password) VALUES (?, ?, ?, ?)`;
    db.run(query, [fullName, email, phone, password], function (err) {
        if (err) {
            console.error(err);
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ success: false, message: "Email already exists in admins table." });
            }
            return res.status(500).json({ success: false, message: "Database error." });
        }
        res.json({ success: true, message: "Admin registered successfully!", userId: this.lastID });
    });
});

// 2c. Admin Login
app.post('/api/admin/login', (req, res) => {
    const { email, password } = req.body;
    const query = `SELECT id, fullName, email, phone, role, status FROM admins WHERE email = ? AND password = ?`;

    db.get(query, [email, password], (err, admin) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Database error." });
        }
        if (!admin) {
            return res.status(401).json({ success: false, message: "Invalid email or password." });
        }
        if (admin.status !== 'Active') {
            return res.status(403).json({ success: false, message: "Account is inactive. Contact Administrator." });
        }
        res.json({ success: true, message: "Login successful!", user: admin });
    });
});

// 2d. Get Admin Work/Tasks
app.get('/api/admin/work/:adminId', (req, res) => {
    const adminId = req.params.adminId;
    const query = `SELECT id, taskTitle, taskDescription, status, createdAt FROM admin_work WHERE adminId = ? ORDER BY createdAt DESC`;
    db.all(query, [adminId], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Database error." });
        }
        res.json({ success: true, tasks: rows });
    });
});

// 2e. Create Admin Work/Task
app.post('/api/admin/work', (req, res) => {
    const { adminId, taskTitle, taskDescription, status } = req.body;
    if (!adminId || !taskTitle) {
         return res.status(400).json({ success: false, message: "Admin ID and Task Title are required." });
    }
    const query = `INSERT INTO admin_work (adminId, taskTitle, taskDescription, status) VALUES (?, ?, ?, ?)`;
    db.run(query, [adminId, taskTitle, taskDescription, status || 'Pending'], function (err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Database error." });
        }
        res.json({ success: true, message: "Task added successfully!", taskId: this.lastID });
    });
});

// 2f. Update Admin Work/Task Status
app.put('/api/admin/work/:id', (req, res) => {
    const taskId = req.params.id;
    const { status } = req.body;
    const query = `UPDATE admin_work SET status = ? WHERE id = ?`;
    db.run(query, [status, taskId], function (err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Database error." });
        }
        res.json({ success: true, message: "Task updated successfully!" });
    });
});

// 3. Get all users
app.get('/api/users', (req, res) => {
    const query = `SELECT id, fullName, email, role, rfid, status, createdAt FROM users`;
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Database error." });
        }
        res.json({ success: true, users: rows });
    });
});

// 4. Record Attendance
app.post('/api/attendance', (req, res) => {
    const { rfid, status } = req.body;
    // Find user by rfid
    db.get(`SELECT id FROM users WHERE rfid = ?`, [rfid], (err, user) => {
        if (err || !user) {
            return res.status(404).json({ success: false, message: "RFID not recognized." });
        }

        // Log attendance
        db.run(`INSERT INTO attendance (rfid, userId, status) VALUES (?, ?, ?)`, [rfid, user.id, status], function (err) {
            if (err) {
                return res.status(500).json({ success: false, message: "Database error." });
            }
            res.json({ success: true, message: "Attendance recorded." });
        });
    });
});

// 5. Get Attendance Logs
app.get('/api/attendance', (req, res) => {
    const query = `
        SELECT a.id, a.rfid, a.timestamp, a.status, u.fullName
        FROM attendance a
        LEFT JOIN users u ON a.userId = u.id
        ORDER BY a.timestamp DESC
    `;
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Database error." });
        }
        res.json({ success: true, logs: rows });
    });
});

// 6. Get Dashboard Metrics
app.get('/api/metrics', (req, res) => {
    const queries = {
        totalUsers: new Promise((resolve, reject) => {
            db.get(`SELECT COUNT(*) as count FROM users`, (err, row) => {
                if (err) reject(err); else resolve(row.count);
            });
        }),
        recentAttendance: new Promise((resolve, reject) => {
            // simplified: marked today
            db.get(`SELECT COUNT(*) as count FROM attendance WHERE date(timestamp) = date('now')`, (err, row) => {
                if (err) reject(err); else resolve(row.count);
            });
        })
    };

    Promise.all([queries.totalUsers, queries.recentAttendance])
        .then(([totalUsers, recentAttendance]) => {
            res.json({ success: true, metrics: { totalUsers, todayAttendance: recentAttendance } });
        })
        .catch(err => {
            res.status(500).json({ success: false, message: "Database error." });
        });
});

// 7. Update User Profile (Self)
app.put('/api/users/:id', (req, res) => {
    const { fullName, email } = req.body;
    const userId = req.params.id;
    
    // Basic update query
    db.run(`UPDATE users SET fullName = ?, email = ? WHERE id = ?`, [fullName, email, userId], function(err) {
        if(err) return res.status(500).json({success: false, message: "Database error."});
        res.json({success: true, message: "Profile updated successfully"});
    });
});

// 8. Update User Full (Admin)
app.put('/api/users/full/:id', (req, res) => {
    const { fullName, rfid, role, email, phone, status } = req.body;
    const userId = req.params.id;
    
    const query = `UPDATE users SET fullName = ?, rfid = ?, role = ?, email = ?, phone = ?, status = ? WHERE id = ?`;
    db.run(query, [fullName, rfid, role, email, phone, status, userId], function(err) {
        if(err) return res.status(500).json({success: false, message: "Database error."});
        res.json({success: true, message: "User updated successfully"});
    });
});

// 9. Delete User (Admin)
app.delete('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    db.run(`DELETE FROM users WHERE id = ?`, [userId], function(err) {
        if(err) return res.status(500).json({success: false, message: "Database error."});
        res.json({success: true, message: "User deleted successfully"});
    });
});

// 10. Get Config
app.get('/api/config', (req, res) => {
    db.get(`SELECT settings FROM config WHERE id = 1`, (err, row) => {
        if (err) return res.status(500).json({ success: false, message: "Database error." });
        if (row && row.settings) {
            return res.json({ success: true, settings: JSON.parse(row.settings) });
        }
        res.json({ success: true, settings: null });
    });
});

// 11. Save Config
app.post('/api/config', (req, res) => {
    const settings = JSON.stringify(req.body);
    const query = `
        INSERT INTO config (id, settings) VALUES (1, ?)
        ON CONFLICT(id) DO UPDATE SET settings=excluded.settings
    `;
    db.run(query, [settings], function (err) {
        if (err) return res.status(500).json({ success: false, message: "Database error." });
        res.json({ success: true, message: "Configuration saved." });
    });
});

// ============================
// USER REQUESTS API ENDPOINTS
// ============================

// Submit a new user request
app.post('/api/user-requests', (req, res) => {
    const { userId, userName, userEmail, message } = req.body;
    
    if (!userId || !userName || !userEmail || !message) {
        return res.status(400).json({ success: false, message: "All fields are required." });
    }
    
    const query = `
        INSERT INTO user_requests (userId, userName, userEmail, message, status, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;
    
    db.run(query, [userId, userName, userEmail, message], function(err) {
        if (err) {
            console.error("Error inserting user request:", err);
            return res.status(500).json({ success: false, message: "Database error." });
        }
        
        // Return the created request with its ID
        const requestId = this.lastID;
        res.json({ 
            success: true, 
            message: "Request submitted successfully.",
            request: {
                id: requestId,
                userId,
                userName,
                userEmail,
                message,
                status: 'pending',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        });
    });
});

// Get all user requests (for admin dashboard)
app.get('/api/user-requests', (req, res) => {
    const query = `
        SELECT * FROM user_requests 
        ORDER BY createdAt DESC
    `;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error("Error fetching user requests:", err);
            return res.status(500).json({ success: false, message: "Database error." });
        }
        res.json({ success: true, requests: rows });
    });
});

// Get requests for a specific user (for user dashboard)
app.get('/api/user-requests/user/:userId', (req, res) => {
    const userId = req.params.userId;
    
    const query = `
        SELECT * FROM user_requests 
        WHERE userId = ?
        ORDER BY createdAt DESC
    `;
    
    db.all(query, [userId], (err, rows) => {
        if (err) {
            console.error("Error fetching user requests:", err);
            return res.status(500).json({ success: false, message: "Database error." });
        }
        res.json({ success: true, requests: rows });
    });
});

// Update request status (approve/reject with response)
app.put('/api/user-requests/:id', (req, res) => {
    const requestId = req.params.id;
    const { status, response } = req.body;
    
    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status." });
    }
    
    const query = `
        UPDATE user_requests 
        SET status = ?, response = ?, updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
    `;
    
    db.run(query, [status, response || null, requestId], function(err) {
        if (err) {
            console.error("Error updating user request:", err);
            return res.status(500).json({ success: false, message: "Database error." });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ success: false, message: "Request not found." });
        }
        
        res.json({ 
            success: true, 
            message: `Request ${status} successfully.`,
            updatedRequest: {
                id: requestId,
                status,
                response,
                updatedAt: new Date().toISOString()
            }
        });
    });
});

// Delete request
app.delete('/api/user-requests/:id', (req, res) => {
    const requestId = req.params.id;
    
    const query = `
        DELETE FROM user_requests 
        WHERE id = ?
    `;
    
    db.run(query, [requestId], function(err) {
        if (err) {
            console.error("Error deleting user request:", err);
            return res.status(500).json({ success: false, message: "Database error." });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ success: false, message: "Request not found." });
        }
        
        res.json({ success: true, message: "Request deleted successfully." });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
