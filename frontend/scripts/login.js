const API_URL = 'http://localhost:5000';

const successRegisterMessage = document.querySelector('.success-register-message');
const params = new URLSearchParams(window.location.search);
const loginForm = document.getElementById("login-form");
function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");

    // disparaît après 3 secondes
    setTimeout(() => {
        toast.classList.remove("show");
    }, 5000);
}
if (params.get("success") === "1") {
    toast.classList.add("success");
    showToast("Inscription réussie ! Vous pouvez maintenant vous connecter.");

    // Nettoyer l’URL
    history.replaceState({}, "", "login.html");
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ email, password })
        });

        if (res.ok) {
            // 1. On attend de recevoir les données (le token est dedans !)
            const data = await res.json();
            
            // 2. On stocke le token dans le localStorage
            // Assure-toi que ton backend renvoie bien un objet { token: "..." }
            localStorage.setItem("token", data.token);

            console.log("✅ Connexion réussie et token enregistré !");
            window.location.href = "index.html";
        } else {
            // Gestion de l'erreur
            console.log("❌ Échec de la connexion !");
            toast.classList.add("error");
            showToast("Échec de la connexion ! Vérifiez vos identifiants.");
        }
    } catch (err) {
        console.error("Erreur réseau :", err);
        showToast("Le serveur ne répond pas.");
    }
}

loginForm.addEventListener("submit", handleLogin);
