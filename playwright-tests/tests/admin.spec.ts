import { expect, test, Page } from '@playwright/test';
import { beforeEach } from 'node:test';
import { USERS } from '../helpers/users';
import {
    defaultLocalStorage,
    defaultPageSetup,
    emailDomain,
    inituser,
    startSessionWithUser,
    saveAndPublish,
} from '../helpers/utils';
import {
    discover_HelloWorld,
    editEndpoint_HelloWorld,
    testConfig,
} from '../helpers/captures';

test.describe.serial.only('Admin:', () => {
    const uuid = crypto.randomUUID().split('-')[0];
    const userName = `${USERS.captures}_${uuid}`;
    const tenant = `${userName}/`;
    const userEmail = `${userName}${emailDomain}`;

    let page: Page;
    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();
        await defaultPageSetup(page, userName);
        await page.getByLabel('Admin').click();
    });

    // TODO (tables - aria label)
    // These need fixed by making the tables have unique selectors.
    //   Should make the aria-label actually useful instead of always "entity table"
    test.describe('Account Access', () => {
        test.beforeAll(async () => {
            await page.getByRole('tab', { name: 'Account Access' }).click();
        });

        test('shows user has access to tenant', async () => {
            await expect(
                page.getByText('Organization Membership')
            ).toBeVisible();
            await expect(
                page.locator('.MuiTableBody-root .MuiTableRow-root td').nth(2)
            ).toContainText(userName);
            await expect(
                page.locator('.MuiTableBody-root .MuiTableRow-root td').nth(3)
            ).toContainText('admin');
            await expect(
                page.locator('.MuiTableBody-root .MuiTableRow-root td').nth(3)
            ).toContainText(tenant);
        });

        test('default data sharing with support', async () => {
            await expect(page.getByText('Data Sharing')).toBeVisible();
            await expect(
                page.locator('.MuiTableBody-root .MuiTableRow-root td').nth(2)
            ).toContainText(tenant);
            await expect(
                page.locator('.MuiTableBody-root .MuiTableRow-root td').nth(3)
            ).toContainText('estuary_support');
        });
    });

    test.describe.only('Settings', () => {
        test.beforeAll(async () => {
            await page.getByRole('tab', { name: 'Settings' }).click();
        });

        test.describe('Organization Settings', () => {
            test('are defaulted correctly', async () => {
                await expect(
                    page.getByLabel('Organization Notifications Table')
                ).toContainText(tenant);

                await expect(
                    page.getByLabel('Organization Notifications Table')
                ).toContainText(userEmail);
            });

            test('can open the notification configurator dialog', async () => {
                await page
                    .getByRole('button', { name: 'Configure Notifications' })
                    .click();
                await expect(
                    page.getByText(
                        `Choose where you'd like notifications to be sent`
                    )
                ).toBeVisible();
            });

            test('will have current settings loaded', async () => {
                await expect(
                    page
                        .getByLabel('Configure Notification Methods')
                        .getByText(tenant)
                ).toBeVisible();

                await expect(
                    page.getByRole('button', { name: userEmail })
                ).toBeVisible();
            });

            test('will validate emails', async () => {
                await page.getByLabel('Email *').fill('invalid');
                await page.getByLabel('Email *').press('Enter');
                await expect(
                    page.getByText('One or more emails are not')
                ).toBeVisible();
            });

            test('can be closed', async () => {
                await page.getByRole('button', { name: 'Cancel' }).click();
            });
        });

        test.describe('Cloud Storage', () => {
            test('is defaulted correctly', async () => {
                await expect(
                    page.getByLabel('Storage Locations Table')
                ).toContainText(tenant);

                await expect(
                    page.getByLabel('Storage Locations Table')
                ).toContainText('estuary-trial');

                await expect(
                    page.getByLabel('Storage Locations Table')
                ).toContainText('collection-data');
            });

            test('can open the storage map configurator dialog', async () => {
                await page
                    .getByRole('button', { name: 'Configure Storage' })
                    .click();
                await expect(
                    page.getByText(`Choose where you\'d like ${tenant}`)
                ).toBeVisible();
            });

            test('can choose Amazon', async () => {
                await page.getByLabel('Provider').click();
                await page
                    .getByRole('option', {
                        name: 'Amazon Simple Storage Service',
                    })
                    .click();
                await expect(page.getByLabel('Bucket *')).toBeVisible();
                await expect(page.getByLabel('Region')).toBeVisible();
                await expect(
                    page.getByRole('textbox', { name: 'Prefix' })
                ).toBeVisible();
            });

            test('can choose Google', async () => {
                await page.getByLabel('Provider').click();
                await page
                    .getByRole('option', { name: 'Google Cloud Storage' })
                    .click();
                await expect(page.getByLabel('Bucket *')).toBeVisible();
                await expect(
                    page.getByRole('textbox', { name: 'Prefix' })
                ).toBeVisible();
            });

            test('will have inputs validated', async () => {
                // Test validation
                await page.getByLabel('Bucket *').click();
                await page.getByLabel('Bucket *').fill('invalid-bucket!!!!');
                await expect(
                    page.getByText('must match pattern')
                ).toBeVisible();

                // enter valid value
                await page.getByLabel('Bucket *').click();
                await page.getByLabel('Bucket *').fill(`fake-bucket-${uuid}`);

                // test validation
                await page.getByRole('textbox', { name: 'Prefix' }).click();
                await page
                    .getByRole('textbox', { name: 'Prefix' })
                    .fill('fakePrefix');
                await expect(
                    page.getByText('must match pattern')
                ).toBeVisible();

                // enter valid value
                await page.getByRole('textbox', { name: 'Prefix' }).click();
                await page
                    .getByRole('textbox', { name: 'Prefix' })
                    .fill('fakePrefix/');
            });

            test('will ensure bucket is real during backend validation', async () => {
                await page.getByRole('button', { name: 'Save' }).click();

                await expect(
                    page.getByRole('button', { name: 'Save' })
                ).toBeEnabled();
                await expect(page.getByRole('alert')).toContainText(
                    'failed to put object'
                );
            });

            test('can be closed', async () => {
                await page.getByRole('button', { name: 'Cancel' }).click();
            });
        });
    });

    test.describe('Connectors', () => {
        test.beforeAll(async () => {
            await page.getByRole('tab', { name: 'Connectors' }).click();
        });

        test('contain the default connectors', async () => {
            await expect(
                page.getByRole('button', { name: 'Docs Hello World Capture' })
            ).toBeVisible();

            await expect(
                page.getByRole('button', { name: 'Docs PostgreSQL Capture' })
            ).toBeVisible();
            await expect(
                page.getByRole('button', {
                    name: 'Docs PostgreSQL Materialization',
                })
            ).toBeVisible();

            await expect(
                page.getByRole('link', { name: 'New Connector To request a' })
            ).toBeVisible();
        });
    });
});
