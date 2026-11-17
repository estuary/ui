import { deleteLiveSpecs, raiseTaskQuota } from '../helpers/db';
import {
    addCollection,
    clickNext,
    confirmDestinationLayout,
    createDekafMaterialization,
    ensureSourceCollection,
    getDraftedMaterializations,
    getLiveTask,
    NEW_TASK_PUB_ID,
    publish,
    startMaterialization,
} from '../helpers/materializations';
import { USERS } from '../helpers/users';
import {
    defaultPageSetup,
    openDetailsFromTable,
    publishAndOpenDetails,
} from '../helpers/utils';
import { messageDescription, timeDescription } from './props';
import { expect, Page, test } from '@playwright/test';

// Covers the drafts written by the materialization create workflow, asserting
// on the drafted specs as well as the UI.

test.describe.serial('Materialization create:', () => {
    test.setTimeout(240000);

    const uuid = crypto.randomUUID().split('-')[0];

    let page: Page;
    let email: string;
    let tenant: string;
    let collection: string;
    let draftId: string;

    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();
        ({ email, tenant } = await defaultPageSetup(
            page,
            test,
            USERS.materializations
        ));
        await raiseTaskQuota(tenant);
        collection = await ensureSourceCollection(page, tenant);
    });

    test.afterAll(async () => {
        await deleteLiveSpecs(email, `${tenant}/${uuid}`);
    });

    test('Next drafts a new materialization with its config encrypted', async () => {
        await createDekafMaterialization(page, `${uuid}a`, collection);
        await clickNext(page);

        const drafted = await getDraftedMaterializations(uuid);
        expect(drafted).toHaveLength(1);

        const [{ spec, expectPubId }] = drafted;
        expect(expectPubId).toBe(NEW_TASK_PUB_ID);
        expect(spec.bindings.map(({ source }: any) => source)).toEqual([
            collection,
        ]);

        const config = spec.endpoint.dekaf.config;
        expect(config.sops).toBeDefined();
        expect(config.token_sops).toMatch(/^ENC\[/);
        expect(config.token).toBeUndefined();

        draftId = drafted[0].draftId;
    });

    test('field selection refresh evaluates the fields in the same draft', async () => {
        await page
            .getByRole('button', { name: 'Refresh', exact: true })
            .click();

        // The source collection's fields once the draft is validated
        const fieldsTable = page.getByRole('table', {
            name: 'Field Selection Editor',
        });
        await expect(fieldsTable).toContainText('message', { timeout: 90000 });
        await expect(fieldsTable).toContainText('ts');

        const drafted = await getDraftedMaterializations(uuid);
        expect(drafted).toHaveLength(1);
        expect(drafted[0].draftId).toBe(draftId);
        expect(drafted[0].expectPubId).toBe(NEW_TASK_PUB_ID);
    });

    test('renaming updates the drafted materialization in place', async () => {
        await page
            .getByRole('button', { name: /Materialization Details/ })
            .click();
        await page.locator('#prefixed-name-input').fill(`${uuid}b`);
        await clickNext(page);

        const drafted = await getDraftedMaterializations(uuid);
        expect(drafted).toHaveLength(1);
        expect(drafted[0].draftId).toBe(draftId);
        expect(drafted[0].catalogName).toContain(`/${uuid}b/`);
        expect(drafted[0].expectPubId).toBe(NEW_TASK_PUB_ID);
    });

    test('publishes the drafted materialization', async () => {
        const [{ catalogName }] = await getDraftedMaterializations(uuid);

        await publish(page, catalogName);

        const live = await getLiveTask(catalogName);
        expect(live?.spec.endpoint.dekaf.config.token_sops).toMatch(/^ENC\[/);
    });
});

// Covers the drafts written by the materialization edit workflow, starting
// from a materialization published during setup.

