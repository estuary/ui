import { readFileSync } from 'fs';
import { resolve } from 'path';

import {
    editLiveCapture,
    fillMessageRate,
    getDraftedCapture,
    getLiveCapture,
    NEW_TASK_PUB_ID,
    publish as publishCapture,
    startHelloWorldCapture,
} from '../helpers/captures';
import {
    deleteLiveSpecs,
    publishDraftSpecs,
    query,
    raiseTaskQuota,
} from '../helpers/db';
import {
    addCollection,
    clickNext,
    confirmDestinationLayout,
    createDekafMaterialization,
    ensureSourceCollection,
    getLiveTask,
    publish,
} from '../helpers/materializations';
import { USERS } from '../helpers/users';
import { defaultPageSetup } from '../helpers/utils';
import { expect, Locator, Page, test } from '@playwright/test';

// Covers tasks that store their secrets as catalog secrets named in a
// `secrets` stanza, asserting on the drafted specs. Needs the connectors from
// `mise run local:seed-secrets-connectors` (flow).

// The most recently drafted materialization whose name contains `nameSegment`
const getDraftedSpec = async (nameSegment: string) => {
    const rows = await query<{ spec: any }>(
        `select spec::jsonb as spec from draft_specs
        where spec_type = 'materialization' and catalog_name like $1
        order by updated_at desc
        limit 1`,
        [`%${nameSegment}%`]
    );

    return rows[0]?.spec ?? null;
};

// The pointers in the drafted spec's `secrets` stanza
const getDraftedPointers = async (nameSegment: string) => {
    const spec = await getDraftedSpec(nameSegment);

    return Object.values<string>(spec?.secrets ?? {}).sort();
};

const setUpPage = async (browser: any) => {
    const page: Page = await browser.newPage();

    const { email, tenant } = await defaultPageSetup(page, test, USERS.secrets);
    await raiseTaskQuota(tenant);

    return { page, email, tenant };
};

// Connector forms have fields like "Username", so the name field is matched
// exactly
const startMaterialization = async (
    page: Page,
    connector: RegExp,
    name: string
) => {
    await page.goto('http://localhost:3000/materializations/create');
    await page.getByRole('button', { name: connector }).first().click();
    await page.getByRole('textbox', { name: 'Name', exact: true }).fill(name);
};

// The endpoint config section collapses once the spec is generated
const expandEndpointConfig = async (page: Page) => {
    const section = page.getByRole('button', {
        name: /Endpoint Config Expand to edit/,
    });
    if (await section.isVisible()) {
        await section.click();
    }
};

// Switches a union to the tab named `option`, confirming the form is cleared
// when it asks
const switchOption = async (page: Page, option: string) => {
    await expandEndpointConfig(page);
    await page.getByRole('tab', { name: option, exact: true }).click();

    const dialog = page.getByRole('dialog').filter({ hasText: 'Clear form?' });
    if (await dialog.isVisible()) {
        await dialog.getByRole('button', { name: 'Yes' }).click();
    }
};

const textbox = (page: Page, label: RegExp) =>
    page.getByRole('textbox', { name: label });

// JSON Forms text inputs commit their value 300ms after the last keystroke,
// so a value typed right before Next would be missing from the draft
const waitForCommit = (page: Page) => page.waitForTimeout(500);

const SECRET_IS_SET = /Secret is set/;

// The clear button shows while the field is hovered. A re-render can reset
// that, so it hovers again until the click lands.
const clearSecret = async (page: Page, field: Locator) =>
    expect(async () => {
        await field.hover();
        await page
            .getByRole('button', { name: 'Clear secret' })
            .click({ timeout: 2000 });
    }).toPass({ timeout: 30000 });

