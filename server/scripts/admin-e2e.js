const fs = require('fs');
const path = require('path');
const fetch = globalThis.fetch || require('node-fetch');

const BASE = 'http://localhost:5000/api';
const admin = { email: 'e2e.tester+local@example.com', password: 'Password123' };

async function run() {
  try {
    console.log('Writing temp image...');
    const imgBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII='; // 1x1 png
    const imgBuf = Buffer.from(imgBase64, 'base64');
    const imgPath = path.join(__dirname, '.tmp-e2e.png');
    fs.writeFileSync(imgPath, imgBuf);

    console.log('Logging in...');
    let res = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(admin),
    });
    const login = await res.json();
    if (!login?.success) throw new Error('Login failed: ' + JSON.stringify(login));
    const token = login.data.accessToken;
    console.log('Logged in, token length', token.length);

    const headers = { Authorization: 'Bearer ' + token };

    // List admin products
    console.log('Fetching admin products...');
    res = await fetch(`${BASE}/admin/products`, { headers });
    const prodList = await res.json();
    console.log('Products list:', prodList.success ? (prodList.data?.length || 0) + ' items' : JSON.stringify(prodList));

    // Create a new product
    console.log('Creating test product...');
    const newProductPayload = {
      name: 'E2E Test Product',
      slug: 'e2e-test-product-' + Date.now(),
      description: 'Created by E2E script',
      category: undefined,
      variants: [{ unitType: 'piece', value: 1, unit: 'pc', price: 123, sku: 'E2E-1', stock: 10, isDefault: true }],
    };
    res = await fetch(`${BASE}/admin/products`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(newProductPayload),
    });
    const created = await res.json();
    console.log('Create product response:', created.success ? created.data : created);
    if (!created.success) throw new Error('Create product failed');
    const prodId = created.data._id;

    // Upload image for product
    console.log('Uploading image for product:', prodId);
    const form = new FormData();
    form.append('image', fs.createReadStream(imgPath), { filename: 'e2e.png', contentType: 'image/png' });
    res = await fetch(`${BASE}/upload/product/${prodId}`, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token },
      body: form,
    });
    const uploadResp = await res.json();
    console.log('Upload response:', uploadResp);
    if (!uploadResp.success) throw new Error('Upload failed');
    const imgKey = uploadResp.data.key;

    // Delete the uploaded image
    console.log('Deleting uploaded image...');
    res = await fetch(`${BASE}/upload/product/${prodId}/image/${encodeURIComponent(imgKey)}`, {
      method: 'DELETE',
      headers,
    });
    const del = await res.json();
    console.log('Delete response:', del);

    // Cleanup: delete product
    console.log('Deleting test product...');
    res = await fetch(`${BASE}/admin/products/${prodId}`, { method: 'DELETE', headers });
    const delProd = await res.json();
    console.log('Delete product response:', delProd);

    console.log('E2E script completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('E2E script error:', err);
    process.exit(2);
  }
}

run();
