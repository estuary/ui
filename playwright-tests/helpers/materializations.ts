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
    await page.getByRole('textbox', { name: 'Name', exact: true }).fill(name);
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

export interface ConnectorSpec {
    config_schema_json: object;
    resource_config_schema_json: object;
    documentation_url: string;
}

// Registers a materialization connector from its spec, as the agent would once
// it has pulled the image. Forms can then be tested without the connector
// image or the system it connects to.
export const registerMaterializationConnector = async (
    imageName: string,
    title: string,
    spec: ConnectorSpec
) => {
    await query(
        `insert into connectors
            (image_name, external_url, title, short_description, logo_url, recommended)
        values (
            $1, $2,
            jsonb_build_object('en-US', $3::text),
            jsonb_build_object('en-US', $3::text),
            jsonb_build_object('en-US', $2::text),
            false
        )
        on conflict (image_name) do nothing`,
        [imageName, spec.documentation_url, title]
    );

    await query(
        `insert into connector_tags
            (connector_id, image_tag, protocol, documentation_url,
            endpoint_spec_schema, resource_spec_schema, job_status)
        select id, ':dev', 'materialization', $2, $3::json, $4::json,
            '{"type": "success"}'
        from connectors where image_name = $1
        on conflict (connector_id, image_tag) do update set
            endpoint_spec_schema = excluded.endpoint_spec_schema,
            resource_spec_schema = excluded.resource_spec_schema,
            job_status = excluded.job_status`,
        [
            imageName,
            spec.documentation_url,
            JSON.stringify(spec.config_schema_json),
            JSON.stringify(spec.resource_config_schema_json),
        ]
    );
};
