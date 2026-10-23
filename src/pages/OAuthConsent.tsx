import { useEffect, useRef, useState } from 'react';

import {
    Alert,
    Box,
    Button,
    FormHelperText,
    Stack,
    Typography,
} from '@mui/material';

import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';

import { authenticatedRoutes } from 'src/app/routes';
import { useUserStore } from 'src/context/User/useUserContextStore';
import { supabaseClient } from 'src/services/supabaseClient';
import { useTopBarStore } from 'src/stores/TopBar/Store';
import { requireEstuaryApiUrl } from 'src/utils/env-utils';
import { getURL } from 'src/utils/misc-utils';

interface ConsentContext {
    client_name: string;
    request: {
        client_id: string;
    };
}

export const OAuthConsent = () => {
    const setHeader = useTopBarStore((state) => state.setHeader);
    useEffect(() => {
        // Clear the previous page's shared heading; this page renders its own title.
        setHeader('');
    }, [setHeader]);

    const [searchParams] = useSearchParams();

    const ticket = searchParams.get('request');
    const userId = useUserStore((store) => store.session?.user.id);
    // A new ticket or user gets a fresh flow; token refreshes keep the current one.
    return (
        <ConsentFlow
            key={JSON.stringify([ticket, userId])}
            ticket={ticket}
            userId={userId}
        />
    );
};

function ConsentFlow({
    ticket,
    userId,
}: {
    ticket: string | null;
    userId: string | undefined;
}) {
    // Never take the destination of a session bearer from the authorization URL.
    const apiUrl = requireEstuaryApiUrl();
    const [consent, setConsent] = useState<ConsentContext | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const requestController = useRef<AbortController | null>(null);

    useEffect(() => {
        if (!ticket) {
            setError('This authorization link is missing required parameters.');
            return;
        }
        if (!userId) {
            setError('Sign in to authorize this application.');
            return;
        }

        // Cancel loading and submission on unmount, including when the ticket or user changes.
        const controller = new AbortController();
        requestController.current = controller;
        const url = new URL('/oauth/consent-context', apiUrl);
        url.searchParams.set('request', ticket);
        const loadConsentContext = async () => {
            try {
                const response = await fetch(url.toString(), {
                    credentials: 'omit',
                    referrerPolicy: 'no-referrer',
                    redirect: 'error',
                    signal: controller.signal,
                });
                if (!response.ok) {
                    throw new Error(
                        response.status === 401 || response.status === 403
                            ? 'Unable to authorize this request.'
                            : 'This authorization request is unknown or has expired. Start the connection again from the application.'
                    );
                }
                const context: ConsentContext = await response.json();
                if (
                    typeof context.client_name !== 'string' ||
                    !context.client_name.trim() ||
                    typeof context.request?.client_id !== 'string' ||
                    getURL(context.request.client_id)?.protocol !== 'https:'
                ) {
                    throw new Error(
                        'The authorization server returned an invalid consent request.'
                    );
                }
                if (!controller.signal.aborted) {
                    setConsent(context);
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
        void loadConsentContext();
        return () => controller.abort();
    }, [apiUrl, ticket, userId]);

    const submitConsent = async (approve: boolean) => {
        const signal = requestController.current?.signal;
        if (!consent || !ticket || submitting || !signal || signal.aborted)
            return;
        setSubmitting(true);
        setError(null);
        try {
            const {
                data: { session },
                error: sessionError,
            } = await supabaseClient.auth.getSession();
            if (signal.aborted) return;
            if (sessionError) throw sessionError;
            if (!session?.access_token || session.user.id !== userId) {
                throw new Error('Sign in to authorize this application.');
            }
            const accessToken = session.access_token;
            const response = await fetch(
                new URL('/oauth/authorize', apiUrl).toString(),
                {
                    method: 'POST',
                    signal,
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    credentials: 'omit',
                    referrerPolicy: 'no-referrer',
                    redirect: 'error',
                    body: JSON.stringify({
                        request: ticket,
                        approved: approve,
                    }),
                }
            );
            if (!response.ok) {
                throw new Error(
                    response.status === 401 || response.status === 403
                        ? 'Unable to authorize this request.'
                        : 'Could not complete authorization. The request may have expired; start the connection again from the application.'
                );
            }
            const result = await response.json();
            if (
                typeof result.redirect_uri !== 'string' ||
                !result.redirect_uri
            ) {
                throw new Error(
                    'The authorization server returned an invalid callback.'
                );
            }
            if (!signal.aborted) {
                window.location.replace(result.redirect_uri);
            }
        } catch (submitError) {
            if (signal.aborted) return;
            setError(
                submitError instanceof Error
                    ? submitError.message
                    : 'Could not complete authorization.'
            );
            setSubmitting(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>{`Estuary | ${authenticatedRoutes.oauthConsent.title}`}</title>
                <meta name="referrer" content="no-referrer" />
            </Helmet>
            <Stack spacing={2} sx={{ maxWidth: 500 }}>
                <Typography component="h1" variant="h5" align="left">
                    {consent
                        ? `Connect ${consent.client_name} to Estuary?`
                        : authenticatedRoutes.oauthConsent.title}
                </Typography>
                {error ? <Alert severity="error">{error}</Alert> : null}
                {!error && !consent ? (
                    <Typography>
                        Checking the authorization request...
                    </Typography>
                ) : null}
                {consent ? (
                    <>
                        <Box>
                            <Box
                                sx={{
                                    p: 1,
                                    border: 1,
                                    borderColor: 'divider',
                                    borderRadius: 3,
                                    overflowWrap: 'anywhere',
                                }}
                            >
                                <Typography
                                    sx={{ fontFamily: 'monospace' }}
                                    aria-describedby="client-address-warning"
                                >
                                    {
                                        new URL(consent.request.client_id)
                                            .hostname
                                    }
                                </Typography>
                            </Box>
                            <FormHelperText
                                id="client-address-warning"
                                sx={{ color: 'warning.main', mx: 1 }}
                            >
                                {"Only continue if you recognize this application's address."}
                            </FormHelperText>
                        </Box>

                        <Typography>
                            This application can act with all of your existing
                            Estuary permissions, including reading data,
                            changing resources, administering grants, and
                            creating sandboxes where permitted.
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            You can revoke this connection from your Refresh
                            Token settings.
                        </Typography>
                        <Stack
                            direction="row"
                            spacing={2}
                            sx={{ justifyContent: 'flex-start', pt: 2 }}
                        >
                            <Button
                                variant="outlined"
                                disabled={submitting}
                                onClick={() => void submitConsent(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                disabled={submitting}
                                onClick={() => void submitConsent(true)}
                            >
                                Approve
                            </Button>
                        </Stack>
                    </>
                ) : null}
            </Stack>
        </>
    );
}