// PostgreSQL's credentials union has a `discriminator` (auth_type)
test.describe.serial('Secrets: union with a discriminator', () => {
    test.setTimeout(240000);

    const uuid = crypto.randomUUID().split('-')[0];

    let page: Page;

    test.beforeAll(async ({ browser }) => {
        ({ page } = await setUpPage(browser));
    });

    test("drafts the selected option's secret", async () => {
        await startMaterialization(page, /PostgreSQL/, uuid);
        await page
            .getByRole('textbox', { name: 'Address', exact: true })
            .fill('db.example.com:5432');
        await page
            .getByRole('textbox', { name: 'User', exact: true })
            .fill('flow_materialize');
        await page
            .getByRole('textbox', { name: 'Database', exact: true })
            .fill('fake_db');
        await textbox(page, /^Password/).fill('fake-password');
        await clickNext(page);

        expect(await getDraftedPointers(uuid)).toEqual([
            '/credentials/password',
        ]);
        const spec = await getDraftedSpec(uuid);
        expect(spec.endpoint.connector.config.credentials).toEqual({
            auth_type: 'UserPassword',
        });
    });

    test('switching to an option without secrets drops the secret', async () => {
        await switchOption(page, 'AWS IAM');
        await textbox(page, /^AWS Region/).fill('us-east-1');
        await textbox(page, /^AWS Role ARN/).fill(
            'arn:aws:iam::123456789012:role/fake-role'
        );
        await waitForCommit(page);
        await clickNext(page);

        expect(await getDraftedPointers(uuid)).toEqual([]);
        const spec = await getDraftedSpec(uuid);
        expect(spec.endpoint.connector.config.credentials).toEqual({
            auth_type: 'AWSIAM',
            aws_region: 'us-east-1',
            aws_role_arn: 'arn:aws:iam::123456789012:role/fake-role',
        });
    });

    test('switching back brings the stored secret back', async () => {
        await switchOption(page, 'Password');

        const password = textbox(page, /^Password/);
        await expect(password).toHaveValue('');
        await expect(password).toHaveAttribute('placeholder', SECRET_IS_SET);

        await clickNext(page);

        expect(await getDraftedPointers(uuid)).toEqual([
            '/credentials/password',
        ]);
    });
});

// Elasticsearch's credentials union has no `discriminator`; the UI tells the
// options apart by which required fields are filled
test.describe.serial('Secrets: union without a discriminator', () => {
    test.setTimeout(240000);

    const uuid = crypto.randomUUID().split('-')[0];

    let page: Page;

    test.beforeAll(async ({ browser }) => {
        ({ page } = await setUpPage(browser));
    });

    test("drafts the selected option's secret", async () => {
        await startMaterialization(page, /Elasticsearch/, uuid);
        await textbox(page, /^Endpoint/).fill(
            'http://elasticsearch.example.com:9200'
        );
        await textbox(page, /^Username/).fill('elastic');
        await textbox(page, /^Password/).fill('fake-password');
        await clickNext(page);

        expect(await getDraftedPointers(uuid)).toEqual([
            '/credentials/password',
        ]);
    });

    test("switching options drops the old option's secret", async () => {
        await switchOption(page, 'API Key');
        await textbox(page, /^API Key/).fill('ZmFrZS1pZDpmYWtlLWtleQ==');
        await clickNext(page);

        expect(await getDraftedPointers(uuid)).toEqual(['/credentials/apiKey']);
        const spec = await getDraftedSpec(uuid);
        expect(spec.endpoint.connector.config.credentials).toEqual({});
    });

    test('switching back brings the stored secret back', async () => {
        await switchOption(page, 'Username and Password');

        const password = textbox(page, /^Password/);
        await expect(password).toHaveValue('');
        await expect(password).toHaveAttribute('placeholder', SECRET_IS_SET);

        await textbox(page, /^Username/).fill('elastic');
        await waitForCommit(page);
        await clickNext(page);

        expect(await getDraftedPointers(uuid)).toEqual([
            '/credentials/password',
        ]);
    });
});

