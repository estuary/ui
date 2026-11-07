import type { LegalTermsType } from 'src/gql-types/graphql';

import { useEffect, useRef, useState } from 'react';

import { Button, CircularProgress, Stack, Typography } from '@mui/material';

import { useSearchParams } from 'react-router-dom';
import { SemanticBranch, useSemanticLeaf } from 'react-semantic-tree';
import { useMutation, useQuery } from 'urql';

import { LEGAL_ACCEPT, LEGAL_CHECK, LEGAL_TERMS } from 'src/api/gql/legalTerms';
import AlertBox from 'src/components/shared/AlertBox';
import ErrorDisplay from 'src/components/shared/Error';
import { LegalTermsMarkdown } from 'src/components/shared/LegalTermsMarkdown';
import { useUpdateHelmet } from 'src/context/UpdateHelmet';
import { BASE_ERROR } from 'src/services/supabase';
import { useEntitiesStore_capabilities_adminable } from 'src/stores/Entities/hooks';
import { useTopBarStore } from 'src/stores/TopBar/Store';

function ConsentForm({
    type,
    tenant,
}: {
    type: LegalTermsType;
    tenant: string;
}) {
    const [{ data, fetching, error }, refetch] = useQuery({
        query: LEGAL_TERMS,
        variables: { type },
        requestPolicy: 'network-only',
    });
    const [
        {
            data: acceptanceData,
            fetching: submitting,
            error: acceptanceError,
            operation: acceptanceOperation,
        },
        accept,
    ] = useMutation(LEGAL_ACCEPT);
    const { ref: acceptRef } = useSemanticLeaf<HTMLButtonElement>('Accept');
    const { ref: declineRef } = useSemanticLeaf<HTMLButtonElement>('Decline');
    const { ref: reloadRef } =
        useSemanticLeaf<HTMLButtonElement>('Reload terms');
    const submittingRef = useRef(false);
    const submitError = submitting
        ? null
        : (acceptanceError?.message ??
          (acceptanceOperation && !acceptanceData?.legalAccept
              ? 'Could not record your acceptance. Please try again.'
              : null));
    const [decision, setDecision] = useState<'accepted' | 'declined' | null>(
        null
    );
    const terms = data?.legalTerms;
    const [consent, recheckConsent] = useQuery({
        query: LEGAL_CHECK,
        variables: {
            tenant,
            type,
            version: { eq: terms?.version },
        },
        pause: fetching || !!error || !terms,
        requestPolicy: 'network-only',
    });
    const alreadyAccepted = consent.data?.legalCheck;
    const loading = fetching || consent.fetching;
    const loadError = error ?? consent.error;

    const reload = () => {
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
                <Button ref={reloadRef} onClick={reload}>
                    Retry
                </Button>
            </Stack>
        );
    }

    if (!terms?.text) {
        return (
            <Stack spacing={2}>
                <AlertBox short severity="warning">
                    The requested legal terms are not available.
                </AlertBox>
                <Button ref={reloadRef} onClick={reload}>
                    Reload terms
                </Button>
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
        try {
            const result = await accept({ tenant, termsId: terms.id });
            if (!result.error && result.data?.legalAccept) {
                setDecision('accepted');
            }
        } finally {
            submittingRef.current = false;
        }
    };

    return (
        <Stack spacing={3}>
            <LegalTermsMarkdown text={terms.text} />
            <ErrorDisplay
                condensed
                error={
                    submitError ? { ...BASE_ERROR, message: submitError } : null
                }
                cta={
                    <Button
                        ref={reloadRef}
                        disabled={submitting}
                        onClick={reload}
                    >
                        Reload terms
                    </Button>
                }
            />
            <Stack direction="row" spacing={2}>
                <Button
                    ref={declineRef}
                    variant="outlined"
                    disabled={submitting}
                    onClick={() => {
                        if (!submittingRef.current) setDecision('declined');
                    }}
                >
                    Decline
                </Button>
                <Button
                    ref={acceptRef}
                    variant="contained"
                    disabled={submitting}
                    onClick={() => void acceptTerms()}
                >
                    {`Accept on behalf of ${tenant}`}
                </Button>
            </Stack>
        </Stack>
    );
}

export function LegalConsent() {
    const [params] = useSearchParams();
    const { updateTitle } = useUpdateHelmet();
    const type = params.get('type')?.toUpperCase() ?? null;
    const tenantParam = params.get('tenant');
    const tenant = tenantParam ? `${tenantParam.replace(/\/$/, '')}/` : null;
    const adminPrefixes = useEntitiesStore_capabilities_adminable();
    const canAdminTenant =
        !!tenant && adminPrefixes.some((prefix) => tenant.startsWith(prefix));
    const setHeader = useTopBarStore((state) => state.setHeader);

    useEffect(() => {
        // Clear the previous page's shared heading; this page renders its own title.
        setHeader('');
        updateTitle('Estuary | Legal consent');
    }, [setHeader, updateTitle]);

    return (
        <SemanticBranch label="Legal Consent">
            <Stack spacing={3} sx={{ maxWidth: 860, mx: 'auto', py: 4, px: 3 }}>
                <Typography variant="h4" component="h1">
                    Legal consent
                </Typography>
                {!type || params.getAll('type').length !== 1 ? (
                    <AlertBox short severity="error">
                        This link must specify a valid legal terms type. Ask for
                        a new link.
                    </AlertBox>
                ) : !tenant ||
                  params.getAll('tenant').length !== 1 ||
                  !/^[^/]+\/$/.test(tenant) ? (
                    <AlertBox short severity="error">
                        This link must specify a valid tenant. Ask for a new
                        link.
                    </AlertBox>
                ) : !canAdminTenant ? (
                    <AlertBox short severity="warning">
                        You must have admin access to this tenant to review and
                        accept legal terms. Ask your administrator to accept the
                        terms.
                    </AlertBox>
                ) : (
                    <ConsentForm
                        key={`${type}:${tenant}`}
                        // Let the server validate types, including ones added after codegen.
                        type={type as LegalTermsType}
                        tenant={tenant}
                    />
                )}
            </Stack>
        </SemanticBranch>
    );
}
