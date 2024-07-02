import { test, expect } from '@playwright/test';

test('has basic functionality', async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    // Make sure the title is right
    await expect(page).toHaveTitle('Flow · Login');

    // Register updates UI
    await page.getByText('Register').click();
    await expect(
        page.getByRole('heading', {
            name: 'Please log in with a provider to use Estuary Flow for free.',
        })
    ).toBeVisible();

    // Go back to login
    await page.getByText('Sign In').click();
    await expect(
        page.getByRole('heading', {
            name: 'Sign in to continue to Estuary Flow.',
        })
    ).toBeVisible();

    // Check on auth providers
    await expect(page.getByText('Sign in with Google')).toBeVisible();
    await expect(page.getByText('Sign in with GitHub')).toBeVisible();
    await expect(page.getByText('Sign in with Azure')).toBeVisible();
});
