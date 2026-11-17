import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from 'react-intl';
import { CombinedError } from 'urql';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { SecretDropboxForm } from 'src/components/secrets/SecretDropboxForm';
import { useCanEditSecret } from 'src/hooks/secrets/useCanEditSecret';
import { useGetSecret } from 'src/hooks/secrets/useGetSecret';
import { useSetSecret } from 'src/hooks/secrets/useSetSecret';
import enUSMessages from 'src/lang/en-US';

import '@testing-library/jest-dom/vitest';

vi.mock(import('src/hooks/secrets/useCanEditSecret'), () => ({
    useCanEditSecret: vi.fn(),
}));
vi.mock(import('src/hooks/secrets/useGetSecret'), () => ({
    useGetSecret: vi.fn(),
}));
vi.mock(import('src/hooks/secrets/useSetSecret'), () => ({
    useSetSecret: vi.fn(),
}));

const NAME = 'acmeCo/team/api-key';
const VALUE = 'super-secret-value';
const SAVED_MESSAGE =
    'Secret saved. You can close this page and return to your agent.';

const setSecret = vi.fn();

function mockHooks({
    canEdit = true,
    permissionFetching = false,
    permissionError,
    secretId,
    secretFetching = false,
    secretError,
}: {
    canEdit?: boolean;
    permissionFetching?: boolean;
    permissionError?: CombinedError;
    secretId?: string;
    secretFetching?: boolean;
    secretError?: CombinedError;
} = {}) {
    vi.mocked(useCanEditSecret).mockReturnValue({
        canEdit,
        fetching: permissionFetching,
        error: permissionError,
    });
    vi.mocked(useGetSecret).mockReturnValue({
        secret: secretId ? { catalogName: NAME, secretId } : null,
        fetching: secretFetching,
        error: secretError,
    });
}

function renderForm() {
    const user = userEvent.setup();
    const view = render(
        <IntlProvider locale="en-US" messages={enUSMessages}>
            <SecretDropboxForm secretName={NAME} />
        </IntlProvider>
    );
    return { user, view };
}

const valueInput = () => screen.getByLabelText(/Secret value/);
const saveButton = () => screen.getByRole('button', { name: 'Save secret' });
const querySaveButton = () =>
    screen.queryByRole('button', { name: 'Save secret' });

// jsdom drops `-webkit-text-security`, so look for the rule emotion
//  generated for the field's class
const isMasked = (input: HTMLElement) => {
    const css = Array.from(document.querySelectorAll('style'))
        .map((style) => style.textContent)
        .join('');
    const root = input.closest('.MuiTextField-root')!;

    return Array.from(root.classList).some((className) =>
        css.includes(`.${className} textarea{-webkit-text-security:disc;}`)
    );
};

async function enterValueAndSave(user: ReturnType<typeof userEvent.setup>) {
    await user.type(valueInput(), VALUE);
    await user.click(saveButton());
}