test.describe.serial('Materialization edit:', () => {
    test.setTimeout(240000);

    const uuid = crypto.randomUUID().split('-')[0];

    let page: Page;
    let email: string;
    let tenant: string;
    let collection: string;
    let catalogName: string;

    test.beforeAll(async ({ browser }) => {
        test.setTimeout(240000);

        page = await browser.newPage();
        ({ email, tenant } = await defaultPageSetup(
            page,
            test,
            USERS.materializations
        ));
        await raiseTaskQuota(tenant);
        collection = await ensureSourceCollection(page, tenant);

        await createDekafMaterialization(page, uuid, collection);
        await clickNext(page);

        [{ catalogName }] = await getDraftedMaterializations(uuid);
        await publish(page, catalogName);
    });

    test.afterAll(async () => {
        await deleteLiveSpecs(email, `${tenant}/${uuid}`);
    });

    test('an endpoint change drafts against the live spec', async () => {
        const live = await getLiveTask(catalogName);
        const liveToken = live!.spec.endpoint.dekaf.config.token_sops;

        await page.goto(
            `http://localhost:3000/materializations/edit?liveSpecId=${live!.id}&lastPubId=${live!.lastPubId}`
        );
        await page.getByRole('button', { name: /Endpoint Config/ }).click();
        await page
            .getByRole('textbox', { name: 'Auth Token' })
            .fill('token-two');
        await clickNext(page);

        const drafted = (await getDraftedMaterializations(uuid)).at(-1);

        // Edits keep the precondition against the live spec
        expect(drafted?.expectPubId).toBe(live!.lastPubId);

        const token = drafted?.spec.endpoint.dekaf.config.token_sops;
        expect(token).toMatch(/^ENC\[/);
        expect(token).not.toBe(liveToken);
    });

    test('removing and re-adding the collection updates the drafted bindings', async () => {
        const draftedSources = async () =>
            (
                (await getDraftedMaterializations(uuid)).at(-1)?.spec
                    .bindings ?? []
            ).map(({ source }: any) => source);

        await page
            .getByLabel('Remove Collections in the list below')
            .getByRole('button')
            .click();
        await clickNext(page);
        expect(await draftedSources()).toEqual([]);

        await addCollection(page, collection);
        await clickNext(page);
        expect(await draftedSources()).toEqual([collection]);
    });
});

// Covers what the workflow shows while creating a PostgreSQL
// materialization. Needs a PostgreSQL database the data plane can reach,
// configured by the postgres_* variables in .env.

test.describe.serial('Materialization PostgreSQL:', () => {
    test.skip(
        !process.env.postgres_path,
        'Set the postgres_* variables in .env to run'
    );
    test.setTimeout(240000);

    const uuid = crypto.randomUUID().split('-')[0];

    let page: Page;
    let email: string;
    let tenant: string;
    let collection: string;
    let materializationName: string;

    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();
        ({ email, tenant } = await defaultPageSetup(
            page,
            test,
            USERS.materializations
        ));
        await raiseTaskQuota(tenant);
        collection = await ensureSourceCollection(page, tenant);
        materializationName = `${tenant}/${uuid}/materialize-postgres`;
    });

    test.afterAll(async () => {
        await deleteLiveSpecs(email, `${tenant}/${uuid}`);
    });

    test('start creating a PostgreSQL', async () => {
        await startMaterialization(page, /PostgreSQL/, uuid);
    });

    test('fill in connection details', async () => {
        await page
            .getByRole('textbox', { name: 'Address', exact: true })
            .fill(process.env.postgres_path!);
        await page
            .getByRole('textbox', { name: 'User', exact: true })
            .fill(process.env.postgres_user!);
        await page
            .getByRole('textbox', { name: 'Password', exact: true })
            .fill(process.env.postgres_pass!);
        await page
            .getByRole('textbox', { name: 'Database', exact: true })
            .fill(process.env.postgres_db!);
    });

    test('select a collection for binding', async () => {
        await page.getByRole('button', { name: 'Add Collections' }).click();
        await page
            .getByRole('dialog')
            .getByRole('row')
            .filter({ hasText: collection })
            .getByRole('checkbox')
            .check();
        await page.getByRole('button', { name: 'Continue' }).click();

        await confirmDestinationLayout(page);

        const table = page.getByRole('textbox', { name: 'Table', exact: true });
        await expect(table).toHaveValue('events');

        // Every run binds the same source collection, so give each its own
        //  table rather than collide with an earlier run's
        await table.fill(`events_${uuid}`);
    });

    test('the collection spec can be viewed', async () => {
        await page.getByRole('tab', { name: 'Collection' }).click();
        await expect(
            page.getByRole('cell', { name: '/message' })
        ).toBeVisible();
        await expect(page.getByRole('cell', { name: '/ts' })).toBeVisible();
    });

    test('the collection spec can be viewed in the editor', async () => {
        await page.getByRole('button', { name: 'Edit', exact: true }).click();
        await expect(page.getByRole('code')).toContainText(messageDescription);
        await expect(page.getByRole('code')).toContainText(timeDescription);
    });

    test('show instructions to keep spec in sync with changes through CLI', async () => {
        await page.getByRole('button', { name: 'CLI' }).click();
        await expect(
            page.getByText('flowctl draft author --source')
        ).toBeVisible();
        await page.getByRole('button', { name: 'Close' }).click();
    });

    test('can generate the spec', async () => {
        await page.getByRole('button', { name: 'Next', exact: true }).click();
        await expect(
            page.getByRole('button', { name: 'Save and publish' })
        ).toBeVisible({ timeout: 90000 });

        // The Destination Layout chosen when adding the collection
        const [drafted] = await getDraftedMaterializations(uuid);
        expect(drafted.spec.targetNaming).toEqual({
            strategy: 'matchSourceStructure',
        });
    });

    test('can save and publish', async () => {
        await publishAndOpenDetails(page);
        await expect(page.getByText('Materialization Details')).toBeVisible();
    });

    test('published can open details', async () => {
        await openDetailsFromTable(
            page,
            materializationName,
            'materializations'
        );
    });
});
