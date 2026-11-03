import { readFileSync } from 'fs';
import { resolve } from 'path';

import {
    clickNext,
    convertToLegacySopsCapture,
    editLiveCapture,
    fillMessageRate,
    getDraftedCapture,
    getLiveCapture,
    NEW_TASK_PUB_ID,
    publish,
    refresh,
    STARTER_AUTO_DISCOVER,
    startHelloWorldCapture,
    testConfig,
} from '../helpers/captures';
import {
    deleteLiveSpecs,
    publishDraftSpecs,
    raiseTaskQuota,
} from '../helpers/db';
import { USERS } from '../helpers/users';
import {
    defaultPageSetup,
    isCreateDraftRequest,
    isEncryptRequest,
    openDetailsFromTable,
    publishAndOpenDetails,
    recordRequests,
} from '../helpers/utils';
import { expect, Page, test } from '@playwright/test';

// Covers the drafts written around discovers in the capture create workflow,
// asserting on the drafted specs as well as the UI.

test.describe.serial('Capture create:', () => {
    test.setTimeout(240000);

    const uuid = crypto.randomUUID().split('-')[0];
    const firstName = `/${uuid}a/`;
    const renamed = `/${uuid}b/`;

    let page: Page;
    let email: string;
    let tenant: string;
    let firstDraftId: string;
    let renamedDraftId: string;

    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();
        ({ email, tenant } = await defaultPageSetup(
            page,
            test,
            USERS.captures
        ));
        await raiseTaskQuota(tenant);
    });

    // The published capture and its collections
    test.afterAll(async () => {
        await deleteLiveSpecs(email, `${tenant}/${uuid}`);
    });

    test('Next discovers into a new draft with starter defaults', async () => {
        await startHelloWorldCapture(page, `${uuid}a`);

        const encryptions = recordRequests(page, isEncryptRequest);
        await clickNext(page);

        // New captures use secrets, so their config isn't sops-encrypted
        expect(encryptions).toHaveLength(0);

        const drafted = await getDraftedCapture(firstName);
        expect(drafted?.discoverStatuses).toEqual(['success']);
        expect(drafted?.expectPubId).toBe(NEW_TASK_PUB_ID);
        expect(drafted?.spec.autoDiscover).toEqual(STARTER_AUTO_DISCOVER);
        expect(drafted?.spec.bindings).toHaveLength(1);
        expect(drafted?.spec.endpoint.connector.config.sops).toBeUndefined();

        firstDraftId = drafted!.draftId;
    });

    test('renaming starts over in a new draft', async () => {
        await page.getByRole('button', { name: /Capture Details/ }).click();
        await page.locator('#prefixed-name-input').fill(`${uuid}b`);
        await clickNext(page);

        const drafted = await getDraftedCapture(renamed);
        expect(drafted?.draftId).not.toBe(firstDraftId);
        expect(drafted?.discoverStatuses).toEqual(['success']);
        expect(drafted?.spec.autoDiscover).toEqual(STARTER_AUTO_DISCOVER);

        // The old name is left behind in its own draft
        const previous = await getDraftedCapture(firstName);
        expect(previous?.draftId).toBe(firstDraftId);

        renamedDraftId = drafted!.draftId;
    });

    test('refresh rediscovers in the same draft', async () => {
        await refresh(page);

        const drafted = await getDraftedCapture(renamed);
        expect(drafted?.draftId).toBe(renamedDraftId);
        expect(drafted?.discoverStatuses).toEqual(['success', 'success']);
        expect(drafted?.expectPubId).toBe(NEW_TASK_PUB_ID);
    });

    test('publishes with the starter defaults', async () => {
        await publish(page, renamed);

        const live = await getLiveCapture(renamed);
        expect(live?.spec.autoDiscover).toEqual(STARTER_AUTO_DISCOVER);
        expect(live?.spec.endpoint.connector.config.sops).toBeUndefined();
    });
});

// Covers the drafts written around discovers in the capture edit workflow,
// starting from a capture published during setup. Captures created now use
// secrets, so their config isn't sops-encrypted.