// Mixpanel's credentials options are told apart by `option_title`, which each
// option fixes with a `const` but no `default`. Its discover succeeds without
// valid credentials, so Next drafts the capture.
test.describe.serial('Secrets: union told apart by a const property', () => {
    test.setTimeout(240000);

    const uuid = crypto.randomUUID().split('-')[0];

    let page: Page;

    const drafted = async () => (await getDraftedCapture(`/${uuid}/`))!.spec;

    test.beforeAll(async ({ browser }) => {
        ({ page } = await setUpPage(browser));
    });

    test("drafts the selected option's secret", async () => {
        await page.goto('http://localhost:3000/captures');
        await page.getByRole('button', { name: 'New Capture' }).click();
        await page
            .getByRole('button', { name: /Mixpanel/ })
            .first()
            .click();
        await expect(page.getByRole('button', { name: 'Next' })).toBeEnabled({
            timeout: 30000,
        });
        await page.locator('#prefixed-name-input').fill(uuid);

        await textbox(page, /^Username/).fill('svc');
        await textbox(page, /^Secret/).fill('fake-secret');
        await page.getByRole('spinbutton', { name: /^Project ID/ }).fill('123');
        await waitForCommit(page);
        await clickNext(page);

        const spec = await drafted();
        expect(Object.values(spec.secrets)).toEqual(['/credentials/secret']);
        // Without a default, the const isn't filled in
        expect(spec.endpoint.connector.config.credentials).toEqual({
            username: 'svc',
            project_id: 123,
        });
    });

    test("switching options drops the old option's fields and secret", async () => {
        await switchOption(page, 'Project Secret');
        await textbox(page, /^Project Secret/).fill('fake-api-secret');
        await waitForCommit(page);
        await clickNext(page);

        const spec = await drafted();
        expect(Object.values(spec.secrets)).toEqual([
            '/credentials/api_secret',
        ]);
        expect(spec.endpoint.connector.config.credentials).toEqual({});
    });

    test("switching back restores the option's fields and stored secret", async () => {
        await switchOption(page, 'Service Account');

        await expect(textbox(page, /^Username/)).toHaveValue('svc');
        await expect(
            page.getByRole('spinbutton', { name: /^Project ID/ })
        ).toHaveValue('123');
        const secret = textbox(page, /^Secret/);
        await expect(secret).toHaveValue('');
        await expect(secret).toHaveAttribute('placeholder', SECRET_IS_SET);

        await clickNext(page);

        const spec = await drafted();
        expect(Object.values(spec.secrets)).toEqual(['/credentials/secret']);
        expect(spec.endpoint.connector.config.credentials).toEqual({
            username: 'svc',
            project_id: 123,
        });
    });
});

// HTTP Ingest's optional auth token is `["string", "null"]`, defaulting to
// `null`. Its discover succeeds without a request, so Next drafts the capture.
test.describe.serial('Secrets: a nullable secret field', () => {
    test.setTimeout(240000);

    const uuid = crypto.randomUUID().split('-')[0];

    let page: Page;

    const token = () => textbox(page, /^Authentication token/);
    const draftedConfig = async () =>
        (await getDraftedCapture(`/${uuid}/`))!.spec;

    test.beforeAll(async ({ browser }) => {
        ({ page } = await setUpPage(browser));
    });

    test('drafts a typed token as a stored secret', async () => {
        await page.goto('http://localhost:3000/captures');
        await page.getByRole('button', { name: 'New Capture' }).click();
        await page
            .getByRole('button', { name: /HTTP Webhook/ })
            .first()
            .click();
        await expect(page.getByRole('button', { name: 'Next' })).toBeEnabled({
            timeout: 30000,
        });
        await page.locator('#prefixed-name-input').fill(uuid);

        await expect(
            page.getByText(/never appears in the capture spec/)
        ).toBeVisible();
        await token().fill('fake-token');
        await waitForCommit(page);
        await clickNext(page);

        const spec = await draftedConfig();
        expect(Object.values(spec.secrets)).toEqual(['/requireAuthToken']);
        expect(spec.endpoint.connector.config).not.toHaveProperty(
            'requireAuthToken'
        );
    });

    test('clearing it drafts no secret, and no null in its place', async () => {
        await expandEndpointConfig(page);
        await expect(token()).toHaveAttribute('placeholder', SECRET_IS_SET);

        await clearSecret(page, token());
        await waitForCommit(page);
        await clickNext(page);

        const spec = await draftedConfig();
        expect(spec.secrets).toBeUndefined();
        expect(spec.endpoint.connector.config).not.toHaveProperty(
            'requireAuthToken'
        );
    });
});