describe('SecretDropboxForm', () => {
    beforeEach(() => {
        setSecret.mockReset();
        setSecret.mockResolvedValue({ changed: true });
        vi.mocked(useSetSecret).mockReturnValue(setSecret);
    });

    describe('while loading', () => {
        test('should show a spinner while checking permission', () => {
            mockHooks({ permissionFetching: true });
            renderForm();

            expect(screen.getByRole('progressbar')).toBeInTheDocument();
            expect(querySaveButton()).not.toBeInTheDocument();
        });

        test('should wait for the existence check before showing the form', () => {
            mockHooks({ secretFetching: true });
            renderForm();

            expect(screen.getByRole('progressbar')).toBeInTheDocument();
            expect(querySaveButton()).not.toBeInTheDocument();
        });
    });

    test('should show an error when the checks fail to load', () => {
        mockHooks({
            permissionError: new CombinedError({
                graphQLErrors: [{ message: 'boom' }],
            }),
        });
        renderForm();

        expect(
            screen.getByText(
                'We could not load this secret. Reload the page to try again.'
            )
        ).toBeInTheDocument();
        expect(querySaveButton()).not.toBeInTheDocument();
    });

    test('should show error when the user cannot set secrets under the prefix', () => {
        mockHooks({ canEdit: false });
        renderForm();

        expect(
            screen.getByText(
                /You don't have permission to set secrets under acmeCo\/team\//
            )
        ).toBeInTheDocument();
        expect(querySaveButton()).not.toBeInTheDocument();
    });

    describe('for a new secret', () => {
        test('should show the name and require a value', () => {
            mockHooks();
            renderForm();

            expect(screen.getByLabelText('Secret name')).toHaveValue(NAME);
            expect(screen.getByLabelText('Secret name')).toBeDisabled();
            expect(saveButton()).toBeDisabled();
            expect(
                screen.queryByText(/already exists/)
            ).not.toBeInTheDocument();
        });

        test('should save the value, then confirm and clear it', async () => {
            mockHooks();
            const { user } = renderForm();

            await enterValueAndSave(user);

            expect(await screen.findByText(SAVED_MESSAGE)).toBeInTheDocument();
            expect(setSecret).toHaveBeenCalledExactlyOnceWith(NAME, VALUE);
            expect(screen.queryByDisplayValue(VALUE)).not.toBeInTheDocument();
        });

        test('should save only once when submitted repeatedly', async () => {
            mockHooks();
            const { user, view } = renderForm();

            await user.type(valueInput(), VALUE);
            const form = view.container.querySelector('form')!;
            fireEvent.submit(form);
            fireEvent.submit(form);

            expect(await screen.findByText(SAVED_MESSAGE)).toBeInTheDocument();
            expect(setSecret).toHaveBeenCalledTimes(1);
        });
    });

    describe('for an existing secret', () => {
        test('should require confirming the overwrite before saving', async () => {
            mockHooks({ secretId: '166f8c1993053400' });
            const { user } = renderForm();

            expect(
                screen.getByText(/A secret with this name already exists/)
            ).toBeInTheDocument();

            await user.type(valueInput(), VALUE);
            expect(saveButton()).toBeDisabled();

            await user.click(
                screen.getByRole('checkbox', {
                    name: 'Replace the existing value',
                })
            );
            await user.click(saveButton());

            expect(await screen.findByText(SAVED_MESSAGE)).toBeInTheDocument();
            expect(setSecret).toHaveBeenCalledExactlyOnceWith(NAME, VALUE);
        });
    });

    describe('when saving fails', () => {
        test('should show the error and clear the value', async () => {
            mockHooks();
            setSecret.mockRejectedValue(
                new CombinedError({
                    graphQLErrors: [{ message: 'document is stale' }],
                })
            );
            const { user } = renderForm();

            await enterValueAndSave(user);

            expect(
                await screen.findByText('document is stale')
            ).toBeInTheDocument();
            expect(valueInput()).toHaveValue('');
            expect(screen.queryByText(SAVED_MESSAGE)).not.toBeInTheDocument();
        });

        test('should ask the user to log in again when the session expired', async () => {
            mockHooks();
            setSecret.mockRejectedValue(
                new CombinedError({ response: { status: 401 } })
            );
            const { user } = renderForm();

            await enterValueAndSave(user);

            expect(
                await screen.findByText(
                    'Your session expired. Please log in again to continue.'
                )
            ).toBeInTheDocument();
        });
    });

    describe('the value input', () => {
        test('should keep the value out of recordings and autofill', () => {
            mockHooks();
            renderForm();

            const input = valueInput();
            expect(isMasked(input)).toBe(true);
            expect(input).toHaveAttribute('data-private');
            expect(input).toHaveClass('ph-no-capture');
            expect(input).toHaveAttribute('autocomplete', 'new-password');
            expect(input).toHaveAttribute('spellcheck', 'false');
        });

        test('should toggle the value between hidden and visible', async () => {
            mockHooks();
            const { user } = renderForm();

            await user.click(
                screen.getByRole('button', { name: 'Show value' })
            );
            await waitFor(() => expect(isMasked(valueInput())).toBe(false));

            await user.click(
                screen.getByRole('button', { name: 'Hide value' })
            );
            await waitFor(() => expect(isMasked(valueInput())).toBe(true));
        });
    });
});
