import { USERS } from '../helpers/users';
import { defaultPageSetup } from '../helpers/utils';
import test, { expect } from '@playwright/test';

test.only('Welcome Page', async ({ page }) => {
    const uuid = crypto.randomUUID().split('-')[0];
    const userName = `${USERS.homepage}_${uuid}`;
    await defaultPageSetup(page, test, userName);

    await page.goto(`http://localhost:3000/welcome`);

    // Make sure the title is right
    await expect(page.getByText('Welcome to Estuary!')).toBeVisible();
    await expect(page).toHaveScreenshot();
});
