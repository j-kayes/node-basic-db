document.addEventListener('DOMContentLoaded', () => {
  fetch('/similar-users', {
      method: 'GET',
      credentials: 'include', // Include cookies for authentication
  })
  .then(response => {
      if (!response.ok) {
          throw new Error(`Failed to fetch similar users: ${response.status}`);
      }
      return response.json();
  })
  .then(data => {
      if (data.users) {
          console.log(data.users);
          displayUsers(data.users);
      } else {
          console.error('Error fetching users:', data.error);
          displayError('Unable to fetch similar users.');
      }
  })
  .catch(error => {
      console.error('Error:', error);
      displayError('An error occurred while fetching similar users.');
  });
});

function displayUsers(users) {
  const usersList = document.getElementById('usersList');
  usersList.innerHTML = ''; // Clear any existing content

  if (users.length === 0) {
      usersList.innerHTML = '<p>No similar users found.</p>';
      return;
  }

  users.forEach(user => {
      const userDiv = document.createElement('div');
      userDiv.classList.add('user-item');

      // Check if mbtiVector is defined before displaying it
      const mbtiVectorDisplay = user.mbtiVector ? `[${user.mbtiVector.join(', ')}]` : 'N/A';

      userDiv.innerHTML = `
          <p><strong>Username:</strong> ${user.username}</p>
          <p><strong>Similarity Score:</strong> ${user.distance.toFixed(2)}</p>
          <p><strong>MBTI Type:</strong> ${user.mbtiType}</p>
          <p><strong>MBTI Vector:</strong> ${mbtiVectorDisplay}</p>
          <p><strong>Name:</strong> ${user.name}</p>
          <p><strong>Email:</strong> ${user.email}</p>
      `;
      usersList.appendChild(userDiv);
  });
}

function displayError(message) {
  const usersList = document.getElementById('usersList');
  usersList.innerHTML = `<p class="error">${message}</p>`;
}
