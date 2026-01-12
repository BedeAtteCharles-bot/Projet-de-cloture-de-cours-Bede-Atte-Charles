// ============================================
// GESTION DE STOCK - APPLICATION PROFESSIONNELLE
// ============================================

let products = JSON.parse(localStorage.getItem("products")) || [];
let movements = JSON.parse(localStorage.getItem("movements")) || [];
let currentSort = { field: null, direction: 'asc' };
let currentFilter = 'all';

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

function saveProducts() {
  localStorage.setItem("products", JSON.stringify(products));
  // Mettre à jour le dashboard si on est sur la page index
  if (typeof updateDashboard === 'function') {
    updateDashboard();
  }
}

function saveMovements() {
  localStorage.setItem("movements", JSON.stringify(movements));
}

function showNotification(message, type = 'success') {
  // Supprimer les notifications existantes
  const existing = document.querySelector('.notification');
  if (existing) existing.remove();

  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <span>${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
    <span>${message}</span>
  `;
  
  document.body.appendChild(notification);
  
  // Animation d'entrée
  setTimeout(() => {
    notification.style.animation = 'slideInRight 0.3s ease-out';
  }, 10);

  // Supprimer après 3 secondes
  setTimeout(() => {
    notification.style.animation = 'slideInRight 0.3s ease-out reverse';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// ============================================
// DASHBOARD AVANCÉ
// ============================================

function updateDashboard() {
  const totalProductsEl = document.getElementById("totalProducts");
  const totalQuantityEl = document.getElementById("totalQuantity");
  const totalRuptureEl = document.getElementById("totalRupture");
  const avgQuantityEl = document.getElementById("avgQuantity");

  if (!totalProductsEl) return;

  let totalProducts = products.length;
  let totalQuantity = 0;
  let totalRupture = 0;

  products.forEach(p => {
    totalQuantity += p.quantity || 0;
    if ((p.quantity || 0) === 0) totalRupture++;
  });

  const avgQuantity = totalProducts > 0 ? Math.round(totalQuantity / totalProducts) : 0;

  // Animation de compteur
  animateValue(totalProductsEl, 0, totalProducts, 500);
  animateValue(totalQuantityEl, 0, totalQuantity, 500);
  animateValue(totalRuptureEl, 0, totalRupture, 500);
  if (avgQuantityEl) animateValue(avgQuantityEl, 0, avgQuantity, 500);

  // Mettre à jour les graphiques
  updateDistributionChart();
  updateTopProducts();
  updateReorderList();
}

function updateReorderList() {
  const reorderSection = document.getElementById("reorderSection");
  const reorderList = document.getElementById("reorderList");
  
  if (!reorderSection || !reorderList) return;

  const productsToReorder = getProductsToReorder();
  
  if (productsToReorder.length === 0) {
    reorderSection.style.display = 'none';
    return;
  }

  reorderSection.style.display = 'block';
  reorderList.innerHTML = productsToReorder.map(p => {
    const quantity = p.quantity || 0;
    const threshold = p.minThreshold || 0;
    return `
      <div class="reorder-item">
        <div class="reorder-item-name">${escapeHtml(p.name)}</div>
        <div class="reorder-item-info">
          Stock actuel: <span class="reorder-item-quantity">${quantity}</span> / Seuil: ${threshold}
        </div>
      </div>
    `;
  }).join('');
}

function animateValue(element, start, end, duration) {
  if (!element) return;
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const current = Math.floor(progress * (end - start) + start);
    element.innerText = current;
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      element.innerText = end;
    }
  };
  window.requestAnimationFrame(step);
}

function updateDistributionChart() {
  const chartContainer = document.getElementById("distributionChart");
  if (!chartContainer) return;

  if (products.length === 0) {
    chartContainer.innerHTML = '<div class="chart-empty">Ajoutez des produits pour voir la répartition</div>';
    return;
  }

  // Prendre les 8 premiers produits pour le graphique
  const topProducts = [...products]
    .sort((a, b) => (b.quantity || 0) - (a.quantity || 0))
    .slice(0, 8);

  const maxQuantity = Math.max(...topProducts.map(p => p.quantity || 0), 1);

  chartContainer.innerHTML = topProducts.map((product, index) => {
    const height = ((product.quantity || 0) / maxQuantity) * 100;
    const shortName = product.name.length > 12 ? product.name.substring(0, 12) + '...' : product.name;
    return `
      <div class="chart-bar" style="height: ${height}%" title="${escapeHtml(product.name)}: ${product.quantity || 0}">
        <span class="chart-bar-value">${product.quantity || 0}</span>
        <span class="chart-bar-label">${escapeHtml(shortName)}</span>
      </div>
    `;
  }).join('');
}

function updateTopProducts() {
  const topProductsContainer = document.getElementById("topProducts");
  if (!topProductsContainer) return;

  if (products.length === 0) {
    topProductsContainer.innerHTML = '<div class="chart-empty">Aucun produit enregistré</div>';
    return;
  }

  const topProducts = [...products]
    .sort((a, b) => (b.quantity || 0) - (a.quantity || 0))
    .slice(0, 5);

  const maxQuantity = Math.max(...topProducts.map(p => p.quantity || 0), 1);

  topProductsContainer.innerHTML = topProducts.map((product, index) => {
    const percentage = ((product.quantity || 0) / maxQuantity) * 100;
    return `
      <div class="top-product-item">
        <div class="top-product-rank">${index + 1}</div>
        <div class="top-product-info">
          <div class="top-product-name">${escapeHtml(product.name)}</div>
          <div class="top-product-quantity">${product.quantity || 0} unités</div>
        </div>
        <div class="top-product-bar">
          <div class="top-product-bar-fill" style="width: ${percentage}%"></div>
        </div>
      </div>
    `;
  }).join('');
}

// ============================================
// AFFICHAGE DES PRODUITS
// ============================================

function getFilteredProducts() {
  let filtered = [...products];

  // Appliquer le filtre
  if (currentFilter === 'stock') {
    filtered = filtered.filter(p => (p.quantity || 0) > 0);
  } else if (currentFilter === 'rupture') {
    filtered = filtered.filter(p => (p.quantity || 0) === 0);
  }

  // Appliquer le tri
  if (currentSort.field) {
    filtered.sort((a, b) => {
      let aVal, bVal;
      
      if (currentSort.field === 'name') {
        aVal = (a.name || '').toLowerCase();
        bVal = (b.name || '').toLowerCase();
      } else if (currentSort.field === 'category') {
        aVal = (a.category || 'Non catégorisé').toLowerCase();
        bVal = (b.category || 'Non catégorisé').toLowerCase();
      } else if (currentSort.field === 'quantity') {
        aVal = a.quantity || 0;
        bVal = b.quantity || 0;
      } else if (currentSort.field === 'status') {
        aVal = (a.quantity || 0) === 0 ? 0 : 1;
        bVal = (b.quantity || 0) === 0 ? 0 : 1;
      } else {
        return 0;
      }

      if (aVal < bVal) return currentSort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return currentSort.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  return filtered;
}

function renderTable(filteredProducts = null) {
  const table = document.getElementById("productTable");
  const emptyState = document.getElementById("emptyState");
  
  if (!table) return;

  const productsToShow = filteredProducts !== null ? filteredProducts : getFilteredProducts();
  table.innerHTML = "";

  if (productsToShow.length === 0) {
    table.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  table.style.display = 'table-row-group';
  if (emptyState) emptyState.style.display = 'none';

  productsToShow.forEach((p, index) => {
    const actualIndex = products.indexOf(p);
    const status = (p.quantity || 0) === 0 ? "rupture" : "ok";
    const statusText = status === "rupture" ? "Rupture" : "En stock";
    const category = p.category || 'Non catégorisé';

    const row = document.createElement('tr');
    row.style.animation = `fadeInUp 0.3s ease-out ${index * 0.05}s both`;
    const minThreshold = p.minThreshold || 0;
    const quantity = p.quantity || 0;
    const needsReorder = minThreshold > 0 && quantity <= minThreshold;
    
    row.innerHTML = `
      <td><strong>${escapeHtml(p.name)}</strong></td>
      <td><span style="color: var(--gray);">${escapeHtml(category)}</span></td>
      <td><span style="font-weight: 600; color: var(--primary);">${quantity}</span>${minThreshold > 0 ? `<br><small style="color: var(--gray);">Seuil: ${minThreshold}</small>` : ''}</td>
      <td><span class="status-badge ${status} ${needsReorder ? 'warning' : ''}">${needsReorder ? '⚠️ Réapprovisionner' : statusText}</span></td>
      <td style="white-space: nowrap;">
        <button class="btn-success" style="margin: 2px; padding: 0.4rem 0.8rem; font-size: 0.75rem;" onclick="recordEntry(${actualIndex})" title="Ajouter du stock">➕ Entrée</button>
        <button class="btn-secondary" style="margin: 2px; padding: 0.4rem 0.8rem; font-size: 0.75rem;" onclick="recordExit(${actualIndex})" title="Retirer du stock">➖ Sortie</button>
        <button class="btn-success" style="margin: 2px; padding: 0.4rem 0.8rem; font-size: 0.75rem;" onclick="editProduct(${actualIndex})" title="Modifier">✏️</button>
        <button class="btn-danger" style="margin: 2px; padding: 0.4rem 0.8rem; font-size: 0.75rem;" onclick="confirmDeleteProduct(${actualIndex})" title="Supprimer">🗑️</button>
      </td>
    `;
    table.appendChild(row);
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================
// TRI DU TABLEAU
// ============================================

function sortTable(field) {
  // Retirer les classes de tri de tous les en-têtes
  document.querySelectorAll('th').forEach(th => {
    th.classList.remove('sort-asc', 'sort-desc');
  });

  // Trouver l'en-tête cliqué
  const header = event?.target?.closest('th') || document.querySelector(`th.sortable`);
  
  if (currentSort.field === field) {
    // Inverser la direction
    currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
  } else {
    currentSort.field = field;
    currentSort.direction = 'asc';
  }

  // Ajouter la classe appropriée
  if (header) {
    header.classList.add(`sort-${currentSort.direction}`);
  }

  renderTable();
}

// ============================================
// FILTRES
// ============================================

function filterProducts(filter) {
  currentFilter = filter;

  // Mettre à jour les boutons actifs
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.filter === filter) {
      btn.classList.add('active');
    }
  });

  renderTable();
}

// ============================================
// AJOUT DE PRODUIT
// ============================================

function addProduct(name, quantity, category = '') {
  return addProductWithThreshold(name, quantity, category, 0);
}

function addProductWithThreshold(name, quantity, category = '', minThreshold = 0) {
  if (!name || name.trim() === '') {
    showNotification('Le nom du produit est requis', 'error');
    return false;
  }

  if (quantity < 0) {
    showNotification('La quantité ne peut pas être négative', 'error');
    return false;
  }

  // Vérifier si le produit existe déjà
  const existingIndex = products.findIndex(p => 
    p.name.toLowerCase().trim() === name.toLowerCase().trim()
  );

  if (existingIndex !== -1) {
    // Demander confirmation pour modifier la quantité
    if (confirm(`Le produit "${name}" existe déjà. Voulez-vous modifier sa quantité ?`)) {
      products[existingIndex].quantity = parseInt(quantity);
      if (category) products[existingIndex].category = category;
      saveProducts();
      renderTable();
      showNotification(`Quantité de "${name}" mise à jour`, 'success');
      return true;
    }
    return false;
  }

  const newProduct = {
    name: name.trim(), 
    quantity: parseInt(quantity),
    category: category || 'Non catégorisé',
    minThreshold: parseInt(minThreshold) || 0,
    createdAt: new Date().toISOString()
  };
  
  products.push(newProduct);
  
  // Enregistrer l'entrée initiale dans l'historique
  const productIndex = products.length - 1;
  addMovement(productIndex, 'entry', parseInt(quantity), 'Ajout initial du produit');
  
  saveProducts();
  renderTable();
  showNotification(`Produit "${name}" ajouté avec succès`, 'success');
  return true;
}

// ============================================
// MODIFICATION DE PRODUIT
// ============================================

function editProduct(index) {
  if (index < 0 || index >= products.length) return;

  const product = products[index];
  const name = prompt('Nom du produit:', product.name);
  if (name === null) return; // Annulé

  const category = prompt('Catégorie:', product.category || '');
  if (category === null) return; // Annulé

  const quantityStr = prompt('Quantité:', product.quantity);
  if (quantityStr === null) return; // Annulé

  const quantity = parseInt(quantityStr);
  if (isNaN(quantity) || quantity < 0) {
    showNotification('Quantité invalide', 'error');
    return;
  }

  const thresholdStr = prompt('Seuil minimum d\'alerte (0 pour désactiver):', product.minThreshold || 0);
  if (thresholdStr === null) return; // Annulé
  
  const threshold = parseInt(thresholdStr);
  if (isNaN(threshold) || threshold < 0) {
    showNotification('Seuil invalide', 'error');
    return;
  }

  products[index].name = name.trim();
  products[index].quantity = quantity;
  products[index].category = category.trim() || 'Non catégorisé';
  products[index].minThreshold = threshold;
  products[index].updatedAt = new Date().toISOString();

  saveProducts();
  renderTable();
  showNotification(`Produit "${name}" modifié avec succès`, 'success');
}

// ============================================
// SUPPRESSION DE PRODUIT
// ============================================

function confirmDeleteProduct(index) {
  if (index < 0 || index >= products.length) return;

  const product = products[index];
  if (confirm(`Êtes-vous sûr de vouloir supprimer "${product.name}" ?`)) {
    deleteProduct(index);
  }
}

function deleteProduct(index) {
  if (index < 0 || index >= products.length) return;

  const productName = products[index].name;
  products.splice(index, 1);
  saveProducts();
  renderTable();
  showNotification(`Produit "${productName}" supprimé`, 'success');
}

// ============================================
// RECHERCHE
// ============================================

function setupSearch() {
  const searchInput = document.getElementById("searchInput");
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    if (searchTerm === '') {
      renderTable();
      return;
    }

    const filtered = getFilteredProducts().filter(p => 
      p.name.toLowerCase().includes(searchTerm) ||
      (p.category || '').toLowerCase().includes(searchTerm) ||
      (p.quantity || 0).toString().includes(searchTerm)
    );

    renderTable(filtered);
  });
}

// ============================================
// GESTION DES ENTREES/SORTIES
// ============================================

function addMovement(productIndex, type, quantity, reason = '') {
  const product = products[productIndex];
  if (!product) return;

  const previousQuantity = product.quantity || 0;
  let newQuantity;
  
  if (type === 'entry') {
    newQuantity = previousQuantity + quantity;
    product.quantity = newQuantity;
  } else if (type === 'exit') {
    newQuantity = Math.max(0, previousQuantity - quantity);
    product.quantity = newQuantity;
  }

  const movement = {
    id: Date.now(),
    productIndex: productIndex,
    productName: product.name,
    type: type,
    quantity: quantity,
    reason: reason,
    date: new Date().toISOString(),
    previousQuantity: previousQuantity,
    newQuantity: newQuantity
  };

  movements.unshift(movement);
  
  // Garder seulement les 2000 derniers mouvements
  if (movements.length > 2000) {
    movements = movements.slice(0, 2000);
  }

  saveMovements();
  saveProducts();
  renderTable();
  if (typeof updateDashboard === 'function') updateDashboard();
  
  return movement;
}

function recordEntry(productIndex) {
  const product = products[productIndex];
  if (!product) return;

  const quantityStr = prompt(`Quantité à ajouter pour "${product.name}":`, '');
  if (quantityStr === null || quantityStr === '') return;

  const quantity = parseInt(quantityStr);
  if (isNaN(quantity) || quantity <= 0) {
    showNotification('Veuillez entrer une quantité valide', 'error');
    return;
  }

  const reason = prompt('Raison (optionnel):', 'Réception de stock');
  addMovement(productIndex, 'entry', quantity, reason || 'Réception de stock');
  showNotification(`${quantity} unité(s) ajoutée(s) à "${product.name}"`, 'success');
}

function recordExit(productIndex) {
  const product = products[productIndex];
  if (!product) return;

  const maxQuantity = product.quantity || 0;
  if (maxQuantity === 0) {
    showNotification('Le stock est déjà à zéro', 'error');
    return;
  }

  const quantityStr = prompt(`Quantité à retirer pour "${product.name}" (max: ${maxQuantity}):`, '');
  if (quantityStr === null || quantityStr === '') return;

  const quantity = parseInt(quantityStr);
  if (isNaN(quantity) || quantity <= 0) {
    showNotification('Veuillez entrer une quantité valide', 'error');
    return;
  }

  if (quantity > maxQuantity) {
    showNotification(`Vous ne pouvez pas retirer plus que le stock disponible (${maxQuantity})`, 'error');
    return;
  }

  const reason = prompt('Raison (optionnel):', 'Vente');
  addMovement(productIndex, 'exit', quantity, reason || 'Vente');
  showNotification(`${quantity} unité(s) retirée(s) de "${product.name}"`, 'success');
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getProductsToReorder() {
  return products.filter(p => {
    const quantity = p.quantity || 0;
    const threshold = p.minThreshold || 0;
    return quantity <= threshold;
  });
}

// ============================================
// EXPORT CSV
// ============================================

function exportToCSV() {
  if (products.length === 0) {
    showNotification('Aucun produit à exporter', 'error');
    return;
  }

  // Créer le contenu CSV
  const headers = ['Nom', 'Catégorie', 'Quantité', 'Statut'];
  const rows = products.map(p => [
    `"${p.name}"`,
    `"${p.category || 'Non catégorisé'}"`,
    p.quantity || 0,
    (p.quantity || 0) === 0 ? 'Rupture' : 'En stock'
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Créer un blob et télécharger
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `stock_export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showNotification('Export CSV réussi !', 'success');
}

// ============================================
// INITIALISATION
// ============================================

const form = document.getElementById("productForm");
if (form) {
  form.addEventListener("submit", e => {
    e.preventDefault();

    const nameInput = document.getElementById("name");
    const quantityInput = document.getElementById("quantity");
    const categoryInput = document.getElementById("category");
    const submitText = document.getElementById("submitText");

    if (!nameInput || !quantityInput) return;

    const name = nameInput.value.trim();
    const quantity = parseInt(quantityInput.value);
    const category = categoryInput ? categoryInput.value : '';
    const thresholdInput = document.getElementById("minThreshold");
    const threshold = thresholdInput ? parseInt(thresholdInput.value) || 0 : 0;

    if (isNaN(quantity)) {
      showNotification('Veuillez entrer une quantité valide', 'error');
      return;
    }

    // Animation du bouton
    if (submitText) {
      submitText.innerHTML = '<span class="loading"></span> Ajout...';
      form.querySelector('button').disabled = true;
    }

    setTimeout(() => {
      const success = addProductWithThreshold(name, quantity, category, threshold);
      if (success) {
        form.reset();
        nameInput.focus();
      }
      
      if (submitText) {
        submitText.textContent = '➕ Ajouter le produit';
        form.querySelector('button').disabled = false;
      }
    }, 300);
  });

  // Initialiser le rendu
  renderTable();
  setupSearch();
}

// Initialiser le dashboard si on est sur la page d'accueil
if (document.getElementById("totalProducts")) {
  updateDashboard();
}