test.describe.serial('Capture edit (secrets):', () => {
    test.setTimeout(240000);

    const uuid = crypto.randomUUID().split('-')[0];
    const name = `/${uuid}/`;

    let page: Page;
    let email: string;
    let tenant: string;
    let createDraftId: string;

    test.beforeAll(async ({ browser }) => {
        test.setTimeout(240000);

        page = await browser.newPage();
        ({ email, tenant } = await defaultPageSetup(
            page,
            test,
            USERS.captures
        ));
        await raiseTaskQuota(tenant);

        await startHelloWorldCapture(page, uuid);
        await clickNext(page);
        createDraftId = (await getDraftedCapture(name))!.draftId;
        await publish(page, name);
    });

    // The published capture and its collections
    test.afterAll(async () => {
        await deleteLiveSpecs(email, `${tenant}/${uuid}`);
    });

    test('endpoint change and Next drafts it without discovering', async () => {
        const live = await getLiveCapture(name);

        await editLiveCapture(page, live!);
        await page.getByRole('button', { name: /Endpoint Config/ }).click();
        await page.getByLabel(/Message Rate/).fill('7');

        const encryptions = recordRequests(page, isEncryptRequest);
        await clickNext(page);

        // The changed config is drafted without sops
        expect(encryptions).toHaveLength(0);

        const drafted = await getDraftedCapture(name);
        expect(drafted?.draftId).not.toBe(createDraftId);
        expect(drafted?.spec.endpoint.connector.config.rate).toBe(7);
        expect(drafted?.spec.endpoint.connector.config.sops).toBeUndefined();
        expect(drafted?.discoverStatuses).toEqual([]);
        // Edits keep the precondition against the live spec
        expect(drafted?.expectPubId).toBe(live!.lastPubId);
    });

    test('refresh rediscovers and keeps the precondition', async () => {
        const live = await getLiveCapture(name);

        const encryptions = recordRequests(page, isEncryptRequest);
        await refresh(page);

        // The config hasn't changed since it was encrypted, so it's reused
        expect(encryptions).toHaveLength(0);

        const drafted = await getDraftedCapture(name);
        expect(drafted?.discoverStatuses).toEqual(['success']);
        expect(drafted?.spec.endpoint.connector.config.rate).toBe(7);
        expect(drafted?.expectPubId).toBe(live!.lastPubId);
    });

    test('disabling a binding after refresh updates the draft', async () => {
        const toggle = page.locator('[id^="binding-toggle__"]').first();
        await toggle.click();

        await expect(toggle).not.toBeChecked();
        await expect
            .poll(
                async () =>
                    (await getDraftedCapture(name))?.spec.bindings[0].disable,
                { timeout: 10000 }
            )
            .toBe(true);
    });

    test('publishing over a newer live spec fails rather than overwriting it', async () => {
        const live = await getLiveCapture(name);

        // Someone else publishes the capture after this draft was made
        await publishDraftSpecs(
            email,
            [
                {
                    catalogName: `${tenant}/${uuid}/source-hello-world`,
                    spec: { ...live!.spec, interval: '7m' },
                    specType: 'capture',
                    expectPubId: live!.lastPubId,
                },
            ],
            'playwright concurrent edit'
        );

        await page.getByRole('button', { name: 'Save and publish' }).click();

        // Rejected by the drafted precondition
        await expect(
            page
                .getByRole('alert')
                .filter({ hasText: 'Capture Save Failed' })
                .filter({ hasText: 'updated while you were editing' })
        ).toBeVisible({ timeout: 120000 });

        // The other publication is still live
        expect((await getLiveCapture(name))?.spec.interval).toBe('7m');
    });
});

