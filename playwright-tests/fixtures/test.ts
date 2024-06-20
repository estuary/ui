import { test as base } from '@playwright/test';

export const test_base = base.extend({
    page: async ({ baseURL, page }, use) => {
        // You can log / block / etc network calls here
        await page.route('**/*', async (route, _request) => {
            await route.continue();
        });

        // Eat requests we don't want lekaing out of tests
        await page.route('*js.stripe*', async () => {});
        await page.route('*lr.com', async () => {});

        await page.context().addInitScript(() => {
            // Keep the left nav open
            window.localStorage.setItem(
                'estuary.navigation-settings',
                JSON.stringify({ open: true })
            );

            // Hide the help docs
            window.localStorage.setItem('estuary.side-panel-docs', 'false');
        });

        use(page);
    },
});
