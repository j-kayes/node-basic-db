document.addEventListener('DOMContentLoaded', () => {

    // Handle registration form submission
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            try {
                const response = await fetch('/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const data = await response.json();
                document.getElementById('message').textContent = data.message || data.error;
            } catch (error) {
                console.error('Error:', error);
            }
        });
    }

    // Handle login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const data = await response.json();
                if (data.token) {
                    localStorage.setItem('token', data.token);
                    window.location.href = 'dashboard.html';
                } else {
                    document.getElementById('message').textContent = data.error;
                }
            } catch (error) {
                console.error('Error:', error);
            }
        });
    }

    // Handle dashboard loading
    const dashboardPage = document.getElementById('welcomeMessage');
    if (dashboardPage) {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'login.html';
        } else {
            fetch('/dashboard', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    dashboardPage.textContent = data.message;
                } else {
                    window.location.href = 'login.html';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                window.location.href = 'login.html';
            });
        }
    }
});
