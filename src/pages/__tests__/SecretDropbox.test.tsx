import { render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { SecretDropboxForm } from 'src/components/secrets/SecretDropboxForm';
import { useUpdateHelmet } from 'src/context/UpdateHelmet';
import enUSMessages from 'src/lang/en-US';
import { SecretDropbox } from 'src/pages/SecretDropbox';

import '@testing-library/jest-dom/vitest';

vi.mock(import('src/components/secrets/SecretDropboxForm'), () => ({
    SecretDropboxForm: vi.fn(() => <div>secret form</div>),
}));
vi.mock(import('src/context/UpdateHelmet'), () => ({
    useUpdateHelmet: vi.fn(),
}));

const updateTitle = vi.fn();

function renderAt(search: string) {
    render(
        <IntlProvider locale="en-US" messages={enUSMessages}>
            <MemoryRouter initialEntries={[`/secrets/dropbox${search}`]}>
                <SecretDropbox />
            </MemoryRouter>
        </IntlProvider>
    );
}

describe('SecretDropbox', () => {
    beforeEach(() => {
        vi.mocked(SecretDropboxForm).mockClear();
        updateTitle.mockReset();
        vi.mocked(useUpdateHelmet).mockReturnValue({
            updateTitle,
            updateDescription: vi.fn(),
            updateOgTitle: vi.fn(),
        } as unknown as ReturnType<typeof useUpdateHelmet>);
    });

    test('should set the browser title', () => {
        renderAt('?name=acmeCo%2Fapi-key');

        expect(updateTitle).toHaveBeenCalledWith('Estuary | Provide a secret');
    });

    test('should pass the name from the URL to the form', () => {
        renderAt('?name=acmeCo%2Fteam%2Fapi-key');

        expect(screen.getByText('secret form')).toBeInTheDocument();
        expect(vi.mocked(SecretDropboxForm).mock.calls[0][0]).toEqual({
            secretName: 'acmeCo/team/api-key',
        });
    });

    test('should ignore other URL parameters', () => {
        renderAt('?name=acmeCo%2Fapi-key&label=Paste%20it%20here');

        expect(vi.mocked(SecretDropboxForm).mock.calls[0][0]).toEqual({
            secretName: 'acmeCo/api-key',
        });
    });

    test.each([
        ['no name', ''],
        ['an empty name', '?name='],
        ['a name without a prefix', '?name=api-key'],
        ['an invalid name', '?name=acmeCo%2Fbad%20name'],
    ])('should reject a link with %s', (_label, search) => {
        renderAt(search);

        expect(
            screen.getByText(/Ask your agent for a new link/)
        ).toBeInTheDocument();
        expect(SecretDropboxForm).not.toHaveBeenCalled();
    });
});
