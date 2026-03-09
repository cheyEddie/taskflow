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

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body:JSON.stringify({
            email: email,
            password: password
        })
    }).then( res=> {
        if(res.ok){
            console.log("✅ Connexion réussie !");
            window.location.href = "index.html";
        } else {
            console.log("❌ Échec de la connexion !");
            toast.classList.add("error");
            showToast("Échec de la connexion ! Vérifiez vos identifiants.");
        }
    });
}

loginForm.addEventListener("submit", handleLogin);
