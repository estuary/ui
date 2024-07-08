import { expect, Page, request } from '@playwright/test';
import { inbucketURL } from '../tests/props';

// https://www.bekapod.dev/articles/supabase-magic-login-testing-with-playwright/

export const emailDomain = '@example.com';

export const getLoginMessage = async (username: string) => {
    const requestContext = await request.newContext();
    const messages = await requestContext
        .get(`${inbucketURL}/api/v1/mailbox/${username}`)
        .then((res) => res.json())
        // InBucket doesn't have any params for sorting, so here
        // we're sorting the messages by date
        .then((items) =>
            [...items].sort((a, b) => {
                if (a.date < b.date) {
                    return 1;
                }

                if (a.date > b.date) {
                    return -1;
                }

                return 0;
            })
        );

    // As we've sorted the messages by date, the first message in
    // the `messages` array will be the latest one
    const latestMessageId = messages[0]?.id;

    if (latestMessageId) {
        const message = await requestContext
            .get(`${inbucketURL}/api/v1/mailbox/${username}/${latestMessageId}`)
            .then((res) => res.json());

        // We've got the latest email. We're going to use regular
        // expressions to match the bits we need.
        const token = message.body.text.match(/enter the code: ([0-9]+)/)[1];
        const url = message.body.text.match(/Log In \( (.+) \)/)[1];

        return { token, url };
    }

    return {
        token: '',
        url: '',
    };
};

export const startSessionWithUser = async (
    page: Page,
    originalName: string,
    skipGoTo?: boolean
) => {
    const name = `${originalName}`;
    const email = `${name}${emailDomain}`;
    /////////////////////////////////
    // START - AUTH STEPS
    if (!skipGoTo) {
        await page.goto(`http://localhost:3000/login`);
    }

    // Log in with magic link
    await expect(page.getByText('Sign in to continue')).toBeVisible();
    await page.getByLabel('Email').type(email);
    await page.getByRole('button', { name: 'Sign in with magic link' }).click();
    await expect(
        page.getByText('Magic link sent. Please check your email.')
    ).toBeVisible();

    // Snag the details from the inbucket API
    const { token } = await getLoginMessage(name);

    // Fill in the rest of the auth form
    await page
        .getByRole('button', { name: 'Already have an OTP code?' })
        .click();
    await page.getByLabel('OTP').type(token);
    await page.getByText('Sign in with OTP').click();

    return [name, email];
};

export const inituser = async (
    page: Page,
    originalName: string,
    logout?: boolean
) => {
    const [name, email] = await startSessionWithUser(page, originalName);

    // Agree to Legal
    const legalStuffResponse = await expect
        .soft(page.getByText('Legal Stuff'))
        .toBeVisible();

    await page
        .getByText('I accept the Privacy Policy and Terms of Service')
        .click();
    await page.getByRole('button', { name: 'Continue' }).click();

    // Create Tenant
    await expect(page.getByText(`Let's get started`)).toBeVisible();
    await page.getByLabel('Name').type(name);
    await page.getByRole('button', { name: 'Continue' }).click();

    //Wait for processing
    await expect(page.getByText('Welcome to Flow!')).toBeVisible();

    if (logout) {
        await page.goto('http://localhost:3000/logout');
        await expect(page.getByText('Sign in to continue')).toBeVisible();
    }

    return [name, email];
};

export const defaultLocalStorage = async (page: Page) => {
    await page.context().addInitScript(() => {
        // Keep the left nav open
        window.localStorage.setItem(
            'estuary.navigation-settings',
            JSON.stringify({ open: true })
        );

        // Hide the help docs
        window.localStorage.setItem('estuary.side-panel-docs', 'false');
    });
};

export const openDetailsFromTable = async (
    page: Page,
    name: string,
    entity: 'captures' | 'collections' | 'materializations'
) => {
    await page.goto(`http://localhost:3000/${entity}`);

    await page
        .getByRole('link', {
            name: name,
            exact: true,
        })
        .click();
};

export const defaultPageSetup = async (page: Page, name: string) => {
    await page.route('*js.stripe*', async () => {});
    await page.route('*lr.com', async () => {});
    await defaultLocalStorage(page);
    const response = await inituser(page, name);
    return response;
};

export const saveAndPublish = async (page: Page) => {
    // Save, wait, assert, close, view details
    await page.getByRole('button', { name: 'Save and publish' }).click();

    // Dumb but it works. This was randomly messing up so just adding some buffer
    await page.waitForTimeout(5000);

    await page
        .getByRole('listitem')
        .locator('div')
        .filter({ hasText: 'Success' });

    await page.getByRole('button', { name: 'Close' }).click();
};
