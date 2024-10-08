import { expect, Page } from '@playwright/test';

export const discover_HelloWorld = async (
    page: Page,
    name: string,
    stopIfAlreadyThere: boolean = false
) => {
    // Go to captures
    await page.goto('http://localhost:3000/captures');
    await expect(
        stopIfAlreadyThere
            ? page.getByRole('heading', {
                  name: 'Click "New Capture" to get',
              })
            : page.getByRole('button', { name: 'New Capture' })
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

    // Wait for things to load
    await expect(page.getByRole('button', { name: 'Next' })).toBeEnabled();

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
