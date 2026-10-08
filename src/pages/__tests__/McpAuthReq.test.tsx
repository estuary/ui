import '@testing-library/jest-dom/vitest';

import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { McpAuthReq } from 'src/pages/McpAuthReq';

const { mint } = vi.hoisted(() => ({ mint: vi.fn() }));

vi.mock('src/api/gql/refreshTokens', () => ({
    useCreateRefreshToken: () => [{}, mint],
}));
vi.mock('src/hooks/usePageTitle', () => ({ default: vi.fn() }));
vi.mock('src/services/shared', () => ({ logRocketConsole: vi.fn() }));

const consent = {
    client_name: 'Claude Code',
    client_host: 'claude.ai',
    client_id: 'https://claude.ai/oauth/claude-code-client-metadata',
    client_uri: null,
    resource: 'http://localhost:8080/mcp',
};

const mount = (adapter = 'http://localhost:8080') =>
    render(
        <MemoryRouter
            initialEntries={[
                `/mcp-auth?adapter=${encodeURIComponent(adapter)}&state=pending-request`,
            ]}
        >
            <McpAuthReq />
        </MemoryRouter>
    );

beforeEach(() => {
    mint.mockReset();
    vi.stubEnv('VITE_MCP_ALLOWED_SERVER_ORIGINS', 'http://localhost:8080');
    vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
});

test('rejects an untrusted adapter before fetching or minting', async () => {
    mount('http://localhost:8080.evil.test');
    expect(await screen.findByRole('alert')).toHaveTextContent(
        'not a recognized'
    );
    expect(fetch).not.toHaveBeenCalled();
    expect(mint).not.toHaveBeenCalled();
});

test('disables consent when no adapter origin is configured', async () => {
    vi.stubEnv('VITE_MCP_ALLOWED_SERVER_ORIGINS', '');
    mount();
    expect(await screen.findByRole('alert')).toHaveTextContent(
        'not a recognized'
    );
    expect(fetch).not.toHaveBeenCalled();
});

test('shows the client identity and mints a reusable token with a two-day idle lifetime only on approval', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(consent)));
    mint.mockResolvedValue({ error: { message: 'Mint failed' } });
    mount();
    const approve = await screen.findByRole('button', { name: 'Approve' });
    expect(screen.getByText(/served by claude.ai/)).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8080/oauth/consent-context?state=pending-request',
        { credentials: 'omit' }
    );
    expect(mint).not.toHaveBeenCalled();
    fireEvent.click(approve);
    expect(await screen.findByText('Mint failed')).toBeInTheDocument();
    expect(mint).toHaveBeenCalledWith({
        multiUse: true,
        validFor: 'P2D',
        detail: `Estuary MCP — ${consent.client_name}`,
    });
});

test.each([
    () => Promise.resolve(new Response('', { status: 404 })),
    () => Promise.resolve(new Response('invalid JSON')),
    () => Promise.reject(new Error('Offline')),
])('a failed context fetch cannot issue credentials', async (response) => {
    vi.mocked(fetch).mockImplementation(response);
    mount();
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(
        screen.queryByRole('button', { name: 'Approve' })
    ).not.toBeInTheDocument();
    expect(mint).not.toHaveBeenCalled();
});
