import { useCallback, useEffect, useRef, useState } from 'react';

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

import { authenticatedRoutes } from 'src/app/routes';
import { useUserStore } from 'src/context/User/useUserContextStore';
import usePageTitle from 'src/hooks/usePageTitle';
import { getOAuthSettings } from 'src/utils/env-utils';
import { getURL } from 'src/utils/misc-utils';

interface ConsentContext {
    client_name: string;
    client_host: string | null;
    client_id: string;
    resource: string;
}

export const McpAuthReq = () => {
    usePageTitle({ header: authenticatedRoutes.mcpAuth.title });

    const [searchParams] = useSearchParams();

    const issuer = searchParams.get('issuer');
    const request = searchParams.get('request');
    const accessToken = useUserStore((store) => store.session?.access_token);
    const issuerOrigin = validateIssuerOrigin(issuer);
    const requestKey = JSON.stringify([issuerOrigin, request, accessToken]);

    const [loadedConsent, setLoadedConsent] = useState<{
        key: string;
        context: ConsentContext;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const submittingRef = useRef(false);
    const consent =
        loadedConsent?.key === requestKey ? loadedConsent.context : null;

    useEffect(() => {
        setLoadedConsent(null);
        setError(null);
        if (!issuer || !request) {
            setError('This authorization link is missing required parameters.');
            return;
        }
        if (!issuerOrigin) {
            setError(
                'This authorization link does not use a recognized Estuary authorization server.'
            );
            return;
        }
        if (!accessToken) {
            setError('Sign in to authorize this application.');
            return;
        }

        const controller = new AbortController();
        const url = new URL('/oauth/consent-context', issuerOrigin);
        url.searchParams.set('request', request);
        const loadConsent = async () => {
            try {
                const response = await fetch(url.toString(), {
                    headers: { Authorization: `Bearer ${accessToken}` },
                    credentials: 'omit',
                    redirect: 'error',
                    signal: controller.signal,
                });
                if (!response.ok) {
                    throw new Error(
                        response.status === 401 || response.status === 403
                            ? 'An unrestricted Estuary user session is required. Sign in again to continue.'
                            : 'This authorization request is unknown or has expired. Start the connection again from your MCP client.'
                    );
                }
                const context: ConsentContext = await response.json();
                if (
                    typeof context.client_id !== 'string' ||
                    typeof context.client_name !== 'string' ||
                    (context.client_host !== null &&
                        typeof context.client_host !== 'string') ||
                    typeof context.resource !== 'string'
                ) {
                    throw new Error(
                        'The authorization server returned an invalid consent request.'
                    );
                }
                if (!controller.signal.aborted) {
                    setLoadedConsent({ key: requestKey, context });
                }
            } catch (fetchError) {
                if (!controller.signal.aborted) {
                    setError(
                        fetchError instanceof Error
                            ? fetchError.message
                            : 'Could not load the authorization request.'
                    );
                }
            }
        };
        void loadConsent();
        return () => controller.abort();
    }, [issuer, issuerOrigin, request, accessToken, requestKey]);

    const submitConsent = useCallback(
        async (approve: boolean) => {
            if (
                !consent ||
                !issuerOrigin ||
                !request ||
                !accessToken ||
                submittingRef.current
            ) {
                return;
            }
            submittingRef.current = true;
            setSubmitting(true);
            setError(null);
            try {
                const response = await fetch(
                    new URL('/oauth/consent', issuerOrigin).toString(),
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                        },
                        credentials: 'omit',
                        redirect: 'error',
                        body: JSON.stringify({ request, approve }),
                    }
                );
                if (!response.ok) {
                    throw new Error(
                        response.status === 401 || response.status === 403
                            ? 'An unrestricted Estuary user session is required. Sign in again to continue.'
                            : 'Could not complete authorization. Start the connection again from your MCP client.'
                    );
                }
                const result: { redirect_uri: string } = await response.json();
                const redirect =
                    typeof result.redirect_uri === 'string'
                        ? getURL(result.redirect_uri)
                        : null;
                if (
                    !redirect ||
                    !['http:', 'https:'].includes(redirect.protocol)
                ) {
                    throw new Error(
                        'The authorization server returned an invalid redirect. Start the connection again from your MCP client.'
                    );
                }
                window.location.replace(result.redirect_uri);
            } catch (submitError) {
                setError(
                    submitError instanceof Error
                        ? submitError.message
                        : 'Could not complete authorization.'
                );
                setSubmitting(false);
                submittingRef.current = false;
            }
        },
        [accessToken, consent, issuerOrigin, request]
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

                {consent ? (
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
                                    {consent.client_host
                                        ? `${consent.client_name} identifies itself using a client-metadata document served by ${consent.client_host}. Only continue if you recognize that address.`
                                        : `Registered client: ${consent.client_id}. Only continue if you recognize this application.`}
                                </Alert>

                                <Typography>
                                    This application can act with all of your
                                    existing Estuary permissions, including
                                    reading data, changing resources,
                                    administering grants, and creating sandboxes
                                    where permitted.
                                </Typography>
                                <Typography>{`Resource: ${consent.resource}`}</Typography>
                                <Typography>
                                    This authorization expires after 90 days.
                                    Connecting again will require your approval.
                                </Typography>

                                <Stack direction="row" spacing={2}>
                                    <Button
                                        variant="contained"
                                        disabled={submitting}
                                        onClick={() => void submitConsent(true)}
                                    >
                                        {`Approve`}
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        disabled={submitting}
                                        onClick={() =>
                                            void submitConsent(false)
                                        }
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

// Validate the entire issuer before sending it a session bearer. Never trust
// a prefix match or silently discard credentials, paths, queries, or fragments.
function validateIssuerOrigin(issuer: string | null): string | null {
    if (!issuer) return null;
    const parsed = getURL(issuer);
    if (
        !parsed ||
        parsed.username ||
        parsed.password ||
        parsed.pathname !== '/' ||
        parsed.search ||
        parsed.hash ||
        !(
            parsed.protocol === 'https:' ||
            (parsed.protocol === 'http:' &&
                ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname))
        )
    ) {
        return null;
    }
    return getOAuthSettings().allowedIssuerOrigins.includes(parsed.origin)
        ? parsed.origin
        : null;
}
