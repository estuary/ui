import { inbucketURL } from '../tests/props';
import {
    AuthFile,
    AuthProps,
    Entity,
    StartSessionWithUserResponse,
} from './types';
import { expect, Page, Request, request, TestType } from '@playwright/test';

import path = require('path');
import fs = require('fs');

// https://www.bekapod.dev/articles/supabase-magic-login-testing-with-playwright/

export const emailDomain = '@example.com';
export const tenantSuffix = '_tenant';

const updateSavedAuth = (filePath: string, updates: Partial<AuthFile>) => {
    console.log('updateSavedAuth:reading');
    const authSettings: AuthFile = JSON.parse(
        fs.readFileSync(filePath).toString()
    );

    const backedUpFile = `${filePath}.backup.${Date.now().toString()}`;
    console.log('updateSavedAuth:backingUp', backedUpFile);
    fs.writeFileSync(backedUpFile, JSON.stringify(authSettings));

    const updatedValue = {
        ...authSettings,
        ...updates,
    };
    console.log('updateSavedAuth:updating', updatedValue);
    fs.writeFileSync(filePath, JSON.stringify(updatedValue));
};

// Used to fetch the OTP we need during login. This hits your actual local InBucket from Supabase
export const getLoginMessage = async (username: string) => {
    console.log('getLoginMessage:latest message:searching');

    const requestContext = await request.newContext();
    const messages = await requestContext
        .get(`${inbucketURL}/api/v1/search?query=to:"${username}"&limit=1`)
        .then((res) => res.json());

    const latestMessageId = messages?.messages[0]?.ID;

    if (latestMessageId) {
        console.log('getLoginMessage:latest message:narrowing');
        const message = await requestContext
            .get(`${inbucketURL}/api/v1/message/${latestMessageId}`)
            .then((res) => res.json());

        // We've got the latest email. We're going to use regular
        // expressions to match the bits we need.
        const token = message.Text.match(/enter the code: ([0-9]+)/)[1];
        const url = message.Text.match(/Log In \( (.+) \)/)[1];

        console.log('getLoginMessage:latest message:found');
        return { token, url };
    }

    console.warn('getLoginMessage:latest message:not found');

    return {
        token: '',
        url: '',
    };
};

export const startSessionWithUser = async (
    page: Page,
    test: any,
    originalName: string,
    skipGoTo?: boolean
): Promise<StartSessionWithUserResponse> => {
    console.log('startingSession:start');
    const name = `${originalName}`;

    console.log('startingSession:directory:checking');
    const fileDir = `${test.info().project.testDir}/.auth`;
    const authDirExists = fs.existsSync(fileDir);
    if (!authDirExists) {
        console.log('startingSession:directory:creating');
        fs.mkdirSync(fileDir);
    }

    console.log('startingSession:saved:checking');
    const filePath = `${fileDir}/${name}.json`;
    const authFileExists = fs.existsSync(filePath);
    let authSettings: AuthFile | undefined;
    if (authFileExists) {
        console.log('startingSession:saved:found');
        authSettings = JSON.parse(fs.readFileSync(filePath).toString());
    }

    if (!skipGoTo) {
        console.log('startingSession:login:skipped');
        await page.goto(`http://localhost:3000/login`);
    }

    console.log('startingSession:login:start');
    const email = authSettings?.email ?? `${name}${emailDomain}`;
    await expect(page.getByText('Get started with Estuary')).toBeVisible();
    await page.getByLabel('Email').type(email);
    await page.getByRole('button', { name: 'Sign in with magic link' }).click();
    await expect(
        page.getByText('Magic link sent. Please check your email.')
    ).toBeVisible();

    console.log('startingSession:login:token:fetch');
    const { token } = await getLoginMessage(name);

    console.log('startingSession:login:token:enter');
    await page
        .getByRole('button', { name: 'Already have an OTP code?' })
        .click();
    await page.getByLabel('OTP').type(token);
    await page.getByText('Sign in with OTP').click();

    console.log('startingSession:login:settings:check', {
        authSettings,
    });
    if (!authSettings) {
        console.log('startingSession:login:settings:defaulting');
        authSettings = {
            email,
            tenant: null,
        };

        fs.writeFileSync(filePath, JSON.stringify(authSettings));
    }

    console.log('startingSession:end');
    return {
        email: authSettings?.email ?? email,
        tenant: authSettings?.tenant ?? null,
        filePath,
        name,
        saved: true,
    };
};

