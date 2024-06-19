import test, { expect, Page } from '@playwright/test';
import { beforeEach } from 'node:test';
import { USERS } from '../helpers/users';
import { inituser } from '../helpers/utils';

test.only('has basic functionality', async ({ page }) => {
    await inituser(page, USERS.captures);
    await page.goto(`http://localhost:3000/captures`);

    // Make sure the title is right
    await expect(page.getByText('new capture')).toBeVisible();
    await expect(page).toHaveScreenshot();
});
