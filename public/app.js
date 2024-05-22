// app.js
document.addEventListener('DOMContentLoaded', () => {
    const leaveHistoryTable = document.querySelector('#leave-history tbody');
    const leaveRequestForm = document.querySelector('#leave-request form');
    const leaveRequestLink = document.querySelector('#leave-request-link');
    const leaveHistoryLink = document.querySelector('#leave-history-link');
    const adminLink = document.querySelector('#admin-link');
    const pendingRequestsTable = document.querySelector('#pending-requests');

    // Show the leave request section when the link is clicked
    leaveRequestLink.addEventListener('click', (event) => {
        event.preventDefault();
        
        document.querySelector('#leave-request').style.display = 'block';
        document.querySelector('#leave-history').style.display = 'none';
        document.querySelector('#admin').style.display = 'none';
    });

    // Show the leave history section when the link is clicked
    leaveHistoryLink.addEventListener('click', (event) => {
        event.preventDefault();
        document.querySelector('#leave-request').style.display = 'none';
        document.querySelector('#leave-history').style.display = 'block';
        document.querySelector('#admin').style.display = 'none';
        fetchLeaveHistory();
    });

    // Fetch leave history data from the server
    const fetchLeaveHistory = () => {
        fetch('/api/leave-history')
            .then(response => response.json())
            .then(data => {
                leaveHistoryTable.innerHTML = '';
                data.forEach(leave => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${leave.start_date}</td>
                        <td>${leave.end_date}</td>
                        <td>${leave.reason}</td>
                        <td>${leave.status}</td>
                    `;
                    leaveHistoryTable.appendChild(row);
                });
            })
            .catch(error => console.error(error));
    };

    // Handle leave request form submission
    leaveRequestForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const startDate = document.querySelector('#start-date').value;
        const endDate = document.querySelector('#end-date').value;
        const reason = document.querySelector('#reason').value;

        const leaveRequest = { startDate, endDate, reason };

        fetch('/api/leave-request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(leaveRequest)
        })
            .then(response => response.json())
            .then(data => {
                console.log('Leave request submitted successfully:', data);
                // Reset the form
                leaveRequestForm.reset();
                // Fetch updated leave history
                fetchLeaveHistory();
            })
            .catch(error => console.error(error));
    });
});

// Added an event listener for the admin link
adminLink.addEventListener('click', (event) => {
    event.preventDefault();
    console.log('Admin link clicked');
    document.querySelector('#leave-request').style.display = 'none';
    document.querySelector('#leave-history').style.display = 'none';
    document.querySelector('#admin').style.display = 'block';
    fetchPendingRequests();
});

// Fetch pending leave requests for the admin
const fetchPendingRequests = () => {
    fetch('/api/pending-requests')
        .then(response => response.json())
        .then(data => {
            pendingRequestsTable.innerHTML = '';
            data.forEach(request => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${request.employee_id}</td>
                    <td>${request.start_date}</td>
                    <td>${request.end_date}</td>
                    <td>${request.reason}</td>
                    <td>${request.status}</td>
                    <td>
                        <button class="approve-btn" data-id="${request.id}">Approve</button>
                        <button class="reject-btn" data-id="${request.id}">Reject</button>
                    </td>
                `;
                pendingRequestsTable.appendChild(row);
            });

            // Add event listeners for approve and reject buttons
            const approveBtns = document.querySelectorAll('.approve-btn');
            const rejectBtns = document.querySelectorAll('.reject-btn');

            approveBtns.forEach(btn => {
                btn.addEventListener('click', (event) => {
                    const requestId = event.target.dataset.id;
                    approveRequest(requestId);
                });
            });

            rejectBtns.forEach(btn => {
                btn.addEventListener('click', (event) => {
                    const requestId = event.target.dataset.id;
                    rejectRequest(requestId);
                });
            });
        })
        .catch(error => console.error(error));
};

// Approve a leave request
const approveRequest = (requestId) => {
    fetch(`/api/approve-request/${requestId}`, {
        method: 'PUT'
    })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);
            fetchPendingRequests();
        })
        .catch(error => console.error(error));
};

// Reject a leave request
const rejectRequest = (requestId) => {
    fetch(`/api/reject-request/${requestId}`, {
        method: 'PUT'
    })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);
            fetchPendingRequests();
        })
        .catch(error => console.error(error));
};