// Covers editing a capture whose config was encrypted with the sops CLI, which
// keeps the config's key order. sops computes the MAC over values in document
// order, so the discover fails if the UI drafts the keys in another order
// (estuary/ui#2178).
test.describe.serial('Capture edit with a sops CLI config:', () => {
    test.setTimeout(240000);

    const uuid = crypto.randomUUID().split('-')[0];
    const name = `/${uuid}/`;

    // Encrypted with the local stack's test age key. Parsed from the file, so
    // its key order is kept.
    const config = JSON.parse(
        readFileSync(
            resolve(
                __dirname,
                '../../src/test/fixtures/unsortedSopsConfig.json'
            ),
            'utf8'
        )
    );

    let page: Page;
    let email: string;
    let tenant: string;

    test.beforeAll(async ({ browser }) => {
        test.setTimeout(240000);

        page = await browser.newPage();
        ({ email, tenant } = await defaultPageSetup(
            page,
            test,
            USERS.captures
        ));
        await raiseTaskQuota(tenant);

        // The connector requires a binding for each of the config's paths
        const collection = `${tenant}/${uuid}/webhook-data`;
        await publishDraftSpecs(
            email,
            [
                {
                    catalogName: collection,
                    spec: {
                        key: ['/_meta/webhookId'],
                        schema: {
                            // Lets the discover update the schema
                            $defs: { 'flow://connector-schema': {} },
                            type: 'object',
                            properties: {
                                _meta: {
                                    type: 'object',
                                    properties: {
                                        webhookId: { type: 'string' },
                                    },
                                    required: ['webhookId'],
                                },
                            },
                            required: ['_meta'],
                        },
                    },
                    specType: 'collection',
                    expectPubId: NEW_TASK_PUB_ID,
                },
                {
                    catalogName: `${tenant}/${uuid}/source-http-ingest`,
                    spec: {
                        endpoint: {
                            connector: {
                                image: 'ghcr.io/estuary/source-http-ingest:dev',
                                config,
                            },
                        },
                        bindings: [
                            {
                                resource: { path: '/webhook-data' },
                                target: collection,
                            },
                        ],
                    },
                    specType: 'capture',
                    expectPubId: NEW_TASK_PUB_ID,
                },
            ],
            'playwright sops CLI config'
        );
    });

    // The published capture and its collections
    test.afterAll(async () => {
        await deleteLiveSpecs(email, `${tenant}/${uuid}`);
    });

    test('refresh discovers with the config as encrypted', async () => {
        await editLiveCapture(page, (await getLiveCapture(name))!);
        await page.getByRole('button', { name: 'Refresh' }).click();

        const discoverStatuses = async () =>
            (await getDraftedCapture(name))?.discoverStatuses ?? [];

        // A reordered config fails with a MAC mismatch instead
        await expect
            .poll(
                async () => {
                    const statuses = await discoverStatuses();
                    return statuses.length > 0 && !statuses.includes('queued');
                },
                { timeout: 90000 }
            )
            .toBe(true);
        expect(await discoverStatuses()).toEqual(['success']);
    });
});

// Covers editing a capture published before secrets, whose config is still
// sops-encrypted. It stays on sops rather than moving to secrets.
test.describe.serial('Capture edit (legacy sops):', () => {
    test.setTimeout(240000);

    const uuid = crypto.randomUUID().split('-')[0];
    const name = `/${uuid}/`;

    let page: Page;
    let email: string;
    let tenant: string;

    test.beforeAll(async ({ browser }) => {
        test.setTimeout(240000);

        page = await browser.newPage();
        ({ email, tenant } = await defaultPageSetup(
            page,
            test,
            USERS.captures
        ));
        await raiseTaskQuota(tenant);

        await startHelloWorldCapture(page, uuid);
        await clickNext(page);
        await publish(page, name);

        await convertToLegacySopsCapture(
            page,
            email,
            (await getLiveCapture(name))!
        );
    });

    // The published capture and its collections
    test.afterAll(async () => {
        await deleteLiveSpecs(email, `${tenant}/${uuid}`);
    });

    test('endpoint change and Next encrypts the config with sops', async () => {
        const live = await getLiveCapture(name);
        expect(live?.spec.endpoint.connector.config.sops).toBeDefined();

        await editLiveCapture(page, live!);
        await page.getByRole('button', { name: /Endpoint Config/ }).click();
        await fillMessageRate(page, '7');

        const encryptions = recordRequests(page, isEncryptRequest);
        await clickNext(page);

        // The changed config is encrypted before it's drafted
        expect(encryptions).toHaveLength(1);

        const drafted = await getDraftedCapture(name);
        expect(drafted?.spec.endpoint.connector.config.rate).toBe(7);
        expect(drafted?.spec.endpoint.connector.config.sops).toBeDefined();
        expect(drafted?.expectPubId).toBe(live!.lastPubId);
    });

    test('publishes with the config still on sops', async () => {
        const live = await getLiveCapture(name);

        await page.getByRole('button', { name: 'Save and publish' }).click();
        await expect
            .poll(async () => (await getLiveCapture(name))?.lastPubId, {
                timeout: 120000,
            })
            .not.toBe(live!.lastPubId);

        const published = await getLiveCapture(name);
        expect(published?.spec.endpoint.connector.config.rate).toBe(7);
        expect(published?.spec.endpoint.connector.config.sops).toBeDefined();
    });
});

