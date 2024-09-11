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
                    body: JSON.stringify({ username, password })  // Send username and password
                });
        
                const data = await response.json();
                if (response.ok) {
                    // Store the token in localStorage
                    localStorage.setItem('token', data.token);
                    // Redirect to dashboard or perform any further actions
                    window.location.href = '/dashboard.html';
                } else {
                    console.error(data.error);  // Handle errors (e.g., invalid credentials)
                }
            } catch (error) {
                console.error('Login failed:', error);
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

    // Handle fetching the quiz HTML content
    const quizButton = document.getElementById('quizButton');  // Assuming you have a button with id="quizButton"
    if (quizButton) {
        quizButton.addEventListener('click', async (event) => {
            event.preventDefault();

            const token = localStorage.getItem('token');  // Get the stored token

            if (!token) {
                alert('You need to log in to take the quiz!');
                return;
            }

            try {
                const response = await fetch('/quiz/index.html', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const html = await response.text();
                    // Inject the quiz content into the page, for example:
                    document.body.innerHTML = html;
                } else {
                    console.error('Failed to load quiz.');
                }
            } catch (error) {
                console.error('Error fetching quiz:', error);
            }
        });
    }
});
