const API_URL = 'http://localhost:5000';
const usernameSpan = document.getElementById("username");
const logoutBtn = document.getElementById("logout-btn");
function decodeToken(token) {
    if (!token) return null;
    // Un JWT est composé de 3 parties séparées par des points. 
    // La 2ème partie (index 1) contient les données (le payload).
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const usernameSpan = document.getElementById("username");

    if (token) {
        const user = decodeToken(token);
        
        // Si ton backend a mis "name" ou "email" dans le token :
        if (user && user.userName) {
            usernameSpan.textContent = user.userName; // Ou user.name selon ton backend
        }
    } else {
        // Si pas de token, on peut rediriger vers le login
        window.location.href = "login.html";
    }
})
function handleLogout() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}
logoutBtn.addEventListener("click", handleLogout);