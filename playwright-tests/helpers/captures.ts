import { query } from './db';
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
    const rows = await query<{ id: string; lastPubId: string; spec: any }>(
        `select id::text as id, last_pub_id::text as "lastPubId", spec::jsonb as spec
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
export const startHelloWorldCapture = async (page: Page, name: string) => {
    await page.goto('http://localhost:3000/captures');
    await page.getByRole('button', { name: 'New Capture' }).click();
    await page
        .getByRole('button', { name: /Docs Recommended Hello World/ })
        .click();
    await expect(page.getByRole('button', { name: 'Next' })).toBeEnabled({
        timeout: 30000,
    });
    await page.locator('#prefixed-name-input').fill(name);
};

export const editLiveCapture = async (
    page: Page,
    live: { id: string; lastPubId: string }
) => {
    await page.goto(
        `http://localhost:3000/captures/edit?liveSpecId=${live.id}&lastPubId=${live.lastPubId}`
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
