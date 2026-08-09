/* =============================================
   TUCABELO ADMIN - JS
   ============================================= */

let currentProducts = [];

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');

const productsTbody = document.getElementById('products-tbody');
const totalProducts = document.getElementById('total-products');
const spinner = document.getElementById('loading-spinner');

const modal = document.getElementById('product-modal');
const productForm = document.getElementById('product-form');
const btnAddNew = document.getElementById('btn-add-new');
const btnCloseModal = document.getElementById('close-modal');
const btnCancelModal = document.getElementById('cancel-modal');

// Modal inputs
const prodId = document.getElementById('prod-id');
const prodName = document.getElementById('prod-name');
const prodPrice = document.getElementById('prod-price');
const prodCat = document.getElementById('prod-cat');
const radioImgTypes = document.getElementsByName('img-type');
const imgUploadWrap = document.getElementById('img-upload-wrap');
const imgUrlWrap = document.getElementById('img-url-wrap');
const fileInput = document.getElementById('prod-image-file');
const urlInput = document.getElementById('prod-image-url');
const imgPreview = document.getElementById('prod-image-preview');
const imgFinal = document.getElementById('prod-image-final');

// Format Price
function formatPrice(n) {
    return '$' + parseInt(n).toLocaleString('es-CL');
}

// Show Toast
function showToast(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ================= AUTHENTICATION =================

async function checkAuth() {
    try {
        const res = await fetch('api/auth.php?action=check');
        const data = await res.json();
        if (data.logged_in) {
            showDashboard();
        } else {
            showLogin();
        }
    } catch (e) {
        showLogin();
    }
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pass = document.getElementById('admin-password').value;
    
    try {
        const res = await fetch('api/auth.php?action=login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ password: pass })
        });
        const data = await res.json();
        if (data.success) {
            showDashboard();
        } else {
            loginError.textContent = data.message || 'Error de acceso';
        }
    } catch (e) {
        loginError.textContent = 'Error de conexión';
    }
});

logoutBtn.addEventListener('click', async () => {
    await fetch('api/auth.php?action=logout');
    showLogin();
});

function showDashboard() {
    loginScreen.classList.remove('active');
    dashboard.classList.add('active');
    loadProducts();
}

function showLogin() {
    dashboard.classList.remove('active');
    loginScreen.classList.add('active');
    document.getElementById('admin-password').value = '';
    loginError.textContent = '';
}

// ================= CRUD PRODUCTS =================

async function loadProducts() {
    spinner.style.display = 'block';
    productsTbody.innerHTML = '';
    
    try {
        const res = await fetch('api/products.php');
        currentProducts = await res.json();
        renderTable();
    } catch (e) {
        showToast('Error cargando productos', 'error');
    } finally {
        spinner.style.display = 'none';
    }
}

function renderTable() {
    totalProducts.textContent = `${currentProducts.length} Productos`;
    productsTbody.innerHTML = currentProducts.map(p => `
        <tr>
            <td class="prod-img-cell">
                <img src="${p.image || 'images/logo.png'}" alt="${p.name}">
            </td>
            <td><strong>${p.name}</strong></td>
            <td><span class="cat-badge">${p.category}</span></td>
            <td>${formatPrice(p.price)}</td>
            <td>
                <button class="action-btn edit-btn" onclick="openEdit('${p.id}')">✏️ Editar</button>
                <button class="action-btn del-btn" onclick="deleteProduct('${p.id}')">🗑️ Borrar</button>
            </td>
        </tr>
    `).join('');
}

// ================= MODAL & FORM LOGIC =================

function openModal(title) {
    document.getElementById('modal-title').textContent = title;
    modal.classList.add('active');
}

function closeModalHandler() {
    modal.classList.remove('active');
    productForm.reset();
    prodId.value = '';
    imgPreview.style.display = 'none';
    imgPreview.src = '';
    imgFinal.value = '';
    
    // Reset image options
    document.querySelector('input[name="img-type"][value="upload"]').checked = true;
    toggleImgInput();
}

