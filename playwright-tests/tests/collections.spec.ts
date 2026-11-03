import { clickNext, startHelloWorldCapture } from '../helpers/captures';
import { deleteLiveSpecs, raiseTaskQuota } from '../helpers/db';
import { confirmDestinationLayout } from '../helpers/materializations';
import { AuthProps } from '../helpers/types';
import { USERS } from '../helpers/users';
import {
    defaultPageSetup,
    openDetailsFromTable,
    publishAndOpenDetails,
} from '../helpers/utils';
import { messageDescription, timeDescription } from './props';
import { expect, Page, test } from '@playwright/test';

test.describe.serial('Collections:', () => {
    const uuid = crypto.randomUUID().split('-')[0];

    let authProps: AuthProps;
    let collectionName: string;
    let page: Page;
    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();
        authProps = await defaultPageSetup(page, test, USERS.collections);
        collectionName = `${authProps.tenant}/${uuid}/events`;
        await raiseTaskQuota(authProps.tenant);

        await startHelloWorldCapture(page, uuid);
        await clickNext(page);
        await publishAndOpenDetails(page);
    });

    // The published capture and its collection
    test.afterAll(async () => {
        await deleteLiveSpecs(authProps.email, `${authProps.tenant}/${uuid}`);
    });

    test('can open the details page from the table', async () => {
        await openDetailsFromTable(page, collectionName, 'collections');
        await expect(page.getByText(collectionName)).toBeVisible();
    });

    test('can view the spec as a table', async () => {
        await page.getByRole('tab', { name: 'Spec' }).click();

        await expect(page.locator('tbody')).toContainText(messageDescription);
        await expect(page.locator('tbody')).toContainText(timeDescription);
    });

    test('can view the spec as code', async () => {
        await page.getByRole('tab', { name: 'Spec' }).click();
        await page.getByRole('button', { name: 'Code' }).click();

        await expect(page.getByRole('code')).toContainText(messageDescription);
        await expect(page.getByRole('code')).toContainText(timeDescription);
    });

    test('can materialize from the details page', async () => {
        await page.getByRole('button', { name: 'Materialize' }).click();

        await page
            .getByRole('button', { name: /PostgreSQL/ })
            .first()
            .click();
        await confirmDestinationLayout(page);

        await expect(
            page.getByRole('button', { name: collectionName })
        ).toBeVisible();
        await expect(
            page.getByRole('textbox', { name: 'Table', exact: true })
        ).toHaveValue('events');
    });
});
