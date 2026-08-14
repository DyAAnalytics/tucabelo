<?php
session_start();
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tucabelo | Panel de Administración</title>
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/admin.css">
</head>
<body>

    <!-- LOGIN SCREEN -->
    <div id="login-screen" class="glass-panel active">
        <div class="login-box">
            <div class="logo-wrap">
                <img src="images/logo.png" alt="Tucabelo" class="login-logo">
            </div>
            <h2>Acceso Privado</h2>
            <p>Administración de Catálogo Tucabelo</p>
            <form id="login-form">
                <div class="input-group">
                    <input type="password" id="admin-password" placeholder="Contraseña de acceso" required>
                </div>
                <button type="submit" class="btn-primary">Ingresar</button>
                <div id="login-error" class="error-msg"></div>
            </form>
        </div>
    </div>

    <!-- MAIN DASHBOARD -->
    <div id="dashboard" class="dashboard-layout">
        <aside class="sidebar glass-panel">
            <div class="sidebar-header">
                <img src="images/logo.png" alt="Tucabelo" class="sidebar-logo">
                <h3>Admin Panel</h3>
            </div>
            <nav class="sidebar-nav">
                <a href="#" class="nav-item active">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                    Productos
                </a>
                <a href="index.html" class="nav-item" target="_blank">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    Ver Catálogo
                </a>
                <button id="logout-btn" class="nav-item logout-btn">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    Cerrar Sesión
                </button>
            </nav>
        </aside>

        <main class="main-content">
            <header class="topbar glass-panel">
                <div class="topbar-info">
                    <h1>Catálogo de Productos</h1>
                    <span class="badge" id="total-products">0 Productos</span>
                </div>
                <button id="btn-add-new" class="btn-primary">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    Nuevo Producto
                </button>
            </header>

            <div class="table-container glass-panel">
                <table class="products-table">
                    <thead>
                        <tr>
                            <th>Imagen</th>
                            <th>Nombre</th>
                            <th>Categoría</th>
                            <th>Precio</th>
                            <th>Precio Oferta</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="products-tbody">
                        <!-- Loaded dynamically via JS -->
                    </tbody>
                </table>
                <div id="loading-spinner" class="spinner"></div>
            </div>
        </main>
    </div>

    <!-- MODAL ADD/EDIT PRODUCT -->
    <div id="product-modal" class="modal-overlay">
        <div class="modal-content glass-panel">
            <div class="modal-header">
                <h2 id="modal-title">Agregar Producto</h2>
                <button class="close-modal" id="close-modal">✕</button>
            </div>
            <form id="product-form">
                <input type="hidden" id="prod-id">
                
                <div class="form-grid">
                    <div class="form-group">
                        <label for="prod-name">Nombre del Producto</label>
                        <input type="text" id="prod-name" required placeholder="Ej: WMARK NG-X1">
                    </div>
                    
                    <div class="form-group">
                        <label for="prod-price">Precio Normal (CLP)</label>
                        <input type="number" id="prod-price" required placeholder="Ej: 25000">
                    </div>
                    
                    <div class="form-group">
                        <label for="prod-sale-price">Precio Oferta (CLP) <small style="color:var(--text-muted);font-weight:400">(opcional)</small></label>
                        <input type="number" id="prod-sale-price" placeholder="Ej: 19990 — dejar vacío si no hay oferta">
                    </div>
                    
                    <div class="form-group">
                        <label for="prod-cat">Categoría</label>
                        <select id="prod-cat" required>
                            <option value="Clippers">Clippers</option>
                            <option value="Shavers">Shavers</option>
                            <option value="Trimmers">Trimmers</option>
                            <option value="Accesorios">Accesorios</option>
                            <option value="Barbería">Barbería</option>
                            <option value="Otros">Otros</option>
                        </select>
                    </div>
                    
                    <div class="form-group image-upload-group">
                        <label>Imagen del Producto</label>
                        
                        <div class="image-options">
                            <label class="radio-label">
                                <input type="radio" name="img-type" value="upload" checked> Subir Imagen
                            </label>
                            <label class="radio-label">
                                <input type="radio" name="img-type" value="url"> Usar URL
                            </label>
                        </div>

                        <!-- Upload File Input -->
                        <div id="img-upload-wrap" class="img-input-wrap active">
                            <input type="file" id="prod-image-file" accept="image/*">
                            <small>Sube una imagen desde tu PC/Celular.</small>
                        </div>
                        
                        <!-- URL Input -->
                        <div id="img-url-wrap" class="img-input-wrap">
                            <input type="url" id="prod-image-url" placeholder="https://...">
                            <small>Ingresa la dirección web de la imagen.</small>
                        </div>
                        
                        <!-- Preview -->
                        <div class="img-preview-box">
                            <img id="prod-image-preview" src="" style="display:none;">
                            <input type="hidden" id="prod-image-final">
                        </div>
                    </div>
                </div>
                
                <div class="modal-actions">
                    <button type="button" class="btn-secondary" id="cancel-modal">Cancelar</button>
                    <button type="submit" class="btn-primary" id="save-product-btn">Guardar Producto</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Toast Notifications -->
    <div id="toast-container" class="toast-container"></div>

    <script src="js/admin.js"></script>
</body>
</html>
