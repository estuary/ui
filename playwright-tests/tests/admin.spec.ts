import { AuthProps } from '../helpers/types';
import { USERS } from '../helpers/users';
import { defaultPageSetup } from '../helpers/utils';
import { expect, Page, test } from '@playwright/test';

const invalidEmail = 'Fake_Invalid_Email';
const testTokens = ['test token 1', 'test token 2', 'test token 3'];

test.describe.serial('Admin:', () => {
    const uuid = crypto.randomUUID().split('-')[0];

    let authProps: AuthProps;
    let page: Page;
    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();
        authProps = await defaultPageSetup(page, test, USERS.admin);

        await page.getByLabel('Admin').click();
    });

    test.describe('Account Access', () => {
        test.beforeAll(async () => {
            await page.getByRole('tab', { name: 'Account Access' }).click();
        });

        test('Organization table shows user has admin access', async () => {
            const table = await page.getByLabel(
                'Organization Membership Table'
            );
            await expect(table).toContainText(authProps.name);
            await expect(table).toContainText('admin');
            await expect(table).toContainText(authProps.tenant);
        });

        test('default data sharing with support', async () => {
            const table = await page.getByLabel('Data Sharing Table');
            await expect(table).toContainText(authProps.tenant);
            await expect(table).toContainText('estuary_support');
        });
    });

    test.describe('Settings', () => {
        test.beforeAll(async () => {
            await page.getByRole('tab', { name: 'Settings' }).click();
        });

        test('The authProps.tenant will be preselected', async () => {
            await expect(
                page.getByLabel('Prefix', { exact: true })
            ).toHaveValue(`${authProps.tenant}/`);
        });

        test.describe('Organization Settings', () => {
            test('are defaulted correctly', async () => {
                await expect(
                    page.getByLabel('Organization Notifications Table')
                ).toContainText(authProps.tenant);

                await expect(
                    page.getByLabel('Organization Notifications Table')
                ).toContainText(authProps.email);
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
                        .getByText(authProps.tenant)
                ).toBeVisible();

                await expect(
                    page.getByRole('button', { name: authProps.email })
                ).toBeVisible();
            });

            test('will validate emails after hitting enter or ,', async () => {
                const validationMessage = 'One or more emails';
                const emailInput = await page.getByLabel('Email *');
                // Enter invalid email and hit enter
                await emailInput.fill(invalidEmail);
                await emailInput.press('Enter');
                await expect(page.getByText(validationMessage)).toBeVisible();

                // Remove invalid email
                await emailInput.press('Backspace');
                await expect(
                    page.getByText(validationMessage)
                ).not.toBeVisible();

                // add back in invalid with comma
                await emailInput.fill(`${invalidEmail},`);
                await emailInput.press('Enter');
                await expect(page.getByText(validationMessage)).toBeVisible();
            });

            test('the errors displaying are non blocking and will save', async () => {
                await page.getByRole('button', { name: 'Save' }).click();

                await expect(
                    page.getByLabel('Organization Notifications Table')
                ).toContainText(invalidEmail);
            });

            test('saved invalid emails can be removed', async () => {
                await page.getByRole('button', { name: 'Edit' }).click();

                const emailInput = await page.getByLabel('Email *');
                await emailInput.click();
                await emailInput.press('Backspace');

                await page.getByRole('button', { name: 'Save' }).click();

                await expect(
                    page.getByLabel('Organization Notifications Table')
                ).not.toContainText(invalidEmail);
            });
        });

        test.describe('Cloud Storage', () => {
            test('is defaulted correctly', async () => {
                const table = await page.getByLabel('Storage Locations Table');
                await expect(table).toContainText(authProps.tenant);
                await expect(table).toContainText('estuary-trial');
                await expect(table).toContainText('collection-data');
            });

            test('can open the storage map configurator dialog', async () => {
                await page
                    .getByRole('button', { name: 'Configure Storage' })
                    .click();
                await expect(
                    page.getByText(
                        `Choose where you\'d like ${authProps.tenant}`
                    )
                ).toBeVisible();
            });

            test('can choose Amazon', async () => {
                await page.getByRole('combobox', { name: 'Provider' }).click();
                await page
                    .getByRole('option', {
                        name: 'Amazon S3',
                    })
                    .click();
                await expect(page.getByLabel('Bucket *')).toBeVisible();
                await expect(page.getByLabel('Region')).toBeVisible();
                await expect(
                    page.getByRole('textbox', { name: 'Prefix' })
                ).toBeVisible();
            });

            test('can choose Google', async () => {
                await page.getByRole('combobox', { name: 'Provider' }).click();
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

                await expect(page.getByRole('alert')).toContainText(
                    'failed to put object'
                );
                await expect(
                    page.getByRole('button', { name: 'Save' })
                ).toBeEnabled();
            });

            test('can be closed', async () => {
                await page.getByRole('button', { name: 'Cancel' }).click();
            });
        });
    });

    test.describe('Billing', () => {
        test.beforeAll(async () => {
            await page.getByRole('tab', { name: 'Billing' }).click();
        });

        test('shows details about the free tier', async () => {
            await expect(page.locator('#root')).toContainText(
                'The free tier lets you try Estuary with up to 2 tasks and 10GB per month'
            );
        });

        test('shows the authProps.tenant in the selector', async () => {
            await expect(
                page.getByRole('combobox', { name: 'Prefix' })
            ).toHaveValue(`${authProps.tenant}/`);
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

    test.describe('Cli-API', () => {
        test.beforeAll(async () => {
            await page.getByRole('tab', { name: 'CLI-API' }).click();
        });

        test('The token table should be empty', async () => {
            await expect(page.getByLabel('Entity Table')).toContainText(
                'No refresh tokens found.'
            );
        });

        test('can open generate token dialog', async () => {
            await page.getByRole('button', { name: 'Generate Token' }).click();
            await expect(
                page.getByRole('heading', { name: 'Generate Refresh Token' })
            ).toBeVisible();
        });

        test('can create a new token', async () => {
            await page.getByLabel('Description *').click();
            await page.getByLabel('Description *').fill(testTokens[0]);
            await page.getByRole('button', { name: 'Generate Token' }).click();
            await expect(
                page.getByText('Make sure to copy your')
            ).toBeVisible();
        });

        test('can create two more tokens', async () => {
            await page.getByLabel('Description *').click();
            await page.getByLabel('Description *').fill(testTokens[1]);
            await page.getByRole('button', { name: 'Generate Token' }).click();
            await page.getByLabel('Description *').click();
            await page.getByLabel('Description *').fill(testTokens[2]);
            await page.getByRole('button', { name: 'Generate Token' }).click();
        });

        test('can close the dialog', async () => {
            await page.getByRole('button', { name: 'Close' }).click();
            await expect(
                page.getByLabel('Generate Refresh Token')
            ).not.toBeVisible();
        });

        test.describe('can remove all tokens', async () => {
            testTokens.forEach(async (testToken) => {
                test(`${testToken} removed`, async () => {
                    await page
                        .getByRole('row', { name: testToken })
                        .getByRole('cell', { name: 'Revoke' })
                        .click();
                    await expect(
                        page.getByLabel('Entity Table')
                    ).not.toContainText(testToken);
                });
            });
        });

        test('after all removed table should be empty', async () => {
            await expect(
                page.getByLabel('Generate Refresh Token')
            ).not.toBeVisible();
        });
    });
});
