import test, { expect, Page } from '@playwright/test';
import { beforeEach } from 'node:test';
import { USERS } from '../helpers/users';
import { inituser } from '../helpers/utils';

test('Capture create/edit happy path (Hello World)', async ({ page }) => {
    const uuid = crypto.randomUUID().split('-')[0];
    await inituser(page, `${USERS.captures}_${uuid}`);

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
    await page.getByLabel('Name *').fill(uuid);

    // Start discover
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(
        page.getByRole('button', { name: 'Save and publish' })
    ).toBeVisible({ timeout: 30000 }); //MAX_DISCOVER_TIME

    // Edit config and see buttons changed
    await page
        .getByRole('button', { name: 'Endpoint Config Expand to edit' })
        .click();
    await page.getByLabel('Message Rate *').click();
    await page.getByLabel('Message Rate *').fill('12');
    await expect(
        page.getByRole('button', { name: 'Next', exact: true })
    ).toBeVisible();
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // Mess with Schema Evolution and see settings update properly

    ///////////////////////////////
    // Deselecting 1
    await page
        .locator('label')
        .filter({ hasText: 'Automatically keep schemas up' })
        .click();
    await expect(
        page.getByRole('button', { name: 'Save and publish' })
    ).toBeVisible();

    // Disabled 1,2,3
    await expect(
        page
            .locator('label')
            .filter({ hasText: 'Automatically keep schemas up' })
    ).toBeChecked({ checked: false });
    await expect(
        page.locator('label').filter({ hasText: 'Breaking changes re-version' })
    ).toBeChecked({ checked: false });
    await expect(
        page.locator('label').filter({ hasText: 'Automatically add new' })
    ).toBeChecked({ checked: false });
    /////////////////////////

    //////////////////////////////
    // Selecting 1
    await page
        .locator('label')
        .filter({ hasText: 'Automatically keep schemas up' })
        .click();
    await expect(
        page.getByRole('button', { name: 'Save and publish' })
    ).toBeVisible();

    await page
        .locator('label')
        .filter({ hasText: 'Automatically keep schemas up' })
        .click();
    await expect(
        page.getByRole('button', { name: 'Save and publish' })
    ).toBeVisible();

    // Enables only 1
    await expect(
        page
            .locator('label')
            .filter({ hasText: 'Automatically keep schemas up' })
    ).toBeChecked({ checked: true });
    await expect(
        page.locator('label').filter({ hasText: 'Automatically add new' })
    ).toBeChecked({ checked: false });
    await expect(
        page.locator('label').filter({ hasText: 'Breaking changes re-version' })
    ).toBeChecked({ checked: false });
    //////////////////////////////

    //////////////////////////////
    // Selecting 2 = enables 1 and 2
    await page
        .locator('label')
        .filter({ hasText: 'Automatically keep schemas up' })
        .click();
    await page.getByText('Automatically add new').click();

    await expect(
        page
            .locator('label')
            .filter({ hasText: 'Automatically keep schemas up' })
    ).toBeChecked({ checked: true });
    await expect(
        page.locator('label').filter({ hasText: 'Automatically add new' })
    ).toBeChecked({ checked: true });
    await expect(
        page.locator('label').filter({ hasText: 'Breaking changes re-version' })
    ).toBeChecked({ checked: false });
    //////////////////////////////

    //////////////////////////////
    // Selecting 3 = enables 1 and 3
    await page
        .locator('label')
        .filter({ hasText: 'Automatically keep schemas up' })
        .click();
    await page
        .locator('label')
        .filter({ hasText: 'Breaking changes re-version' })
        .click();

    await expect(
        page
            .locator('label')
            .filter({ hasText: 'Automatically keep schemas up' })
    ).toBeChecked({ checked: true });
    await expect(
        page.locator('label').filter({ hasText: 'Automatically add new' })
    ).toBeChecked({ checked: false });
    await expect(
        page.locator('label').filter({ hasText: 'Breaking changes re-version' })
    ).toBeChecked({ checked: true });
    //////////////////////////////

    // Test, wait, assert, close
    await page.getByRole('button', { name: 'Test' }).click();
    await expect(page.getByText('Test Successful. Your capture')).toBeVisible({
        timeout: 60000,
    });
    await page.getByRole('button', { name: 'Close' }).click();

    // Save, wait, assert
    await page.getByRole('button', { name: 'Save and publish' }).click();
    await expect(page.getByText('New Capture Created')).toBeVisible({
        timeout: 60000,
    });

    // Close save and check on details page
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(
        page.getByRole('heading', { name: 'Capture Details' })
    ).toBeVisible();

    // Go back to table and see new capture
    await page.getByLabel('Sources').click();
    await expect(page.getByText(uuid)).toBeVisible();

    // Open up edit
    await page.getByRole('button', { name: 'Edit' }).click();
    await expect(
        page.getByRole('heading', { name: 'Edit Capture' })
    ).toBeVisible();

    // Open endpoint config, change, and make sure next shows up
    await page
        .getByRole('button', { name: 'Endpoint Config Expand to edit' })
        .click();
    await page.getByLabel('Message Rate *').click();
    await page.getByLabel('Message Rate *').fill('123');
    await expect(
        page.getByRole('button', { name: 'Next', exact: true })
    ).toBeVisible();

    // Edit config again to be the original and see the next button goes away
    await page.getByLabel('Message Rate *').click();
    await page.getByLabel('Message Rate *').fill('12');
    await expect(
        page.getByRole('button', { name: 'Save and publish' })
    ).toBeVisible();

    // change again and actually save the changes
    await page.getByLabel('Message Rate *').click();
    await page.getByLabel('Message Rate *').fill('123');
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // Submit new changes
    await expect(
        page.getByRole('button', { name: 'Save and publish' })
    ).toBeVisible();
    await page
        .getByRole('button', { name: 'Save and publish', exact: true })
        .click();
    await expect(page.getByText('Edited Capture Saved')).toBeVisible({
        timeout: 30000,
    });
});
