// ===== Auth: Login Screen + Session Handling =====
//
// Shows a full-screen login overlay until the user signs in with
// email/password. Once signed in, the overlay hides and storage.js
// starts its Firestore listeners (see startStorageSync in storage.js).
// Firebase keeps the session alive across reloads, so users only need
// to log in again after an explicit logout.

let appHasBooted = false;

document.addEventListener("DOMContentLoaded", () => {

    const loginOverlay = document.getElementById("loginOverlay");
    const loginForm     = document.getElementById("loginForm");
    const loginEmail    = document.getElementById("loginEmail");
    const loginPassword = document.getElementById("loginPassword");
    const loginError    = document.getElementById("loginError");
    const loginBtn      = document.getElementById("loginSubmitBtn");
    const logoutBtn     = document.getElementById("logoutBtn");
    const userAvatar    = document.getElementById("userAvatar");

    // ── Handle login form submit ──────────────────────────

    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        loginError.textContent = "";
        loginBtn.disabled = true;
        loginBtn.textContent = "Logging in...";

        auth.signInWithEmailAndPassword(
            loginEmail.value.trim(),
            loginPassword.value
        ).catch((err) => {
            loginError.textContent = friendlyAuthError(err.code);
        }).finally(() => {
            loginBtn.disabled = false;
            loginBtn.textContent = "Log In";
        });
    });

    // ── Handle logout ──────────────────────────────────────

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            if (confirm("Log out?")) {
                auth.signOut();
            }
        });
    }

    // ── Watch auth state ───────────────────────────────────

    auth.onAuthStateChanged((user) => {

        if (user) {
            loginOverlay.classList.remove("show");
            loginError.textContent = "";
            loginForm.reset();

            // Show the avatar circle with the first letter of the email
            if (userAvatar && user.email) {
                userAvatar.textContent = user.email.charAt(0).toUpperCase();
                userAvatar.title = user.email;
                userAvatar.classList.add("show");
            }

            // Start (or resume) Firestore sync exactly once per session.
            // storage.js exposes this function; it wires up the
            // real-time listeners that populate the local caches.
            if (typeof startStorageSync === "function") {
                startStorageSync();
            }

        } else {
            loginOverlay.classList.add("show");
            if (userAvatar) {
                userAvatar.classList.remove("show");
                userAvatar.textContent = "";
                userAvatar.title = "";
            }
        }

    });

});

function friendlyAuthError(code) {
    switch (code) {
        case "auth/invalid-email":
            return "Please enter a valid email.";
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
            return "Incorrect email or password.";
        case "auth/too-many-requests":
            return "Too many attempts. Please wait a moment and try again.";
        default:
            return "Could not log in. Please check your details and try again.";
    }
}