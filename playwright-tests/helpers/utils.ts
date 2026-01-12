import { inbucketURL } from '../tests/props';
import {
    AuthFile,
    AuthProps,
    Entity,
    StartSessionWithUserResponse,
} from './types';
import { expect, Page, request, TestType } from '@playwright/test';

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
            legalDone: false,
            tenant: null,
        };

        fs.writeFileSync(filePath, JSON.stringify(authSettings));
    }

    console.log('startingSession:end');
    return {
        email: authSettings?.email ?? email,
        legalDone: authSettings?.legalDone ?? false,
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

    const { name, email, filePath, legalDone, tenant } =
        await startSessionWithUser(page, test, originalName);

    console.log(`legal:checking`, { legalDone });
    if (!legalDone) {
        console.log(`legal:started:${name}`);

        // Agree to Legal
        const legalStuffResponse = await expect
            .soft(page.getByText('Legal Stuff'))
            .toBeVisible();

        await page
            .getByText('I accept the Privacy Policy and Terms of Service')
            .click();
        await page.getByRole('button', { name: 'Continue' }).click();

        updateSavedAuth(filePath, {
            legalDone: true,
        });

        console.log(`legal:done:${name}`);
    }

    console.log(`tenant:checking`, { tenant });
    if (!tenant) {
        newTenant = `${name}${tenantSuffix}`;
        console.log(`tenant:started:${name},${newTenant}`);

        // Wait for load
        await expect(page.getByText(`Get started with Estuary`)).toBeVisible();
        await expect(page.getByText(`Where did you hear about`)).toBeVisible();

        // Create Tenant
        await page.getByRole('textbox', { name: 'Organization' }).click();
        await page.getByLabel('Organization').type(`${name}${tenantSuffix}`);

        // Tell how we heard
        await page.getByText('Other').click();

        // Finish
        await page
            .getByRole('button', { name: 'Complete Registration' })
            .click();

        updateSavedAuth(filePath, {
            tenant: newTenant,
        });

        console.log(`tenant:done:${name},${newTenant}`);
    }

    //Wait for processing
    await expect(page.getByText('Welcome to Flow!')).toBeVisible();

    if (logout) {
        await page.goto('http://localhost:3000/logout');
        await expect(page.getByText('Sign in to continue')).toBeVisible();
    }

    return {
        email,
        filePath,
        legalDone: true,
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
    await page.getByLabel(getLinkForEntity(entity)).click();
};

// TODO (FIX THIS)
// This stupid thing won't work for some reason I cannot figure out.
//  The link is there, I can see it, Playwright test-gen can see it, but
//  the test cannot see the link.
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
    await page.getByRole('link', { name }).click();
};

export const defaultPageSetup = async (page: Page, test: any, name: string) => {
    await page.route('*js.stripe*', async () => {});
    await page.route('*lr.com', async () => {});
    await defaultLocalStorage(page);
    const response = await inituser(page, test, name);
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
