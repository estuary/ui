import { expect, Page } from '@playwright/test';

export const discover_HelloWorld = async (page: Page, name: string) => {
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

export const editEndpoint_HelloWorld = async (
    page: Page,
    messageRate: string
) => {
    // Edit config and see buttons changed
    await page.getByLabel('Message Rate *').click();
    await page.getByLabel('Message Rate *').fill(messageRate);
};

export const testConfig = async (page: Page) => {
    // Test, wait, assert, close
    await page.getByRole('button', { name: 'Test' }).click();

    await page
        .getByRole('listitem')
        .locator('div')
        .filter({ hasText: 'Success' });

    await page.getByRole('button', { name: 'Close' }).click();
};

export const saveAndPublish = async (page: Page) => {
    // Save, wait, assert, close, view details
    await page.getByRole('button', { name: 'Save and publish' }).click();

    await page
        .getByRole('listitem')
        .locator('div')
        .filter({ hasText: 'Success' });

    await page.getByRole('button', { name: 'Close' }).click();

    await expect(page.getByText('Capture Details')).toBeVisible();
};

export const openDetailsFromTable = async (page: Page, captureName: string) => {
    await page.goto('http://localhost:3000/captures');

    await expect(page.getByText('New Capture')).toBeVisible();

    await page
        .getByRole('link', {
            name: captureName,
            exact: true,
        })
        .click();
};
