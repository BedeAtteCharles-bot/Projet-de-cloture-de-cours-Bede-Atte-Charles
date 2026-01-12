// Application StockFlow Pro - JavaScript côté client
console.log('StockFlow Pro - Application chargée');

// Fonctions utilitaires
function showNotification(message, type = 'success') {
    // Utiliser les alertes Bootstrap
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        <span>${message}</span>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.container-fluid');
    if (container) {
        container.insertBefore(alertDiv, container.firstChild);
        
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page chargée');
});
