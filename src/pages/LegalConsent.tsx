import type { LegalTermsType } from 'src/gql-types/graphql';

import { useEffect, useRef, useState } from 'react';

import { Button, CircularProgress, Stack, Typography } from '@mui/material';

import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from 'urql';

import {
    LEGAL_CONSENT_CHECK,
    LEGAL_CONSENT_TERMS_QUERY,
    LEGAL_TERMS_ACCEPT,
} from 'src/api/gql/legalTerms';
import AlertBox from 'src/components/shared/AlertBox';
import ErrorDisplay from 'src/components/shared/Error';
import { LegalTermsMarkdown } from 'src/components/shared/LegalTermsMarkdown';
import TenantSelector from 'src/components/shared/TenantSelector';
import { useUpdateHelmet } from 'src/context/UpdateHelmet';
import { BASE_ERROR } from 'src/services/supabase';
import { useTenantStore } from 'src/stores/Tenant';
import { useTopBarStore } from 'src/stores/TopBar/Store';

function ConsentForm({
    type,
    tenant,
}: {
    type: LegalTermsType;
    tenant: string;
}) {
    const [{ data, fetching, error }, refetch] = useQuery({
        query: LEGAL_CONSENT_TERMS_QUERY,
        variables: { type },
        requestPolicy: 'network-only',
    });
    const [, accept] = useMutation(LEGAL_TERMS_ACCEPT);
    const submittingRef = useRef(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [decision, setDecision] = useState<'accepted' | 'declined' | null>(
        null
    );
    const terms = data?.legalTerms;
    const [consent, recheckConsent] = useQuery({
        query: LEGAL_CONSENT_CHECK,
        variables: {
            tenant,
            type,
            version: { eq: terms?.version },
        },
        pause: fetching || !!error || !terms,
        requestPolicy: 'network-only',
    });
    const alreadyAccepted = consent.data?.legalConsentCheck;
    const loading = fetching || consent.fetching;
    const loadError = error ?? consent.error;

    const reload = () => {
        setSubmitError(null);
        if (terms && !error && consent.error) {
            recheckConsent({ requestPolicy: 'network-only' });
        } else {
            // Consent is checked automatically once the terms finish loading.
            refetch({ requestPolicy: 'network-only' });
        }
    };

    if (decision) {
        return (
            <AlertBox
                short
                severity={decision === 'accepted' ? 'success' : 'info'}
            >
                {decision === 'accepted'
                    ? `The legal terms have been accepted for ${tenant}. You can return to the application that sent you here.`
                    : 'You declined the legal terms. No consent was recorded. You can return to the application that sent you here.'}
            </AlertBox>
        );
    }

    if (loading) {
        return <CircularProgress aria-label="Checking legal consent" />;
    }

    if (loadError) {
        return (
            <Stack spacing={2}>
                <AlertBox short severity="error">
                    {loadError.message}
                </AlertBox>
                <Button onClick={reload}>Retry</Button>
            </Stack>
        );
    }

    if (!terms?.text) {
        return (
            <Stack spacing={2}>
                <AlertBox short severity="warning">
                    The requested legal terms are not available.
                </AlertBox>
                <Button onClick={reload}>Reload terms</Button>
            </Stack>
        );
    }

    if (alreadyAccepted === true) {
        return (
            <AlertBox short severity="success">
                {`The current legal terms have already been accepted for ${tenant}.`}
            </AlertBox>
        );
    }

    // A paused or not-yet-started query is not evidence of missing consent.
    if (alreadyAccepted !== false) {
        return <CircularProgress aria-label="Checking legal consent" />;
    }

    const acceptTerms = async () => {
        if (submittingRef.current) return;
        submittingRef.current = true;
        setSubmitting(true);
        setSubmitError(null);
        try {
            const result = await accept({ tenant, termsId: terms.id });
            if (result.error) throw result.error;
            if (!result.data?.legalTermsAccept)
                throw new Error(
                    'Could not record your acceptance. Please try again.'
                );
            setDecision('accepted');
        } catch (cause) {
            setSubmitError(
                cause instanceof Error
                    ? cause.message
                    : 'Could not record your acceptance. Please try again.'
            );
        } finally {
            submittingRef.current = false;
            setSubmitting(false);
        }
    };

    return (
        <Stack spacing={3}>
            <Typography>
                Review these terms before accepting on behalf of{' '}
                <strong>{tenant}</strong>.
            </Typography>
            <LegalTermsMarkdown text={terms.text} />
            <ErrorDisplay
                condensed
                error={
                    submitError ? { ...BASE_ERROR, message: submitError } : null
                }
                cta={
                    <Button disabled={submitting} onClick={reload}>
                        Reload terms
                    </Button>
                }
            />
            <Stack direction="row" spacing={2}>
                <Button
                    variant="outlined"
                    disabled={submitting}
                    onClick={() => {
                        if (!submittingRef.current) setDecision('declined');
                    }}
                >
                    Decline
                </Button>
                <Button
                    variant="contained"
                    disabled={submitting}
                    onClick={() => void acceptTerms()}
                >
                    {`Accept for ${tenant}`}
                </Button>
            </Stack>
        </Stack>
    );
}

export function LegalConsent() {
    const [params] = useSearchParams();
    const { updateTitle } = useUpdateHelmet();
    const type = params.get('type')?.toUpperCase() ?? null;
    const tenant = useTenantStore((state) => state.selectedTenant);
    const setHeader = useTopBarStore((state) => state.setHeader);

    useEffect(() => {
        // Clear the previous page's shared heading; this page renders its own title.
        setHeader('');
        updateTitle('Estuary | Legal consent');
    }, [setHeader, updateTitle]);

    return (
        <Stack spacing={3} sx={{ maxWidth: 860, mx: 'auto', py: 4, px: 3 }}>
            <Typography variant="h4" component="h1">
                Legal consent
            </Typography>
            <TenantSelector />
            {type !== 'MSA' || params.getAll('type').length !== 1 ? (
                <AlertBox short severity="error">
                    This link must specify a valid legal terms type. Ask for a
                    new link.
                </AlertBox>
            ) : tenant ? (
                <ConsentForm
                    key={`${type}:${tenant}`}
                    type={type}
                    tenant={tenant}
                />
            ) : (
                <Typography>
                    Select a tenant to review and accept the terms.
                </Typography>
            )}
        </Stack>
    );
}
