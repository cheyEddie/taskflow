const backMessage = document.querySelector('.back-message');
const API_URL = 'http://localhost:5000';

fetch(API_URL)
.then(response => response.json())
.then(data => backMessage.textContent = data.message)
.catch(error => console.error('Error fetching data:', error));