// Covers what the capture workflow shows around publishing and editing.

const defaultBackfillMessage = 'no collections marked for backfill';
// "Backfill All" marks every binding, so the two counts in the chip must match.
const allBackfilledMessage = /(\d+) of \1 collections? will be backfilled/;

test.describe.serial('Capture details:', () => {
    test.setTimeout(240000);

    const uuid = crypto.randomUUID().split('-')[0];

    let page: Page;
    let email: string;
    let tenant: string;
    let captureName: string;

    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();
        ({ email, tenant } = await defaultPageSetup(
            page,
            test,
            USERS.captures
        ));
        await raiseTaskQuota(tenant);
        captureName = `${tenant}/${uuid}/source-hello-world`;
    });

    // The published capture and its collections
    test.afterAll(async () => {
        await deleteLiveSpecs(email, `${tenant}/${uuid}`);
    });

    test('discover, publish, go to details', async () => {
        await startHelloWorldCapture(page, uuid);
        await clickNext(page);
        await publishAndOpenDetails(page);
    });

    test('details can open edit', async () => {
        await page.getByRole('button', { name: 'Edit' }).click();

        // Want to give a bit of time for the Endpoint Config to load in
        await expect(
            page.getByRole('button', { name: /Endpoint Config/ })
        ).toBeVisible();
    });

    test('status of backfill is shown next to the "Backfill All" button', async () => {
        const backfillAllButton = page
            .locator('div')
            .filter({ hasText: /^Backfill$/ })
            .getByRole('button');

        const backfillCounter = page.getByLabel('Backfill count');

        // Checking default
        await expect(backfillCounter).toContainText(defaultBackfillMessage);

        // Ensuring backfill all shows status
        await backfillAllButton.click();
        await expect(backfillCounter).toContainText(allBackfilledMessage);

        // Disabling all backfills and checking status
        await backfillAllButton.click();
        await expect(backfillCounter).toContainText(defaultBackfillMessage);
    });

    test('editing endpoint shows Next button', async () => {
        await page.getByRole('button', { name: /Endpoint Config/ }).click();
        await fillMessageRate(page, '12');
        await expect(
            page.getByRole('button', { name: 'Next', exact: true })
        ).toBeVisible();
    });

    test('undoing edits shows Save button', async () => {
        await fillMessageRate(page, '1');
        await expect(
            page.getByRole('button', { name: 'Save and publish' })
        ).toBeVisible();
    });

    test('edits can be saved to update draft', async () => {
        await fillMessageRate(page, '123');
        await clickNext(page);
    });

    test('drafted changes can be tested', async () => {
        await testConfig(page);
    });

    test('drafted changes can be published', async () => {
        await publishAndOpenDetails(page);
    });

    test('entity table can open details', async () => {
        await openDetailsFromTable(page, captureName, 'captures');

        await expect(
            page.getByText(captureName, { exact: true }).first()
        ).toBeVisible();
    });
});

// Covers how the capture's schema evolution settings depend on each other.
// Nothing is published, so there's nothing to clean up.

