import { test, expect } from '@playwright/test';

const BASE = process.env.VITE_API_URL || 'http://localhost:5000';
const APP = process.env.VITE_APP_URL || 'http://localhost:5173';
const ADMIN_EMAIL = 'e2e.tester+local@example.com';
const ADMIN_PASSWORD = 'Password123';

test('Admin UI: edit product name via form and verify server update', async ({ page }) => {
  const api = page.request;

  // Login via API and create a product programmatically
  const loginRes = await api.post(`${BASE}/api/auth/login`, { data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } });
  const loginJson = await loginRes.json();
  if (!loginJson.success) throw new Error('Admin API login failed');
  const adminToken = loginJson.data.accessToken;

  const cats = await api.get(`${BASE}/api/admin/categories`, { headers: { Authorization: `Bearer ${adminToken}` } });
  const catsJson = await cats.json();
  const categoryId = catsJson.data?.[0]?._id;

  const slug = 'e2e-ui-' + Date.now();
  const createRes = await api.post(`${BASE}/api/admin/products`, {
    headers: { Authorization: `Bearer ${adminToken}` },
    data: {
      name: 'E2E UI Product',
      slug,
      description: 'UI test product',
      category: categoryId,
      variants: [{ unitType: 'piece', value: 1, unit: 'pc', price: 100, sku: 'E2E-UI', stock: 5, isDefault: true }],
    },
  });
  const created = await createRes.json();
  if (!created.success) throw new Error('Create product failed');
  const productId = created.data._id;

  // Inject admin token into localStorage so UI loads as admin
  await page.addInitScript(`localStorage.setItem('bv_access_token', ${JSON.stringify(adminToken)})`);
  await page.goto(`${APP}/admin/products`);
  await page.waitForSelector('input[placeholder="Search products..."]', { timeout: 10000 });

  // Search and open edit dialog
  await page.fill('input[placeholder="Search products..."]', slug);
  const row = page.locator('tr', { hasText: slug });
  await expect(row).toBeVisible({ timeout: 10000 });
  await row.locator('button').first().click();

  // Edit name field in dialog and submit
  const dialog = page.locator('div[role="dialog"]');
  await expect(dialog).toBeVisible();
  const newName = 'E2E UI Product - Edited';
  // first input is Name
  await dialog.locator('input').first().fill(newName);
  await dialog.locator('button:has-text("Update")').click();

  // Wait for toast confirmation
  await page.waitForSelector('text=Product updated', { timeout: 10000 });

  // Verify change server-side
  const prodRes = await api.get(`${BASE}/api/admin/products/${productId}`, { headers: { Authorization: `Bearer ${adminToken}` } });
  const prodJson = await prodRes.json();
  if (!prodJson.success) throw new Error('Failed to fetch product from admin API');
  if (prodJson.data.name !== newName) throw new Error(`Product name not updated on server: ${prodJson.data.name}`);
});
