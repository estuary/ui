import { test as base } from '@playwright/test';

export const test_base = base.extend({
    page: async ({ baseURL, page }, use) => {
        // Eat requests we don't want lekaing out of tests
        await page.route('*js.stripe*', async () => {});
        await page.route('*lr.com', async () => {});

        use(page);
    },
});
