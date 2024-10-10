document.addEventListener('DOMContentLoaded', () => {
    // Handle registration form submission
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const name = document.getElementById('name').value;
            const gender = document.getElementById('gender').value;
            const email = document.getElementById('email').value;

            try {
                const response = await fetch('/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password, name, gender, email })
                });
                const data = await response.json();
                document.getElementById('message').textContent = data.message || data.error;
                if (response.ok) {
                    // Optionally redirect to login page after successful registration
                    window.location.href = 'login.html';
                }
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
                if (response.ok) {
                    // Login successful, redirect to dashboard or home page
                    window.location.href = '/';
                } else {
                    document.getElementById('message').textContent = data.error || 'Login failed';
                }
            } catch (error) {
                console.error('Error:', error);
                document.getElementById('message').textContent = 'An error occurred during login.';
            }
        });
    }

    // Handle dashboard loading
    const dashboardPage = document.getElementById('welcomeMessage');
    const mbtiTypeElement = document.getElementById('mbtiType');
    const mbtiVectorElement = document.getElementById('mbtiVector');

    if (dashboardPage) {
        // Fetch the dashboard data including the username and MBTI information
        fetch('/dashboard', {
            method: 'GET',
            credentials: 'include'  // Include cookies in the request
        })
        .then(async response => {
            if (response.ok) {
                const data = await response.json();

                // Update the dashboard with the fetched data
                dashboardPage.textContent = `Welcome to your dashboard, ${data.username}!`;
                mbtiTypeElement.textContent = `MBTI Type: ${data.mbtiType || 'Take the quiz to learn your type'}`;
                mbtiVectorElement.textContent = `MBTI Vector: ${data.mbtiVector ? data.mbtiVector.join(', ') : 'N/A'}`;
            } else {
                // Not authenticated, redirect to login
                window.location.href = 'login.html';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            //window.location.href = 'login.html';
        });
    }

    // Handle fetching the quiz HTML content
    const quizButton = document.getElementById('quizButton');
    if (quizButton) {
        quizButton.addEventListener('click', (event) => {
            event.preventDefault();
            // Redirect to the quiz page; authentication is handled via cookies
            window.location.href = '/mbti-quiz/main.htm';
        });
    }
});
