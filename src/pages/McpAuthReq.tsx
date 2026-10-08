import { useCallback, useEffect, useState } from 'react';

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Stack,
    Toolbar,
    Typography,
} from '@mui/material';

import { useSearchParams } from 'react-router-dom';

import { useCreateRefreshToken } from 'src/api/gql/refreshTokens';
import { authenticatedRoutes } from 'src/app/routes';
import usePageTitle from 'src/hooks/usePageTitle';
import { logRocketConsole } from 'src/services/shared';
import { getMcpSettings } from 'src/utils/env-utils';
import { getURL } from 'src/utils/misc-utils';

// Each use renews the token's two-day idle lifetime.
const MCP_TOKEN_VALIDITY = 'P2D';

interface ConsentContext {
    client_name: string;
    client_host: string;
    client_id: string;
    client_uri: string | null;
    resource: string;
}

export const McpAuthReq = () => {
    usePageTitle({ header: authenticatedRoutes.mcpAuth.title });

    const [searchParams] = useSearchParams();

    const adapter = searchParams.get('adapter');
    const state = searchParams.get('state');

    const [, createRefreshToken] = useCreateRefreshToken();

    const [consent, setConsent] = useState<ConsentContext | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const adapterOrigin = validateAdapterOrigin(adapter);

    useEffect(() => {
        if (!adapter || !state) {
            setError(`This authorization link is missing required parameters.`);

            return;
        }

        if (!adapterOrigin) {
            logRocketConsole('mcp auth: rejected adapter origin', { adapter });
            setError(
                `Refusing to authorize ${adapter}: it is not a recognized Estuary MCP server. This link may not be genuine.`
            );

            return;
        }

        const url = new URL('/oauth/consent-context', adapterOrigin);
        url.searchParams.set('state', state);

        let active = true;
        setConsent(null);
        setError(null);

        const loadConsent = async () => {
            try {
                const response = await fetch(url.toString(), {
                    credentials: 'omit',
                });
                if (!response.ok) {
                    throw new globalThis.Error(
                        `This authorization request is unknown or has expired. Start the connection again from your MCP client.`
                    );
                }
                const context: ConsentContext = await response.json();
                if (active) {
                    setConsent(context);
                }
            } catch (fetchError) {
                if (active) {
                    setError(
                        `Could not reach the Estuary MCP server: ${String(fetchError)}`
                    );
                }
            }
        };
        void loadConsent();
        return () => {
            active = false;
        };
    }, [adapter, adapterOrigin, state]);

    // Return the browser to the adapter. This is the only exit from this page,
    // for approval and denial alike: the adapter is holding a parked
    // authorization request that must be resolved either way, or the MCP client
    // waits on its loopback listener until it times out.
    const returnToAdapter = useCallback(
        (params: Record<string, string>) => {
            const url = new URL('/oauth/dashboard-callback', adapterOrigin!);
            url.searchParams.set('state', state!);

            Object.entries(params).forEach(([key, value]) =>
                url.searchParams.set(key, value)
            );

            window.location.replace(url.toString());
        },
        [adapterOrigin, state]
    );

    const approve = useCallback(async () => {
        setSubmitting(true);
        setError(null);

        const result = await createRefreshToken({
            multiUse: true,
            validFor: MCP_TOKEN_VALIDITY,
            // Surfaced in the user's token list, so it must say what this token
            // is for and which client caused it.
            detail: consent?.client_name
                ? `Estuary MCP — ${consent.client_name}`
                : 'Estuary MCP',
        });

        if (result.error || !result.data?.createRefreshToken) {
            setSubmitting(false);
            setError(
                result.error?.message ??
                    `Could not issue a credential for this application.`
            );

            return;
        }

        const { id, secret } = result.data.createRefreshToken;

        // Encode the token for the MCP server to use directly as an Estuary
        // bearer credential, using the same format as the CLI.
        const handoff = Buffer.from(JSON.stringify({ id, secret })).toString(
            'base64'
        );

        returnToAdapter({ handoff });
    }, [consent, createRefreshToken, returnToAdapter]);

    const deny = useCallback(
        () => returnToAdapter({ error: 'access_denied' }),
        [returnToAdapter]
    );

    return (
        <>
            <Toolbar
                sx={{
                    alignItems: 'center',
                    display: 'flex',
                    justifyContent: 'space-between',
                }}
            />

            <Box style={{ marginBottom: 2, padding: 2 }}>
                {error ? <Alert severity="error">{error}</Alert> : null}

                {!error && !consent ? (
                    <Typography>
                        {`Checking the authorization request...`}
                    </Typography>
                ) : null}

                {!error && consent ? (
                    <Card sx={{ maxWidth: 640 }}>
                        <CardContent>
                            <Stack spacing={2}>
                                <Typography variant="h6">
                                    {`Connect ${consent.client_name} to Estuary?`}
                                </Typography>

                                {/* The host is the part of a client's identity
                                    that cannot be forged, so it is shown as
                                    prominently as the name it chose. */}
                                <Alert severity="info">
                                    {`${consent.client_name} identifies itself using a client-metadata document served by ${consent.client_host}. Only continue if you recognize that address.`}
                                </Alert>

                                <Typography>
                                    {`Approving lets this application read and change your Estuary catalog with the same access you have. You can revoke it at any time from Admin -> CLI & API. After two days without use, you will need to connect again.`}
                                </Typography>

                                <Stack direction="row" spacing={2}>
                                    <Button
                                        variant="contained"
                                        disabled={submitting}
                                        onClick={approve}
                                    >
                                        {`Approve`}
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        disabled={submitting}
                                        onClick={deny}
                                    >
                                        Cancel
                                    </Button>
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>
                ) : null}
            </Box>
        </>
    );
};

// Reduce `adapter` to its origin, or null when it is not one this deployment
// trusts. Compared as an exact origin string: a `startsWith` check would accept
// `https://mcp.estuary.dev.evil.test`, which is the classic way this goes wrong.
function validateAdapterOrigin(adapter: string | null): string | null {
    if (!adapter) {
        return null;
    }

    const parsed = getURL(adapter);
    if (!parsed) {
        return null;
    }

    const { allowedMcpServerOrigins } = getMcpSettings();

    return allowedMcpServerOrigins.includes(parsed.origin)
        ? parsed.origin
        : null;
}
