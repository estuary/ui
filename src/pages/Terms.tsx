import { useEffect } from 'react';

import { Box, CircularProgress, Typography } from '@mui/material';

import { useQuery } from 'urql';

import { LEGAL_TERMS_QUERY } from 'src/api/gql/legalTerms';
import Error from 'src/components/shared/Error';
import { LegalTermsMarkdown } from 'src/components/shared/LegalTermsMarkdown';
import { useUpdateHelmet } from 'src/context/UpdateHelmet';

export function Terms() {
    const { updateTitle } = useUpdateHelmet();

    useEffect(() => {
        updateTitle('Estuary | Master Services Agreement');
    }, [updateTitle]);

    const [{ data, fetching, error }] = useQuery({
        query: LEGAL_TERMS_QUERY,
        variables: { type: 'MSA' },
    });

    const text = data?.legalTerms?.text;

    return (
        <Box
            sx={{
                maxWidth: 860,
                mx: 'auto',
                px: 3,
                py: 6,
            }}
        >
            {fetching ? (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Error error={error} condensed />
            ) : text ? (
                <LegalTermsMarkdown text={text} />
            ) : (
                <Typography>The terms are not available.</Typography>
            )}
        </Box>
    );
}