btnCloseModal.addEventListener('click', closeModalHandler);
btnCancelModal.addEventListener('click', closeModalHandler);
btnAddNew.addEventListener('click', () => openModal('Agregar Nuevo Producto'));

// Toggle Image Input (Upload vs URL)
function toggleImgInput() {
    const isUpload = document.querySelector('input[name="img-type"]:checked').value === 'upload';
    imgUploadWrap.classList.toggle('active', isUpload);
    imgUrlWrap.classList.toggle('active', !isUpload);
}

radioImgTypes.forEach(radio => radio.addEventListener('change', toggleImgInput));

// Preview URL Image
urlInput.addEventListener('input', () => {
    if (urlInput.value) {
        imgPreview.src = urlInput.value;
        imgPreview.style.display = 'inline-block';
        imgFinal.value = urlInput.value;
    }
});

// Preview File Image (Local)
fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = e => {
            imgPreview.src = e.target.result;
            imgPreview.style.display = 'inline-block';
            // imgFinal will be updated after upload to server
        };
        reader.readAsDataURL(file);
    }
});

window.openEdit = function(id) {
    const p = currentProducts.find(x => x.id === id);
    if (!p) return;
    
    prodId.value = p.id;
    prodName.value = p.name;
    prodPrice.value = p.price;
    prodCat.value = p.category;
    
    // Decide if image is URL or Upload
    if (p.image && p.image.startsWith('http')) {
        document.querySelector('input[name="img-type"][value="url"]').checked = true;
        urlInput.value = p.image;
    } else {
        document.querySelector('input[name="img-type"][value="upload"]').checked = true;
        // Cant set file input value, but we can show preview
    }
    toggleImgInput();
    
    if (p.image) {
        imgPreview.src = p.image;
        imgPreview.style.display = 'inline-block';
        imgFinal.value = p.image;
    }
    
    openModal('Editar Producto');
}

window.deleteProduct = async function(id) {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
    
    try {
        const res = await fetch('api/products.php?id=' + id, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            showToast('Producto eliminado');
            loadProducts();
        } else {
            showToast('Error al eliminar', 'error');
        }
    } catch (e) {
        showToast('Error de conexión', 'error');
    }
}

// Subir Imagen al Servidor
async function uploadImage() {
    const file = fileInput.files[0];
    if (!file) return imgFinal.value; // If no new file, use existing imgFinal

    const formData = new FormData();
    formData.append('image', file);

    try {
        const res = await fetch('api/upload.php', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        if (data.success) {
            return data.url;
        } else {
            showToast(data.message || 'Error subiendo imagen', 'error');
            return null;
        }
    } catch (e) {
        showToast('Error subiendo imagen', 'error');
        return null;
    }
}

productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const isUpload = document.querySelector('input[name="img-type"]:checked').value === 'upload';
    let finalImageUrl = imgFinal.value;
    
    if (isUpload && fileInput.files.length > 0) {
        const uploadedUrl = await uploadImage();
        if (!uploadedUrl) return; // Stop if upload failed
        finalImageUrl = uploadedUrl;
    } else if (!isUpload) {
        finalImageUrl = urlInput.value;
    }

    const pData = {
        id: prodId.value,
        name: prodName.value,
        price: prodPrice.value,
        category: prodCat.value,
        image: finalImageUrl
    };

    const method = pData.id ? 'PUT' : 'POST';
    
    try {
        const res = await fetch('api/products.php', {
            method: method,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(pData)
        });
        const data = await res.json();
        if (data.success) {
            showToast(pData.id ? 'Producto actualizado' : 'Producto agregado');
            closeModalHandler();
            loadProducts();
        } else {
            showToast('Error al guardar', 'error');
        }
    } catch (err) {
        showToast('Error de conexión', 'error');
    }
});

// INIT
checkAuth();
