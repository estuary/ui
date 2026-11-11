import { publishDraftSpecs, query } from './db';
import { closeLogsOnSuccess } from './utils';
import { expect, Page } from '@playwright/test';

export const NEW_TASK_PUB_ID = '00:00:00:00:00:00:00:00';
export const STARTER_AUTO_DISCOVER = {
    addNewBindings: true,
    evolveIncompatibleCollections: true,
};

export interface DraftedCapture {
    draftId: string;
    catalogName: string;
    expectPubId: string | null;
    spec: any;
    discoverStatuses: string[];
}

// The most recently written capture whose name contains `nameSegment`
export const getDraftedCapture = async (
    nameSegment: string
): Promise<DraftedCapture | null> => {
    const rows = await query<DraftedCapture>(
        `select
            ds.draft_id::text as "draftId",
            ds.catalog_name as "catalogName",
            ds.expect_pub_id::text as "expectPubId",
            ds.spec::jsonb as spec,
            coalesce(
                (select array_agg(d.job_status->>'type' order by d.created_at)
                    from discovers d where d.draft_id = ds.draft_id),
                '{}'
            ) as "discoverStatuses"
        from draft_specs ds
        where ds.spec_type = 'capture' and ds.catalog_name like $1
        order by ds.updated_at desc
        limit 1`,
        [`%${nameSegment}%`]
    );

    return rows[0] ?? null;
};

export const getLiveCapture = async (nameSegment: string) => {
    const rows = await query<{
        id: string;
        catalogName: string;
        lastPubId: string;
        spec: any;
    }>(
        `select id::text as id, catalog_name as "catalogName", last_pub_id::text as "lastPubId", spec::jsonb as spec
        from live_specs
        where spec_type = 'capture' and spec is not null and catalog_name like $1`,
        [`%${nameSegment}%`]
    );

    return rows[0] ?? null;
};

export const waitForGenerated = async (page: Page) => {
    await expect(
        page.getByRole('button', { name: 'Save and publish' })
    ).toBeVisible({ timeout: 90000 });
};

export const clickNext = async (page: Page) => {
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await waitForGenerated(page);
};

export const refresh = async (page: Page) => {
    await page.getByRole('button', { name: 'Refresh' }).click();
    await waitForGenerated(page);
};

export const publish = async (page: Page, nameSegment: string) => {
    await page.getByRole('button', { name: 'Save and publish' }).click();
    await expect
        .poll(() => getLiveCapture(nameSegment), { timeout: 120000 })
        .not.toBeNull();
};

// Fills out a new Hello World capture, without clicking Next
// Fills out a new capture of the connector whose card matches `connector`,
// without clicking Next
const startCapture = async (page: Page, connector: RegExp, name: string) => {
    await page.goto('http://localhost:3000/captures');
    await page.getByRole('button', { name: 'New Capture' }).click();
    await page.getByRole('button', { name: connector }).click();
    await expect(page.getByRole('button', { name: 'Next' })).toBeEnabled({
        timeout: 30000,
    });
    await page.locator('#prefixed-name-input').fill(name);
};

// Fills out a new Hello World capture, without clicking Next
export const startHelloWorldCapture = (page: Page, name: string) =>
    startCapture(page, /Docs Recommended Hello World/, name);

// Fills out a new HTTP Webhook capture, without clicking Next. Its optional
// "Authentication token" is a secret field. The connector rejects the default
// "*" CORS origin once a token is set, so a specific origin is used.
export const startHttpIngestCapture = async (page: Page, name: string) => {
    await startCapture(page, /HTTP Webhook/, name);
    await page.locator('input[value="*"]').fill('https://example.com');
    // The input debounces its change until blur
    await page.keyboard.press('Tab');
};

// The secret saved under `name`, or null
export const getSecret = async (name: string) => {
    const rows = await query<{ id: string }>(
        `select id::text as id from internal.secrets where catalog_name = $1`,
        [name]
    );

    return rows[0] ?? null;
};

// Opens the secret field's dialog and saves `value`
export const setSecretValue = async (
    page: Page,
    fieldLabel: string,
    value: string
) => {
    // The innermost element holding both the field's label and its button
    await page
        .locator('div')
        .filter({ has: page.getByText(new RegExp(`^${fieldLabel}( \\*)?$`)) })
        .filter({
            has: page.getByRole('button', { name: /^(Set|Edit) secret$/ }),
        })
        .last()
        .getByRole('button', { name: /^(Set|Edit) secret$/ })
        .click();

    const dialog = page.getByRole('dialog', { name: fieldLabel });
    await dialog.getByRole('textbox').fill(value);
    await dialog.getByRole('button', { name: 'Save secret' }).click();
    await expect(dialog).toBeHidden();
};

export const editLiveCapture = async (
    page: Page,
    live: { id: string; lastPubId: string }
) => {
    await page.goto(
        `http://localhost:3000/captures/edit?liveSpecId=${live.id}&lastPubId=${live.lastPubId}`
    );
};

// Test setup: new captures use secrets, so this turns a live capture into one
// published before secrets, by republishing its config sops-encrypted
export const convertToLegacySopsCapture = async (
    page: Page,
    email: string,
    live: { catalogName: string; lastPubId: string; spec: any }
) => {
    const { image, config } = live.spec.endpoint.connector;

    const [connectorTag] = await query<{
        connectorId: string;
        connectorTagId: string;
    }>(
        `select ct.connector_id::text as "connectorId", ct.id::text as "connectorTagId"
        from connector_tags ct join connectors c on c.id = ct.connector_id
        where c.image_name || ct.image_tag = $1`,
        [image]
    );

    // Encrypts with the page's session, taken from its next Supabase request
    const [supabaseRequest] = await Promise.all([
        page.waitForRequest((pageRequest) =>
            pageRequest.url().includes('/rest/v1/')
        ),
        page.reload(),
    ]);
    const { authorization, apikey } = await supabaseRequest.allHeaders();

    const response = await page.request.post(
        new URL('/functions/v1/oauth', supabaseRequest.url()).toString(),
        {
            headers: { authorization, apikey },
            data: {
                operation: 'encrypt-config',
                connector_id: connectorTag.connectorId,
                connector_tag_id: connectorTag.connectorTagId,
                config,
            },
        }
    );
    expect(response.ok()).toBe(true);

    const encryptedConfig = await response.json();
    expect(encryptedConfig.sops).toBeDefined();

    await publishDraftSpecs(
        email,
        [
            {
                catalogName: live.catalogName,
                spec: {
                    ...live.spec,
                    endpoint: { connector: { image, config: encryptedConfig } },
                },
                specType: 'capture',
                expectPubId: live.lastPubId,
            },
        ],
        'playwright legacy sops config'
    );
};

export const fillMessageRate = async (page: Page, messageRate: string) => {
    await page.getByLabel(/Message Rate/).fill(messageRate);
};

// Tests the drafted config and closes the logs once it succeeds
export const testConfig = async (page: Page) => {
    await page.getByRole('button', { name: 'Test' }).click();
    await closeLogsOnSuccess(page);
};
