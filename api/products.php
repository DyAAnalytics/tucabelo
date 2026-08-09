<?php
session_start();
header('Content-Type: application/json');

$dataFile = __DIR__ . '/../data/products.json';

function getProducts() {
    global $dataFile;
    if (!file_exists($dataFile)) {
        return [];
    }
    $json = file_get_contents($dataFile);
    return json_decode($json, true) ?: [];
}

function saveProducts($products) {
    global $dataFile;
    file_put_contents($dataFile, json_encode($products, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

$method = $_SERVER['REQUEST_METHOD'];

// GET: Leer productos
if ($method === 'GET') {
    echo json_encode(getProducts());
    exit;
}

// Para POST, PUT, DELETE se requiere autenticación
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(403);
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

// POST: Agregar producto
if ($method === 'POST') {
    if (!$input) {
        $input = $_POST; // En caso de que se envíe como multipart/form-data
    }
    $products = getProducts();
    $newProduct = [
        'id' => uniqid(),
        'name' => $input['name'] ?? 'Sin nombre',
        'price' => intval($input['price'] ?? 0),
        'category' => $input['category'] ?? 'Otros',
        'image' => $input['image'] ?? ''
    ];
    array_unshift($products, $newProduct); // Add to top
    saveProducts($products);
    echo json_encode(['success' => true, 'product' => $newProduct]);
    exit;
}

// PUT: Editar producto
if ($method === 'PUT') {
    $products = getProducts();
    $id = $input['id'] ?? null;
    $updated = false;
    
    foreach ($products as &$product) {
        if ($product['id'] === $id) {
            $product['name'] = $input['name'] ?? $product['name'];
            $product['price'] = intval($input['price'] ?? $product['price']);
            $product['category'] = $input['category'] ?? $product['category'];
            $product['image'] = $input['image'] ?? $product['image'];
            $updated = true;
            break;
        }
    }
    
    if ($updated) {
        saveProducts($products);
        echo json_encode(['success' => true]);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Producto no encontrado']);
    }
    exit;
}

// DELETE: Eliminar producto
if ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        $input = json_decode(file_get_contents('php://input'), true);
        $id = $input['id'] ?? null;
    }
    
    $products = getProducts();
    $initialCount = count($products);
    $products = array_filter($products, function($p) use ($id) {
        return $p['id'] !== $id;
    });
    
    if (count($products) < $initialCount) {
        // Re-index array
        $products = array_values($products);
        saveProducts($products);
        echo json_encode(['success' => true]);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Producto no encontrado']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método no permitido']);
