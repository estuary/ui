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

import { useIntl } from 'react-intl';
import { useSearchParams } from 'react-router-dom';

import { useCreateRefreshToken } from 'src/api/gql/refreshTokens';
import { authenticatedRoutes } from 'src/app/routes';
import Error from 'src/components/shared/Error';
import usePageTitle from 'src/hooks/usePageTitle';
import { logRocketConsole } from 'src/services/shared';
import { getMcpSettings } from 'src/utils/env-utils';
import { getURL } from 'src/utils/misc-utils';

// The handoff credential is a bearer token that grants everything this user can
// do, so it is minted with the shortest life that survives a browser redirect.
// It is also single-use: the adapter redeems it the instant it receives it, so a
// replayed callback URL is inert even inside those five minutes.
const HANDOFF_VALIDITY = 'PT5M';
const HANDOFF_MULTI_USE = false;

interface ConsentContext {
    client_name: string;
    client_host: string;
    client_id: string;
    client_uri: string | null;
    resource: string;
}

/**
 * Consent checkpoint for the Estuary MCP server's OAuth flow.
 *
 * An MCP client (Claude Code, Codex, ...) asked the MCP adapter to authorize it.
 * The adapter cannot log a user in and must not be trusted to decide who is
 * consenting, so it parks the request and sends the browser here. We are the
 * only participant that holds a Supabase session; our job is to prove there is a
 * real, logged-in user behind the request, show them who is asking, and — if
 * they agree — hand the adapter a short-lived credential minted as them.
 *
 * Two security properties carry this page, and both are easy to break by
 * accident:
 *
 *  1. **The `adapter` origin is allowlisted.** Everything else on this page is
 *     derived from it — the consent text we fetch, and the URL we hand a
 *     credential to. An unchecked origin here is a one-click token-exfiltration
 *     link, exactly as `orig_url` would be on {@link DataPlaneAuthReq}.
 *
 *  2. **The consent text comes from the adapter, not from our query string.** A
 *     client's name is whatever its client-metadata document claims, so we show
 *     it *next to* the host that served that document, which an attacker cannot
 *     forge without controlling its DNS and TLS. Reading these from our own URL
 *     would let a crafted link name any client it liked.
 *
 * The handoff itself is a top-level navigation, never a `postMessage`: the
 * connector-OAuth popup helper broadcasts with a wildcard target origin, which
 * would publish this credential to whatever page happens to be listening.
 */
const McpAuthReq = () => {
    usePageTitle({ header: authenticatedRoutes.mcpAuth.title });

    const intl = useIntl();
    const [searchParams] = useSearchParams();

    const adapter = searchParams.get('adapter');
    const state = searchParams.get('state');

    const [, createRefreshToken] = useCreateRefreshToken();

    const [consent, setConsent] = useState<ConsentContext | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Resolve the adapter origin once, up front: if it is not one we trust,
    // nothing else on this page may run, not even the context fetch.
    const adapterOrigin = validateAdapterOrigin(adapter);

    useEffect(() => {
        if (!adapter || !state) {
            setError(
                intl.formatMessage({ id: 'mcpAuthReq.error.missingParams' })
            );

            return;
        }

        if (!adapterOrigin) {
            logRocketConsole('mcp auth: rejected adapter origin', { adapter });
            setError(
                intl.formatMessage(
                    { id: 'mcpAuthReq.error.untrustedAdapter' },
                    { adapter }
                )
            );

            return;
        }

        const url = new URL('/oauth/consent-context', adapterOrigin);
        url.searchParams.set('state', state);

        fetch(url.toString(), { credentials: 'omit' }).then(
            async (response) => {
                if (!response.ok) {
                    setError(
                        intl.formatMessage({
                            id: 'mcpAuthReq.error.unknownRequest',
                        })
                    );

                    return;
                }

                setConsent((await response.json()) as ConsentContext);
            },
            (fetchError: Error) => {
                setError(
                    intl.formatMessage(
                        { id: 'mcpAuthReq.error.unreachableAdapter' },
                        { error: String(fetchError) }
                    )
                );
            }
        );
    }, [adapter, adapterOrigin, intl, state]);

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
            multiUse: HANDOFF_MULTI_USE,
            validFor: HANDOFF_VALIDITY,
            // Surfaced in the user's token list, so it must say what this token
            // is for and which client caused it.
            detail: `MCP authorization handoff: ${consent?.client_id ?? 'unknown client'}`,
        });

        if (result.error || !result.data?.createRefreshToken) {
            setSubmitting(false);
            setError(
                result.error?.message ??
                    intl.formatMessage({ id: 'mcpAuthReq.error.mintFailed' })
            );

            return;
        }

        const { id, secret } = result.data.createRefreshToken;

        // The same wire format the CLI's refresh tokens use: base64 of
        // `{id, secret}`. The adapter decodes it and redeems it immediately.
        const handoff = Buffer.from(JSON.stringify({ id, secret })).toString(
            'base64'
        );

        returnToAdapter({ handoff });
    }, [consent, createRefreshToken, intl, returnToAdapter]);

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
                {error ? <Error condensed error={{ message: error }} /> : null}

                {!error && !consent ? (
                    <Typography>
                        {intl.formatMessage({ id: 'mcpAuthReq.loading' })}
                    </Typography>
                ) : null}

                {!error && consent ? (
                    <Card sx={{ maxWidth: 640 }}>
                        <CardContent>
                            <Stack spacing={2}>
                                <Typography variant="h6">
                                    {intl.formatMessage(
                                        { id: 'mcpAuthReq.header' },
                                        { clientName: consent.client_name }
                                    )}
                                </Typography>

                                {/* The host is the part of a client's identity
                                    that cannot be forged, so it is shown as
                                    prominently as the name it chose. */}
                                <Alert severity="info">
                                    {intl.formatMessage(
                                        { id: 'mcpAuthReq.identity' },
                                        {
                                            clientName: consent.client_name,
                                            clientHost: consent.client_host,
                                        }
                                    )}
                                </Alert>

                                <Typography>
                                    {intl.formatMessage({
                                        id: 'mcpAuthReq.explanation',
                                    })}
                                </Typography>

                                <Stack direction="row" spacing={2}>
                                    <Button
                                        variant="contained"
                                        disabled={submitting}
                                        onClick={approve}
                                    >
                                        {intl.formatMessage({
                                            id: 'mcpAuthReq.cta.approve',
                                        })}
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        disabled={submitting}
                                        onClick={deny}
                                    >
                                        {intl.formatMessage({
                                            id: 'cta.cancel',
                                        })}
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

    const { allowedAdapterOrigins } = getMcpSettings();

    return allowedAdapterOrigins.includes(parsed.origin) ? parsed.origin : null;
}

export default McpAuthReq;
