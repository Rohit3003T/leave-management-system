// server.js
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

// Configure PostgreSQL connection
const pool = new Pool({
    user: '',
    host: '',
    database: '',
    password: '',
    port: 5432, // Default PostgreSQL port
});


// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Parse request bodies
app.use(bodyParser.json());

// Serve the HTML file for the root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint for leave history
app.get('/api/leave-history', (req, res) => {
    // Assuming you have an 'employee_id' in the session or request object
    const employeeId = 1; // Replace with the actual employee ID

    pool.query('SELECT start_date, end_date, reason, status FROM leave_requests WHERE employee_id = $1', [employeeId])
        .then(result => {
            res.json(result.rows);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});

// API endpoint for leave request submission
app.post('/api/leave-request', (req, res) => {
    const { startDate, endDate, reason } = req.body;
    const employeeId = 1; // Replace with the actual employee ID

    pool.query('INSERT INTO leave_requests (employee_id, start_date, end_date, reason) VALUES ($1, $2, $3, $4)', [employeeId, startDate, endDate, reason])
        .then(() => {
            res.json({ message: 'Leave request submitted successfully' });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});


// API endpoint for fetching pending leave requests
app.get('/api/pending-requests', (req, res) => {
    pool.query('SELECT id, employee_id, start_date, end_date, reason, status FROM leave_requests WHERE status = $1', ['Pending'])
        .then(result => {
            res.json(result.rows);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});

// API endpoint for approving a leave request
app.put('/api/approve-request/:id', (req, res) => {
    const requestId = req.params.id;

    pool.query('UPDATE leave_requests SET status = $1 WHERE id = $2', ['Approved', requestId])
        .then(() => {
            res.json({ message: 'Leave request approved successfully' });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});

// API endpoint for rejecting a leave request
app.put('/api/reject-request/:id', (req, res) => {
    const requestId = req.params.id;

    pool.query('UPDATE leave_requests SET status = $1 WHERE id = $2', ['Rejected', requestId])
        .then(() => {
            res.json({ message: 'Leave request rejected successfully' });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});

// Start the server
app.listen(3001, () => {
    console.log('Server is running on http://localhost:3001');
});