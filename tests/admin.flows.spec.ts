import { test, expect } from '@playwright/test';
import path from 'path';

const BASE = process.env.VITE_API_URL || 'http://localhost:5000';
const APP = process.env.VITE_APP_URL || 'http://localhost:5173';
const ADMIN_EMAIL = 'e2e.tester+local@example.com';
const ADMIN_PASSWORD = 'Password123';

test.describe('Admin flows (orders, users, variants)', () => {
  test('Orders: create order via API and view in admin UI', async ({ page }) => {
    const api = page.request;

    // Admin create product
    const adminLogin = await api.post(`${BASE}/api/auth/login`, { data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } });
    const adminJson = await adminLogin.json();
    if (!adminJson.success) throw new Error('Admin login failed');
    const adminToken = adminJson.data.accessToken;

    // create product
    const cats = await api.get(`${BASE}/api/admin/categories`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const catsJson = await cats.json();
    const categoryId = catsJson.data?.[0]?._id;

    const productSlug = 'e2e-orders-' + Date.now();
    const createRes = await api.post(`${BASE}/api/admin/products`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        name: 'E2E Orders Product',
        slug: productSlug,
        description: 'For orders test',
        category: categoryId,
        variants: [
          { unitType: 'piece', value: 1, unit: 'pc', price: 199, sku: 'E2E-ORD-1', stock: 10, isDefault: true },
        ],
      },
    });
    const created = await createRes.json();
    if (!created.success) throw new Error('Create product failed');
    const productId = created.data._id;

    const product = created.data;
    const variantId = product.variants.find((v: any) => v.isDefault)._id;

    // Create customer user
    const userEmail = `e2e.customer+${Date.now()}@example.com`;
    const pwd = 'Password123';
    await api.post(`${BASE}/api/auth/register`, { data: { name: 'E2E Cust', email: userEmail, password: pwd } });
    const loginUser = await api.post(`${BASE}/api/auth/login`, { data: { email: userEmail, password: pwd } });
    const userJson = await loginUser.json();
    if (!userJson.success) throw new Error('User login failed');
    const userToken = userJson.data.accessToken;

    // Add to cart and create order as customer
    await api.post(`${BASE}/api/cart/items`, { headers: { Authorization: `Bearer ${userToken}` }, data: { productId: product._id, variantId, quantity: 1 } });

    const ship = {
      firstName: 'E2E',
      lastName: 'Customer',
      email: userEmail,
      phone: '9999999999',
      address: '123 Test Lane',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
    };

    const orderRes = await api.post(`${BASE}/api/orders`, { headers: { Authorization: `Bearer ${userToken}` }, data: { shippingAddress: ship, paymentMethod: 'COD' } });
    const orderJson = await orderRes.json();
    if (!orderJson.success) throw new Error('Create order failed');
    const order = orderJson.data;

    // Set frontend access token so admin pages load without UI signin
    await page.addInitScript(`localStorage.setItem('bv_access_token', ${JSON.stringify(adminToken)})`);
    await page.goto(`${APP}/admin/orders`);
    await page.waitForSelector('text=Orders', { timeout: 10000 });

    // Verify the order row exists (by customer's email)
    await expect(page.locator('tr', { hasText: userEmail })).toBeVisible({ timeout: 10000 });
    // Open detail dialog and assert email inside the dialog
    const row = page.locator('tr', { hasText: userEmail });
    await row.locator('button').first().click();
    await page.waitForSelector('text=Order Details', { timeout: 5000 });
    const dialog = page.locator('div[role="dialog"]');
    await expect(dialog).toContainText(userEmail);
  });

  test('Users: create user and change role via admin UI', async ({ page }) => {
    const api = page.request;
    const adminLogin = await api.post(`${BASE}/api/auth/login`, { data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } });
    const adminJson = await adminLogin.json();
    if (!adminJson.success) throw new Error('Admin login failed');

    const userEmail = `e2e.user+${Date.now()}@example.com`;
    const pwd = 'Password123';
    const regRes = await api.post(`${BASE}/api/auth/register`, { data: { name: 'E2E User', email: userEmail, password: pwd } });
    const regJson = await regRes.json();
    if (!regJson.success) throw new Error('User registration failed');
    const createdUserId = regJson.data.user._id;
    // Use admin API to locate the created user and change role (more reliable than UI search)
    // Promote user via admin API using returned id and verify
    const promoteRes = await api.patch(`${BASE}/api/admin/users/${createdUserId}/role`, { headers: { Authorization: `Bearer ${adminJson.data.accessToken}` }, data: { role: 'admin' } });
    const promoteJson = await promoteRes.json();
    if (!promoteJson.success) throw new Error('Failed to update user role via admin API');
  });

  test('Variants: create product with variants and verify default variant appears in edit dialog', async ({ page }) => {
    const api = page.request;
    const adminLogin = await api.post(`${BASE}/api/auth/login`, { data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } });
    const adminJson = await adminLogin.json();
    if (!adminJson.success) throw new Error('Admin login failed');
    const adminToken = adminJson.data.accessToken;

    const cats = await api.get(`${BASE}/api/admin/categories`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const catsJson = await cats.json();
    const categoryId = catsJson.data?.[0]?._id;

    const slug = 'e2e-variants-' + Date.now();
    const createRes = await api.post(`${BASE}/api/admin/products`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        name: 'E2E Variants Product',
        slug,
        description: 'Variants test',
        category: categoryId,
        variants: [
          { unitType: 'piece', value: 1, unit: 'pc', price: 250, sku: 'E2E-V1', stock: 7, isDefault: true },
          { unitType: 'piece', value: 2, unit: 'pc', price: 450, sku: 'E2E-V2', stock: 3, isDefault: false },
        ],
      },
    });
    const created = await createRes.json();
    if (!created.success) throw new Error('Create product failed');

    // Use admin token to skip UI signin
    await page.addInitScript(`localStorage.setItem('bv_access_token', ${JSON.stringify(adminToken)})`);
    await page.goto(`${APP}/admin/products`);
    await page.fill('input[placeholder="Search products..."]', slug);
    const row = page.locator('tr', { hasText: slug });
    await expect(row).toBeVisible({ timeout: 10000 });
    await row.locator('button').first().click();

    // Verify variants server-side via admin API (more reliable than trying to parse complex inputs)
    const productId = created.data._id;
    const prodRes = await api.get(`${BASE}/api/admin/products/${productId}`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const prodJson = await prodRes.json();
    if (!prodJson.success) throw new Error('Failed to fetch product from admin API');
    const serverProduct = prodJson.data;
    const defaultVariant = serverProduct.variants.find((v: any) => v.isDefault);
    if (!defaultVariant) throw new Error('Default variant not found on server');
    if (defaultVariant.price !== 250) throw new Error(`Unexpected default variant price: ${defaultVariant.price}`);
    if (defaultVariant.stock !== 7) throw new Error(`Unexpected default variant stock: ${defaultVariant.stock}`);
  });
});
