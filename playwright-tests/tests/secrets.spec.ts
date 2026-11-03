import {
    clickNext,
    editLiveCapture,
    getDraftedCapture,
    getLiveCapture,
    getSecret,
    publish,
    setSecretValue,
    startHttpIngestCapture,
} from '../helpers/captures';
import { deleteLiveSpecs, query, raiseTaskQuota } from '../helpers/db';
import { USERS } from '../helpers/users';
import { defaultPageSetup } from '../helpers/utils';
import { expect, Page, test } from '@playwright/test';

// Covers secret fields in the capture workflow, using the HTTP Webhook
// connector's optional "Authentication token". Its value is saved as a secret,
// and the capture's `secrets` stanza refers to it by name rather than holding
// it in the endpoint config.

const TOKEN_FIELD = 'Authentication token';
const TOKEN_POINTER = '/requireAuthToken';

// The published capture, its collections, and the secrets saved under its name
const cleanUp = async (email: string, catalogPrefix: string) => {
    await deleteLiveSpecs(email, catalogPrefix);
    await query(
        `delete from internal.secrets where starts_with(catalog_name, $1)`,
        [catalogPrefix]
    );
};

const expectTokenReference = (spec: any) => {
    const references = Object.entries(spec.secrets ?? {});
    expect(references).toHaveLength(1);

    const [secretName, pointer] = references[0];
    expect(pointer).toBe(TOKEN_POINTER);

    // The value lives in the secret, not the config. The config may keep the
    // field's schema default (null), which the secret replaces at runtime.
    const { config } = spec.endpoint.connector;
    expect(config.requireAuthToken ?? null).toBeNull();
    expect(config.sops).toBeUndefined();

    return secretName;
};

test.describe.serial('Capture secrets set in create:', () => {
    test.setTimeout(240000);

    const uuid = crypto.randomUUID().split('-')[0];
    const name = `/${uuid}/`;

    let page: Page;
    let email: string;
    let tenant: string;
    let secretName: string;

    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();
        ({ email, tenant } = await defaultPageSetup(
            page,
            test,
            USERS.captures
        ));
        await raiseTaskQuota(tenant);
    });

    test.afterAll(async () => {
        await cleanUp(email, `${tenant}/${uuid}/`);
    });

    test('an entered secret is held until Next', async () => {
        await startHttpIngestCapture(page, uuid);
        await setSecretValue(page, TOKEN_FIELD, 'pw-token-1');

        await expect(page.getByText('Saved when you click Next')).toBeVisible();

        // Nothing is saved before the capture is drafted under its name
        const saved = await query(
            `select 1 from internal.secrets where starts_with(catalog_name, $1)`,
            [`${tenant}/${uuid}/`]
        );
        expect(saved).toHaveLength(0);
    });

    test('Next saves the secret and drafts a reference to it', async () => {
        await clickNext(page);

        const drafted = await getDraftedCapture(name);
        // The discover resolved the secret from the drafted capture
        expect(drafted?.discoverStatuses).toEqual(['success']);

        secretName = expectTokenReference(drafted!.spec);
        expect(await getSecret(secretName)).not.toBeNull();

        // Create collapses a valid endpoint config once it's drafted
        await page.getByRole('button', { name: /Endpoint Config/ }).click();
        await expect(page.getByText(secretName)).toBeVisible();
    });

    test('publishes with the reference', async () => {
        await publish(page, name);

        const live = await getLiveCapture(name);
        expect(expectTokenReference(live!.spec)).toBe(secretName);
    });

    test('editing the secret in edit updates it in place', async () => {
        const live = await getLiveCapture(name);
        const before = await getSecret(secretName);

        await editLiveCapture(page, live!);
        await page.getByRole('button', { name: /Endpoint Config/ }).click();
        await setSecretValue(page, TOKEN_FIELD, 'pw-token-2');

        await expect(page.getByText(`${TOKEN_FIELD} updated`)).toBeVisible();
        await expect
            .poll(async () => (await getSecret(secretName))?.id)
            .not.toBe(before!.id);

        // The spec still refers to the same secret, so nothing needs drafting
        await expect(
            page.getByRole('button', { name: 'Save and publish' })
        ).toBeVisible();
        await expect(
            page.getByRole('button', { name: 'Next', exact: true })
        ).toBeHidden();
    });
});

test.describe.serial('Capture secrets added in edit:', () => {
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

        // Published without the optional token
        await startHttpIngestCapture(page, uuid);
        await clickNext(page);
        await publish(page, name);
    });

    test.afterAll(async () => {
        await cleanUp(email, `${tenant}/${uuid}/`);
    });

    test('adding a secret requires Next, which drafts a reference to it', async () => {
        const live = await getLiveCapture(name);
        expect(live?.spec.secrets).toBeUndefined();

        await editLiveCapture(page, live!);
        await page.getByRole('button', { name: /Endpoint Config/ }).click();
        await setSecretValue(page, TOKEN_FIELD, 'pw-token-3');

        // The spec needs a new reference, so it has to be drafted first
        await clickNext(page);

        const drafted = await getDraftedCapture(name);
        const secretName = expectTokenReference(drafted!.spec);
        expect(await getSecret(secretName)).not.toBeNull();
        // Edits keep the precondition against the live spec
        expect(drafted?.expectPubId).toBe(live!.lastPubId);
    });

    test('publishes with the added reference', async () => {
        const live = await getLiveCapture(name);

        await page.getByRole('button', { name: 'Save and publish' }).click();
        await expect
            .poll(async () => (await getLiveCapture(name))?.lastPubId, {
                timeout: 120000,
            })
            .not.toBe(live!.lastPubId);

        const published = await getLiveCapture(name);
        expectTokenReference(published!.spec);
    });
});
