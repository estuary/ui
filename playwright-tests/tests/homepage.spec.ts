import test, { expect, Page } from '@playwright/test';
import { startSessionWithUser } from '../helpers/utils';
import { generateEmail } from './props';
import { USERS } from '../helpers/users';

test('has basic functionality', async ({ page }) => {
    await startSessionWithUser(page, USERS.homepage);
    await page.goto(`http://localhost:3000/welcome`);

    // Make sure the title is right
    await expect(page.getByText('Welcome to Flow!')).toBeVisible();
    await expect(page).toHaveScreenshot();
});
