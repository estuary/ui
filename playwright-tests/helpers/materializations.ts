import { startHelloWorldCapture } from './captures';
import { query } from './db';
import { expect, Page } from '@playwright/test';

// One capture per tenant supplies the collection the tests materialize, so
// runs don't each publish a new one
const SOURCE_CAPTURE_NAME = 'pw-source';

export const NEW_TASK_PUB_ID = '00:00:00:00:00:00:00:00';

export interface DraftedMaterialization {
    draftId: string;
    catalogName: string;
    expectPubId: string | null;
    spec: any;
}

// Every drafted materialization whose name contains `nameSegment`, most
// recently written last
export const getDraftedMaterializations = (nameSegment: string) =>
    query<DraftedMaterialization>(
        `select
            draft_id::text as "draftId",
            catalog_name as "catalogName",
            expect_pub_id::text as "expectPubId",
            spec::jsonb as spec
        from draft_specs
        where spec_type = 'materialization' and catalog_name like $1
        order by updated_at`,
        [`%${nameSegment}%`]
    );

export const getLiveTask = async (catalogName: string) => {
    const rows = await query<{ id: string; lastPubId: string; spec: any }>(
        `select id::text as id, last_pub_id::text as "lastPubId", spec::jsonb as spec
        from live_specs where catalog_name = $1`,
        [catalogName]
    );

    return rows[0] ?? null;
};

const waitForGenerated = async (page: Page) => {
    await expect(
        page.getByRole('button', { name: 'Save and publish' })
    ).toBeVisible({ timeout: 90000 });
};

export const clickNext = async (page: Page) => {
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await waitForGenerated(page);
};

export const publish = async (page: Page, catalogName: string) => {
    await page.getByRole('button', { name: 'Save and publish' }).click();
    await expect
        .poll(() => getLiveTask(catalogName), { timeout: 120000 })
        .not.toBeNull();
};

// Publishes the tenant's Hello World source capture if it isn't live yet, and
// returns the collection it captures into
export const ensureSourceCollection = async (page: Page, tenant: string) => {
    const prefix = `${tenant}/${SOURCE_CAPTURE_NAME}`;
    const captureName = `${prefix}/source-hello-world`;

    if (!(await getLiveTask(captureName))) {
        await startHelloWorldCapture(page, SOURCE_CAPTURE_NAME);
        await clickNext(page);
        await publish(page, captureName);
    }

    return `${prefix}/events`;
};

export const createDekafMaterialization = async (
    page: Page,
    name: string,
    collection: string
) => {
    await startMaterialization(page, /Dekaf/i, name);
    await page.getByRole('textbox', { name: 'Auth Token' }).fill('token-one');

    await addCollection(page, collection);
};

// Opens a new materialization of the given connector, named `name`
export const startMaterialization = async (
    page: Page,
    connector: RegExp,
    name: string
) => {
    await page.goto('http://localhost:3000/materializations/create');
    await page.getByRole('button', { name: connector }).first().click();
    await page.getByRole('textbox', { name: 'Name' }).fill(name);
};

// Connectors that name schemas ask how collections map to them before
// adding any. The confirm button reads "Continue" when the collections were
// prefilled rather than chosen.
export const confirmDestinationLayout = async (page: Page) => {
    await page
        .getByRole('dialog')
        .filter({ hasText: 'Destination Layout' })
        .getByRole('button', { name: /^(Add Collections|Continue)$/ })
        .click();
};

// Adds `collection` to the workflow's bindings
export const addCollection = async (page: Page, collection: string) => {
    await page.getByRole('button', { name: 'Add Collections' }).click();
    await page
        .getByRole('dialog')
        .getByRole('row')
        .filter({ hasText: collection })
        .getByRole('checkbox')
        .check();
    await page.getByRole('button', { name: 'Continue' }).click();
};
