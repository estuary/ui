import test, { expect, Page } from '@playwright/test';
import { inituser, startSessionWithUser } from '../helpers/utils';
import { generateEmail } from './props';
import { USERS } from '../helpers/users';

test('has basic functionality', async ({ page }) => {
    const uuid = crypto.randomUUID().split('-')[0];
    await inituser(page, `${USERS.homepage}_${uuid}`);
    await page.goto(`http://localhost:3000/welcome`);

    // Make sure the title is right
    await expect(page.getByText('Welcome to Flow!')).toBeVisible();
    await expect(page).toHaveScreenshot();
});