export const inituser = async (
    page: Page,
    test: any,
    originalName: string,
    logout?: boolean
): Promise<AuthProps> => {
    let newTenant;

    const { name, email, filePath, tenant } = await startSessionWithUser(
        page,
        test,
        originalName
    );

    console.log(`tenant:checking`, { tenant });
    if (!tenant) {
        newTenant = `${name}${tenantSuffix}`;
        console.log(`tenant:started:${name},${newTenant}`);

        // Wait for load
        await expect(page.getByText(`Get started with Estuary`)).toBeVisible();
        await expect(page.getByText(`Where did you hear about`)).toBeVisible();

        // Create Tenant
        await page.getByLabel('Organization Name').fill(newTenant);

        // Choose an available data plane.
        await page.getByRole('combobox', { name: 'Data plane' }).click();
        await page
            .getByRole('option')
            .filter({ hasNotText: 'Select a data plane' })
            .first()
            .click();

        // Tell how we heard
        await page
            .getByRole('combobox', {
                name: 'Where did you hear about Estuary?',
            })
            .click();
        await page.getByRole('option', { name: 'Other' }).click();

        // Agree to Legal
        await page
            .getByRole('checkbox', { name: /I have read and accept the/ })
            .check();

        // Finish
        await page.getByRole('button', { name: 'Continue' }).click();

        updateSavedAuth(filePath, {
            tenant: newTenant,
        });

        console.log(`tenant:done:${name},${newTenant}`);
    }

    //Wait for processing
    await expect(page.getByText('Welcome to Estuary!')).toBeVisible();

    if (logout) {
        await page.goto('http://localhost:3000/logout');
        await expect(page.getByText('Sign in to continue')).toBeVisible();
    }

    return {
        email,
        filePath,
        name,
        saved: true,
        tenant: tenant ?? newTenant ?? 'ERROR_WITH_TENANT',
    };
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

export const getLinkForEntity = (entity: Entity) => {
    switch (entity) {
        case 'captures':
            return 'Sources';
        case 'collections':
            return 'Collections';
        case 'materializations':
            return 'Destinations';
        default:
            throw Error('unknown entity');
    }
};

export const goToEntityPage = async (page: Page, entity: Entity) => {
    await page
        .getByRole('link', { name: getLinkForEntity(entity), exact: true })
        .click();
};

export const openDetailsFromTable = async (
    page: Page,
    name: string,
    entity: Entity,
    goDirectly: boolean = false
) => {
    if (goDirectly) {
        await page.goto(`http://localhost:3000/${entity}`);
    } else {
        await goToEntityPage(page, entity);
    }

    await page.waitForURL(`**/${entity}`);

    // Open the details
    await page.getByRole('link', { name: `View details of ${name}` }).click();
    await page.waitForURL('**/details/**');
};

export const defaultPageSetup = async (page: Page, test: any, name: string) => {
    await page.route('*js.stripe*', async () => {});
    await page.route('*lr.com', async () => {});
    await defaultLocalStorage(page);

    const restored = await restoreSession(page, test, name);
    if (restored) {
        return restored;
    }

    const response = await inituser(page, test, name);
    await saveSession(page, test, name);

    return response;
};

// Saves the page's browser state as the user's latest sign in
export const saveSession = async (page: Page, test: any, name: string) => {
    await page
        .context()
        .storageState({ path: getSessionStatePath(test, name) });
};

const APP_ORIGIN = 'http://localhost:3000';

// The browser state of a user's last sign in, so later tests can skip the
// emailed OTP while that session is still valid
const getSessionStatePath = (test: any, name: string) =>
    `${test.info().project.testDir}/.auth/${name}.state.json`;

// Signs `page` in with the user's saved browser state. Resolves to null when
// there's no saved state, or its session is no longer valid.
const restoreSession = async (
    page: Page,
    test: any,
    name: string
): Promise<AuthProps | null> => {
    const statePath = getSessionStatePath(test, name);
    const authPath = `${test.info().project.testDir}/.auth/${name}.json`;
    if (!fs.existsSync(statePath) || !fs.existsSync(authPath)) {
        return null;
    }

    const authSettings: AuthFile = JSON.parse(
        fs.readFileSync(authPath).toString()
    );
    if (!authSettings.tenant) {
        return null;
    }

    const state = JSON.parse(fs.readFileSync(statePath).toString());
    const localStorageItems =
        state.origins?.find((origin: any) => origin.origin === APP_ORIGIN)
            ?.localStorage ?? [];

    await page.context().addCookies(state.cookies ?? []);

    // Only the page's first load is restored, so signing out sticks
    await page.context().addInitScript((items) => {
        if (window.sessionStorage.getItem('pw-session-restored')) {
            return;
        }
        window.sessionStorage.setItem('pw-session-restored', 'true');
        items.forEach(({ name: key, value }: any) =>
            window.localStorage.setItem(key, value)
        );
    }, localStorageItems);

    await page.goto(`${APP_ORIGIN}/welcome`);

    const welcome = page.getByText('Welcome to Estuary!');
    const signIn = page.getByText('Get started with Estuary');
    await expect(welcome.or(signIn)).toBeVisible();

    if (!(await welcome.isVisible())) {
        console.log('restoreSession:expired', { name });

        // A session can outlive its user (e.g. a reset local stack) and land on
        // tenant onboarding, so drop it before signing in again
        await page.context().clearCookies();
        await page.evaluate(() => window.localStorage.clear());

        return null;
    }

    console.log('restoreSession:restored', { name });
    return {
        email: authSettings.email,
        filePath: authPath,
        name,
        saved: true,
        tenant: authSettings.tenant,
    };
};

// Closing the logs before the workflow sees the job succeed leaves it on the
// form, so wait for its success alert first
export const closeLogsOnSuccess = async (page: Page) => {
    const logs = page.getByRole('dialog');

    await expect(logs.getByRole('alert').getByText('Success')).toBeVisible({
        timeout: 120000,
    });
    await logs.getByRole('button', { name: 'Close' }).click();
};

// Publishes from the workflow and closes the logs once it succeeds, which
// opens the published task's details
export const publishAndOpenDetails = async (page: Page) => {
    await page.getByRole('button', { name: 'Save and publish' }).click();
    await closeLogsOnSuccess(page);
    await page.waitForURL('**/details/**');
};

// Records the page's requests that match, from now on
export const recordRequests = (
    page: Page,
    matches: (request: Request) => boolean
) => {
    const recorded: Request[] = [];
    page.on('request', (pageRequest) => {
        if (matches(pageRequest)) {
            recorded.push(pageRequest);
        }
    });

    return recorded;
};

// An endpoint config sent to the encryption service
export const isEncryptRequest = (pageRequest: Request) =>
    pageRequest.url().includes('/functions/v1/oauth') &&
    (pageRequest.postData() ?? '').includes('encrypt-config');

// A new draft being created, through GraphQL or PostgREST
export const isCreateDraftRequest = (pageRequest: Request) => {
    const url = new URL(pageRequest.url());

    return (
        (url.pathname.endsWith('/graphql') &&
            (pageRequest.postData() ?? '').includes('CreateDraft')) ||
        (pageRequest.method() === 'POST' &&
            url.pathname.endsWith('/rest/v1/drafts'))
    );
};
