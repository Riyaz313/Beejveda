import { test, expect } from '@playwright/test';
import path from 'path';

const BASE = process.env.VITE_API_URL || 'http://localhost:5000';
const APP = process.env.VITE_APP_URL || 'http://localhost:5173';
const ADMIN_EMAIL = 'e2e.tester+local@example.com';
const ADMIN_PASSWORD = 'Password123';

test.describe('Admin dashboard', () => {
  test('login, create product via API, upload image via UI, delete image, deactivate product', async ({ page }) => {
    // Programmatic admin login to create product via API
    const api = page.request;
    const loginRes = await api.post(`${BASE}/api/auth/login`, { data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } });
    const loginJson = await loginRes.json();
    if (!loginJson.success) throw new Error('API login failed');
    const token = loginJson.data.accessToken;

    // Fetch a category to attach
    const cats = await api.get(`${BASE}/api/admin/categories`, { headers: { Authorization: `Bearer ${token}` } });
    const catsJson = await cats.json();
    const categoryId = catsJson.data?.[0]?._id;

    const slug = 'e2e-playwright-' + Date.now();
    const createRes = await api.post(`${BASE}/api/admin/products`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        name: 'E2E Playwright Product',
        slug,
        description: 'Created by Playwright',
        category: categoryId,
        variants: [{ unitType: 'piece', value: 1, unit: 'pc', price: 199, sku: 'E2E-PW', stock: 5, isDefault: true }],
      },
    });
    const created = await createRes.json();
    if (!created.success) throw new Error('Create product failed: ' + JSON.stringify(created));

    // Now use the UI to login (so browser session is authenticated) and navigate to admin products
    await page.goto(`${APP}/account`);
    await page.fill('input[placeholder="john@example.com"]', ADMIN_EMAIL);
    await page.fill('input[placeholder="••••••••"]', ADMIN_PASSWORD);
    await page.click('button:has-text("Sign In")');
    // Wait for account page to show admin link or for auth to settle
    await page.waitForTimeout(500);
    await page.goto(`${APP}/admin/products`);
    await page.waitForSelector('input[placeholder="Search products..."]', { timeout: 10000 });

    // Search for our product by slug and open edit dialog
    await page.fill('input[placeholder="Search products..."]', slug);
    await page.click('button:has-text("Add Product")');
    // Close the create dialog and instead find the product row
    await page.click('button:has-text("Cancel")');

    // Wait for table row and click the edit (pencil) button for the product row
    const row = page.locator('tr', { hasText: slug });
    await expect(row).toBeVisible({ timeout: 5000 });
    const editBtn = row.locator('button').first();
    await expect(editBtn).toBeVisible({ timeout: 5000 });
    await editBtn.click();

    // Wait for images section and upload input
    const fileInput = page.locator('#product-image-upload');
    await expect(fileInput).toBeVisible({ timeout: 5000 });
    await fileInput.setInputFiles(path.resolve(process.cwd(), 'tests/fixtures/e2e.png'));

    // Wait for upload confirmation (toast)
    await page.waitForSelector('text=Image uploaded', { timeout: 10000 });

    // Delete image via UI (first Delete button inside dialog)
    await page.locator('div[role="dialog"] button:has-text("Delete")').first().click();
    await page.waitForSelector('text=Image deleted', { timeout: 10000 });
    // Close edit dialog
    await page.click('div[role="dialog"] button:has-text("Cancel")');
    await page.waitForSelector('div[data-state="open"]', { state: 'detached', timeout: 5000 });

    // Deactivate product via table action: click trash button on the same row, then confirm
    const trashBtn = row.locator('button').nth(1);
    await trashBtn.click();
    // Confirm deactivate in dialog
    await page.click('div[role="dialog"] button:has-text("Deactivate")');
    await page.waitForSelector('text=Product deactivated', { timeout: 10000 });
  });
});
