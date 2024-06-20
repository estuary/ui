import { expect, Page } from '@playwright/test';

export const discoverHelloWorld = async (page: Page, name: string) => {
    // Go to captures
    await page.goto('http://localhost:3000/captures');
    await expect(
        page.getByRole('heading', { name: 'Click "New Capture" to get' })
    ).toBeVisible();

    // Enter Create
    await page.getByRole('button', { name: 'New Capture' }).click();
    await expect(
        page.getByRole('heading', { name: 'Create Capture' })
    ).toBeVisible();

    // Select Hello World
    await page
        .getByRole('button', { name: 'Docs Hello World Capture' })
        .click();

    // Make sure endpoint config has loaded
    await expect(page.getByLabel('Message Rate *')).toBeVisible();

    // Fill out endpoint config
    await page.getByText('Name *').click();
    await page.getByLabel('Name *').fill(name);

    // Start discover
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(
        page.getByRole('button', { name: 'Save and publish' })
    ).toBeVisible({ timeout: 30000 });
};