// SSH forwarding is an optional object, so clearing it stops using its stored
// key. PostgreSQL's private key is also a multiline secret, set from a file.
test.describe.serial('Secrets: a secret in an optional object', () => {
    test.setTimeout(240000);

    const uuid = crypto.randomUUID().split('-')[0];
    const KEY_POINTER = '/networkTunnel/sshForwarding/privateKey';
    const PRIVATE_KEY =
        '-----BEGIN OPENSSH PRIVATE KEY-----\nfake-key\n-----END OPENSSH PRIVATE KEY-----\n';

    let page: Page;

    const sshEndpoint = () =>
        page.getByRole('textbox', { name: 'SSH Endpoint' });
    const privateKey = () =>
        page.getByRole('textbox', { name: 'SSH Private Key' });

    // Both sections collapse once the spec is generated
    const openNetworkTunnel = async () => {
        await expandEndpointConfig(page);
        if (!(await sshEndpoint().isVisible())) {
            await page.getByRole('button', { name: 'Network Tunnel' }).click();
        }
    };

    const draftedTunnel = async () =>
        (await getDraftedSpec(uuid)).endpoint.connector.config.networkTunnel;

    test.beforeAll(async ({ browser }) => {
        ({ page } = await setUpPage(browser));
    });

    test('drafts the SSH key set from a file as a stored secret', async () => {
        await startMaterialization(page, /PostgreSQL/, uuid);
        await page
            .getByRole('textbox', { name: 'Address', exact: true })
            .fill('db.example.com:5432');
        await page
            .getByRole('textbox', { name: 'User', exact: true })
            .fill('flow_materialize');
        await page
            .getByRole('textbox', { name: 'Database', exact: true })
            .fill('fake_db');
        await textbox(page, /^Password/).fill('fake-password');

        await openNetworkTunnel();
        await sshEndpoint().fill('ssh://flow@bastion.example.com');
        await page
            .getByRole('button', { name: 'Use secret from file' })
            .click();
        const dialog = page.getByRole('dialog');
        await dialog.locator('input[type="file"]').setInputFiles({
            name: 'id_ed25519',
            mimeType: 'text/plain',
            buffer: Buffer.from(PRIVATE_KEY),
        });
        await dialog.getByRole('button', { name: 'Save' }).click();
        await expect(privateKey()).toHaveValue(PRIVATE_KEY);
        await waitForCommit(page);
        await clickNext(page);

        expect(await getDraftedPointers(uuid)).toEqual([
            '/credentials/password',
            KEY_POINTER,
        ]);
        expect(await draftedTunnel()).toEqual({
            sshForwarding: { sshEndpoint: 'ssh://flow@bastion.example.com' },
        });
    });

    test('clearing SSH forwarding drops the stored key', async () => {
        await openNetworkTunnel();
        await page
            .getByRole('button', { name: /Remove this group/ })
            .filter({ hasText: 'Clear SSH Forwarding' })
            .click();
        await waitForCommit(page);
        await clickNext(page);

        expect(await getDraftedPointers(uuid)).toEqual([
            '/credentials/password',
        ]);
        expect((await draftedTunnel())?.sshForwarding).toBeUndefined();
    });

    test('filling SSH forwarding in again brings the stored key back', async () => {
        await openNetworkTunnel();
        await sshEndpoint().fill('ssh://flow@bastion.example.com');
        await expect(privateKey()).toHaveValue('');
        await expect(privateKey()).toHaveAttribute(
            'placeholder',
            SECRET_IS_SET
        );

        await waitForCommit(page);
        await clickNext(page);

        expect(await getDraftedPointers(uuid)).toEqual([
            '/credentials/password',
            KEY_POINTER,
        ]);
    });
});

