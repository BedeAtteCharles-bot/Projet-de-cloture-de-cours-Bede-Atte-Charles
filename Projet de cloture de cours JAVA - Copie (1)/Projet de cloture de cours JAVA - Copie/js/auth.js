// ============================================
// AUTHENTIFICATION - GESTION DES UTILISATEURS
// ============================================

function showNotification(message, type = 'success') {
  const existing = document.querySelector('.notification');
  if (existing) existing.remove();

  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <span>${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
    <span>${message}</span>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideInRight 0.3s ease-out';
  }, 10);

  setTimeout(() => {
    notification.style.animation = 'slideInRight 0.3s ease-out reverse';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function register() {
  const name = document.getElementById("name")?.value.trim();
  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value;

  if (!name || !email || !password) {
    showNotification("Tous les champs sont obligatoires", 'error');
    return;
  }

  // Validation de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showNotification("Veuillez entrer une adresse email valide", 'error');
    return;
  }

  // Validation du mot de passe
  if (password.length < 6) {
    showNotification("Le mot de passe doit contenir au moins 6 caractères", 'error');
    return;
  }

  // Vérifier si l'utilisateur existe déjà
  const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");
  if (existingUsers.find(u => u.email === email)) {
    showNotification("Cette adresse email est déjà utilisée", 'error');
    return;
  }

  // Créer l'utilisateur
  const user = {
    name,
    email,
    password, // En production, cela devrait être hashé
    createdAt: new Date().toISOString()
  };

  existingUsers.push(user);
  localStorage.setItem("users", JSON.stringify(existingUsers));
  
  showNotification("Compte créé avec succès !", 'success');
  
  setTimeout(() => {
    window.location.href = "login.html";
  }, 1500);
}

function login() {
  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value;

  if (!email || !password) {
    showNotification("Veuillez remplir tous les champs", 'error');
    return;
  }

  // Récupérer les utilisateurs
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    showNotification("Email ou mot de passe incorrect", 'error');
    return;
  }

  // Sauvegarder la session
  localStorage.setItem("currentUser", JSON.stringify({
    email: user.email,
    name: user.name
  }));
  localStorage.setItem("connected", "true");
  
  showNotification(`Bienvenue ${user.name} !`, 'success');
  
  setTimeout(() => {
    window.location.href = "index.html";
  }, 1500);
}

// Vérifier si l'utilisateur est connecté au chargement
window.addEventListener('DOMContentLoaded', () => {
  const isConnected = localStorage.getItem("connected");
  const currentPath = window.location.pathname;
  
  // Si on est sur login/register et qu'on est déjà connecté, rediriger
  if ((currentPath.includes('login.html') || currentPath.includes('register.html')) && isConnected === 'true') {
    window.location.href = "index.html";
  }
});