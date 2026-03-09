const registerForm = document.getElementById('register-form');
const username = document.getElementById('username');
const email = document.getElementById('email');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirm-password');

function validateUsername() {
    if (username.value.length < 3) {
        username.classList.add("invalid-form")
        return false;
    } else {
        username.classList.remove("invalid-form");
        return true;
    }
}
function validatePassword() {
    if (password.value.length < 8) {
        password.classList.add("invalid-form");
        return false;
    } else {
        password.classList.remove("invalid-form");
        return true;
    }
}

function passwordConfirmation() {
    if (password.value !== confirmPassword.value) {
        confirmPassword.classList.add('invalid-form');
        return false;
    } else {
        confirmPassword.classList.remove("invalid-form");
        return true;
    }
}

function validateEmail() {
    if (!email.value.includes('@')) {
        email.classList.add('invalid-form');
        return false;
    } else {
        email.classList.remove('invalid-form');
        return true;
    }
}

function handleRegister(e) {
    e.preventDefault(); 
    
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    const isConfirmValid = passwordConfirmation();
    
    // Si une des validations échoue → STOP
    if (!isEmailValid || !isPasswordValid || !isConfirmValid) {
        console.log("❌ Formulaire invalide !");
        return; 
    }

    fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body:JSON.stringify({
            username: username.value,
            email: email.value,
            password: password.value
        })
    }).then( res=> {
        if(res.ok){
            console.log("✅ Inscription réussie !");
            window.location.href = "login.html?success=1";
        } else {
            console.log("❌ Erreur lors de l'inscription.");
        }

    }).catch( err => {
        console.log("❌ Erreur réseau ou serveur.", err);
    });

}

// Vérifier si on vient de register.html


// Écouteur
registerForm.addEventListener('submit', handleRegister);
username.addEventListener('input', validateUsername);
email.addEventListener('input', validateEmail);
password.addEventListener('input', validatePassword);
confirmPassword.addEventListener('input', passwordConfirmation);