// Editing a published task loads its stored secrets as names, never values.
// PostgreSQL's password is in a union with a `discriminator`. Needs the
// database configured by the postgres_* variables in .env, as the task is
// published.
test.describe.serial('Secrets: editing a task with a stored secret', () => {
    test.skip(
        !process.env.postgres_path,
        'Set the postgres_* variables in .env to run'
    );
    test.setTimeout(240000);

    const uuid = crypto.randomUUID().split('-')[0];

    let page: Page;
    let email: string;
    let tenant: string;
    let catalogName: string;
    let storedName: string;

    const password = () => textbox(page, /^Password/);

    // A new value is set on Next, so the live task keeps the real password
    const retypePassword = async () => {
        await password().fill(process.env.postgres_pass!);
        await waitForCommit(page);
    };

    const editLiveTask = async () => {
        const live = (await getLiveTask(catalogName))!;
        await page.goto(
            `http://localhost:3000/materializations/edit?liveSpecId=${live.id}&lastPubId=${live.lastPubId}`
        );
        // Edit opens with the section collapsed
        await page
            .getByRole('button', { name: /Endpoint Config Expand to edit/ })
            .click();
    };

    test.beforeAll(async ({ browser }) => {
        ({ page, email, tenant } = await setUpPage(browser));
        catalogName = `${tenant}/${uuid}/materialize-postgres`;
    });

    test.afterAll(async () => {
        await deleteLiveSpecs(email, `${tenant}/${uuid}`);
    });

    test('publishes with the password as a stored secret', async () => {
        const collection = await ensureSourceCollection(page, tenant);

        await startMaterialization(page, /PostgreSQL/, uuid);
        await page
            .getByRole('textbox', { name: 'Address', exact: true })
            .fill(process.env.postgres_path!);
        await page
            .getByRole('textbox', { name: 'User', exact: true })
            .fill(process.env.postgres_user!);
        await page
            .getByRole('textbox', { name: 'Database', exact: true })
            .fill(process.env.postgres_db!);
        await retypePassword();
        await addCollection(page, collection);
        await confirmDestinationLayout(page);
        // The connector won't write to a table it didn't create, and every
        // run materializes the same collection
        await page
            .getByRole('textbox', { name: 'Table', exact: true })
            .fill(`events_${uuid}`);
        await waitForCommit(page);
        await clickNext(page);
        await publish(page, catalogName);

        const { spec } = (await getLiveTask(catalogName))!;
        expect(Object.values(spec.secrets)).toEqual(['/credentials/password']);
        expect(spec.endpoint.connector.config.credentials).toEqual({
            auth_type: 'UserPassword',
        });
        storedName = Object.keys(spec.secrets)[0];
    });

    test('loads the stored secret without a value', async () => {
        await editLiveTask();

        await expect(
            page.getByRole('tab', { name: 'Password', exact: true })
        ).toHaveAttribute('aria-selected', 'true');
        await expect(password()).toHaveValue('');
        await expect(password()).toHaveAttribute('placeholder', SECRET_IS_SET);
        // Its tooltip, the secret's name, labels the copy link
        await expect(page.getByRole('button', { name: storedName })).toHaveText(
            'Copy secret name'
        );
        // Nothing changed, so there's nothing to draft
        await expect(
            page.getByRole('button', { name: 'Next', exact: true })
        ).toBeHidden();
    });

    test('a new value replaces the stored secret under its name', async () => {
        await retypePassword();
        await expect(
            page.getByText('Clicking Next changes this secret immediately')
        ).toBeVisible();

        await clickNext(page);

        const spec = await getDraftedSpec(uuid);
        expect(spec.secrets).toEqual({ [storedName]: '/credentials/password' });
        expect(spec.endpoint.connector.config.credentials).toEqual({
            auth_type: 'UserPassword',
        });
        await expandEndpointConfig(page);
        await expect(password()).toHaveAttribute('placeholder', SECRET_IS_SET);
    });

    test('a cleared secret is required again, and its name is reused', async () => {
        await expandEndpointConfig(page);

        await clearSecret(page, password());
        await expect(password()).not.toHaveAttribute(
            'placeholder',
            SECRET_IS_SET
        );
        await expect(page.getByText('is a required property')).toBeVisible();

        await retypePassword();
        await clickNext(page);

        const spec = await getDraftedSpec(uuid);
        expect(spec.secrets).toEqual({ [storedName]: '/credentials/password' });
    });
});