const setting1 = 'Automatically keep schemas up';
const setting2 = 'Changing primary keys';
const setting3 = 'Automatically add new';

test.describe.serial('Schema Evolution Settings', () => {
    test.setTimeout(240000);

    const uuid = crypto.randomUUID().split('-')[0];

    let page: Page;

    const setting = (label: string) =>
        page.locator('label').filter({ hasText: label });

    // The settings are written to the drafted capture after a short debounce
    const expectDraftedAutoDiscover = (expected: object | null) =>
        expect
            .poll(
                async () =>
                    (await getDraftedCapture(`/${uuid}/`))?.spec.autoDiscover,
                { timeout: 10000 }
            )
            .toEqual(expected);

    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();
        await defaultPageSetup(
            page,
            test,
            `${USERS.captures}__schema-evolution`
        );
    });

    test('discover', async () => {
        await startHelloWorldCapture(page, uuid);
        await clickNext(page);

        await expectDraftedAutoDiscover(STARTER_AUTO_DISCOVER);
    });

    test('uncheck 1 = 1,2,3 unchecked', async () => {
        await setting(setting1).click();
        await expect(
            page.getByRole('button', { name: 'Save and publish' })
        ).toBeVisible();

        await expect(setting(setting1)).toBeChecked({ checked: false });
        await expect(setting(setting2)).toBeChecked({ checked: false });
        await expect(setting(setting3)).toBeChecked({ checked: false });

        await expectDraftedAutoDiscover(null);
    });

    test('check 1 = 1 checked', async () => {
        // All already unchecked so no need to reset

        await setting(setting1).click();
        await expect(
            page.getByRole('button', { name: 'Save and publish' })
        ).toBeVisible();

        await expect(setting(setting1)).toBeChecked({ checked: true });
        await expect(setting(setting3)).toBeChecked({ checked: false });
        await expect(setting(setting2)).toBeChecked({ checked: false });

        await expectDraftedAutoDiscover({
            addNewBindings: false,
            evolveIncompatibleCollections: false,
        });
    });

    test('check 2 option = 1,2 checked', async () => {
        // Reset all to unchecked, and wait for it to be drafted so the next
        //  click isn't lost while the reset is still saving
        await setting(setting1).click();
        await expectDraftedAutoDiscover(null);

        // Check and assert
        await setting(setting2).click();
        await expect(setting(setting1)).toBeChecked({ checked: true });
        await expect(setting(setting3)).toBeChecked({ checked: false });
        await expect(setting(setting2)).toBeChecked({ checked: true });

        await expectDraftedAutoDiscover({
            addNewBindings: false,
            evolveIncompatibleCollections: true,
        });
    });

    test('check 3 option = 1,3 checked', async () => {
        // Reset all to unchecked, and wait for it to be drafted so the next
        //  click isn't lost while the reset is still saving
        await setting(setting1).click();
        await expectDraftedAutoDiscover(null);

        // Check and assert
        await page.getByText(setting3).click();
        await expect(setting(setting1)).toBeChecked({ checked: true });
        await expect(setting(setting3)).toBeChecked({ checked: true });
        await expect(setting(setting2)).toBeChecked({ checked: false });

        await expectDraftedAutoDiscover({
            addNewBindings: true,
            evolveIncompatibleCollections: false,
        });
    });
});

// Covers what Next does when the capture's forms have errors.

test.describe.serial('Capture create validation:', () => {
    test.setTimeout(240000);

    let page: Page;

    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();
        await defaultPageSetup(page, test, USERS.captures);
    });

    test('Next with a missing name shows the error and writes nothing', async () => {
        await startHelloWorldCapture(page, '');

        const writes = recordRequests(
            page,
            (pageRequest) =>
                isCreateDraftRequest(pageRequest) ||
                isEncryptRequest(pageRequest)
        );

        await page.getByRole('button', { name: 'Next', exact: true }).click();

        await expect(page.getByText('please provide a name')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Next' })).toBeEnabled();
        expect(writes).toHaveLength(0);
    });
});
