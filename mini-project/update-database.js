const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'rfid_system.db');
const db = new sqlite3.Database(dbPath);

console.log('🔄 Updating database schema...');

// Drop the old table and recreate with correct constraint
db.serialize(() => {
    // Backup existing data
    db.all("SELECT * FROM user_requests", (err, rows) => {
        if (err) {
            console.error('Error backing up data:', err);
            process.exit(1);
        }
        
        console.log(`📦 Backed up ${rows.length} requests`);
        
        // Drop old table
        db.run("DROP TABLE IF EXISTS user_requests", (err) => {
            if (err) {
                console.error('Error dropping table:', err);
                process.exit(1);
            }
            
            console.log('🗑️ Dropped old table');
            
            // Recreate table with correct constraint
            db.run(`CREATE TABLE user_requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId INTEGER NOT NULL,
                userName TEXT NOT NULL,
                userEmail TEXT NOT NULL,
                message TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
                date DATETIME DEFAULT CURRENT_TIMESTAMP
            )`, (err) => {
                if (err) {
                    console.error('Error creating table:', err);
                    process.exit(1);
                }
                
                console.log('✅ Created new table with correct constraint');
                
                // Restore data
                if (rows.length > 0) {
                    const stmt = db.prepare("INSERT INTO user_requests (userId, userName, userEmail, message, status, date) VALUES (?, ?, ?, ?, ?, ?)");
                    
                    rows.forEach(row => {
                        // Convert 'completed' status to 'approved' if needed
                        const status = row.status === 'completed' ? 'approved' : row.status;
                        stmt.run(row.userId, row.userName, row.userEmail, row.message, status, row.date);
                    });
                    
                    stmt.finalize(() => {
                        console.log(`📥 Restored ${rows.length} requests`);
                        console.log('✅ Database update completed successfully!');
                        db.close();
                    });
                } else {
                    console.log('✅ Database update completed successfully!');
                    db.close();
                }
            });
        });
    });
});