// Tasks that keep their secrets sealed with sops:
// each drafts a sops encrypted config with no `secrets` stanza, and its secret
// fields aren't the secrets flow's. (No local connector uses OAuth.)
test.describe.serial('Secrets: tasks that stay on sops', () => {
    test.setTimeout(240000);

    const uuid = crypto.randomUUID().split('-')[0];

    let page: Page;
    let email: string;
    let tenant: string;

    // The secret field's note in the secrets flow
    const secretFieldNote = () => page.getByText(/never appears in the/);

    const expectSops = (config: any, spec: any) => {
        expect(config.sops).toBeDefined();
        expect(spec.secrets).toBeUndefined();
    };

    // A capture's draft is written before its discover, which may then fail
    const draftedCapture = async (name: string) => {
        await expect
            .poll(async () => (await getDraftedCapture(name))?.spec, {
                timeout: 60000,
            })
            .toBeTruthy();

        return (await getDraftedCapture(name))!.spec;
    };

    test.beforeAll(async ({ browser }) => {
        ({ page, email, tenant } = await setUpPage(browser));
    });

    test.afterAll(async () => {
        await deleteLiveSpecs(email, `${tenant}/${uuid}`);
    });

    test('a task with secrets in arrays', async () => {
        // HTTP File's headers are an array of name and secret value pairs
        const name = `${uuid}-file`;
        await page.goto('http://localhost:3000/captures');
        await page.getByRole('button', { name: 'New Capture' }).click();
        await page
            .getByRole('button', { name: /HTTP File/ })
            .first()
            .click();
        await expect(page.getByRole('button', { name: 'Next' })).toBeEnabled({
            timeout: 30000,
        });
        await page.locator('#prefixed-name-input').fill(name);
        await page
            .getByRole('textbox', { name: /^HTTP File URL/ })
            .fill('https://files.example.com/data.csv');
        await expect(secretFieldNote()).toHaveCount(0);

        await waitForCommit(page);
        await page.getByRole('button', { name: 'Next', exact: true }).click();

        const spec = await draftedCapture(`/${name}/`);
        expectSops(spec.endpoint.connector.config, spec);
    });

    test('a Dekaf materialization', async () => {
        const collection = await ensureSourceCollection(page, tenant);
        await createDekafMaterialization(page, `${uuid}-dekaf`, collection);
        await expect(secretFieldNote()).toHaveCount(0);

        await clickNext(page);

        const spec = await getDraftedSpec(`${uuid}-dekaf`);
        expectSops(spec.endpoint.dekaf.config, spec);
    });

    test('a task already on sops', async () => {
        const name = `${uuid}-ingest`;
        const collection = `${tenant}/${name}/webhook-data`;
        // Encrypted with the local stack's test age key
        const config = JSON.parse(
            readFileSync(
                resolve(
                    __dirname,
                    '../../src/test/fixtures/unsortedSopsConfig.json'
                ),
                'utf8'
            )
        );
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
                    catalogName: `${tenant}/${name}/source-http-ingest`,
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
            'playwright sops capture'
        );

        await editLiveCapture(page, (await getLiveCapture(`/${name}/`))!);
        await page
            .getByRole('button', { name: /Endpoint Config Expand to edit/ })
            .click();
        await expect(secretFieldNote()).toHaveCount(0);

        // Refresh writes the capture to the draft before discovering
        await page.getByRole('button', { name: 'Refresh' }).click();

        const spec = await draftedCapture(`/${name}/`);
        expectSops(spec.endpoint.connector.config, spec);
    });

    test('a task pinned to runtime v1', async () => {
        const name = `${uuid}-v1`;
        await startHelloWorldCapture(page, name);
        await clickNext(page);
        await publishCapture(page, `/${name}/`);

        // Hello World has no secrets, so its config was written as plaintext
        const live = (await getLiveCapture(`/${name}/`))!;
        expect(live.spec.endpoint.connector.config.sops).toBeUndefined();
        await publishDraftSpecs(
            email,
            [
                {
                    catalogName: `${tenant}/${name}/source-hello-world`,
                    spec: {
                        ...live.spec,
                        shards: {
                            ...live.spec.shards,
                            flags: {
                                ...live.spec.shards?.flags,
                                'enable-runtime-v2': 'false',
                            },
                        },
                    },
                    specType: 'capture',
                    expectPubId: live.lastPubId,
                },
            ],
            'playwright runtime v1 capture'
        );

        await editLiveCapture(page, (await getLiveCapture(`/${name}/`))!);
        await page
            .getByRole('button', { name: /Endpoint Config Expand to edit/ })
            .click();
        await fillMessageRate(page, '7');
        await waitForCommit(page);
        await clickNext(page);

        const spec = await draftedCapture(`/${name}/`);
        expectSops(spec.endpoint.connector.config, spec);
    });
});
