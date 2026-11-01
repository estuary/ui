import type { LegalTermsType } from 'src/gql-types/graphql';

import { useEffect, useRef, useState } from 'react';

import {
    Box,
    Button,
    CircularProgress,
    Stack,
    Typography,
} from '@mui/material';

import Markdown from 'markdown-to-jsx';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from 'urql';

import { LEGAL_TERMS_ACCEPT, LEGAL_TERMS_QUERY } from 'src/api/gql/legalTerms';
import AlertBox from 'src/components/shared/AlertBox';
import { useUpdateHelmet } from 'src/context/UpdateHelmet';

function ConsentForm({
    type,
    tenant,
}: {
    type: LegalTermsType;
    tenant: string;
}) {
    const [{ data, fetching, error }, refetch] = useQuery({
        query: LEGAL_TERMS_QUERY,
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

    const acceptTerms = async () => {
        if (!terms || fetching || error || submittingRef.current || decision)
            return;
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

    return (
        <Stack spacing={3}>
            <Typography>
                Review these terms before accepting on behalf of{' '}
                <strong>{tenant}</strong>.
            </Typography>
            {fetching ? (
                <CircularProgress aria-label="Loading legal terms" />
            ) : error ? (
                <AlertBox short severity="error">
                    {error.message}
                </AlertBox>
            ) : terms?.text ? (
                <Box
                    component="article"
                    aria-label="Legal terms"
                    sx={{
                        'overflowWrap': 'anywhere',
                        '& table': { width: '100%' },
                    }}
                >
                    <Markdown options={{ disableParsingRawHTML: true }}>
                        {terms.text}
                    </Markdown>
                </Box>
            ) : (
                <AlertBox short severity="warning">
                    The requested legal terms are not available.
                </AlertBox>
            )}
            {submitError ? (
                <AlertBox short severity="error">
                    {submitError}
                </AlertBox>
            ) : null}
            {error || submitError || (!fetching && !terms?.text) ? (
                <Button
                    disabled={submitting || fetching}
                    onClick={() => {
                        setSubmitError(null);
                        refetch({ requestPolicy: 'network-only' });
                    }}
                >
                    Reload terms
                </Button>
            ) : null}
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
                    disabled={submitting || fetching || !!error || !terms?.text}
                    onClick={() => void acceptTerms()}
                >
                    {submitting ? 'Accepting…' : 'Accept'}
                </Button>
            </Stack>
        </Stack>
    );
}

export function LegalConsent() {
    const [params] = useSearchParams();
    const { updateTitle } = useUpdateHelmet();
    const type = params.get('type');
    const tenant = params.get('tenant')?.trim().replace(/\/$/, '');
    const validType = type === 'MSA' || type === 'SANDBOX_CONSENT';
    const validTenant = !!tenant && !/[\s/]/u.test(tenant);

    useEffect(() => {
        updateTitle('Estuary | Legal consent');
    }, [updateTitle]);

    return (
        <Stack spacing={3} sx={{ maxWidth: 860, mx: 'auto', py: 4, px: 3 }}>
            <Typography variant="h4" component="h1">
                Legal consent
            </Typography>
            {validType &&
            validTenant &&
            params.getAll('type').length === 1 &&
            params.getAll('tenant').length === 1 ? (
                <ConsentForm
                    key={`${type}:${tenant}`}
                    type={type}
                    tenant={`${tenant}/`}
                />
            ) : (
                <AlertBox short severity="error">
                    This link must specify a valid legal terms type (MSA or
                    SANDBOX_CONSENT) and tenant. Ask for a new link.
                </AlertBox>
            )}
        </Stack>
    );
}
