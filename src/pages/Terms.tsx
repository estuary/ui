import type { ReactNode } from 'react';

import { useEffect } from 'react';

import { Box, CircularProgress, Link, Typography } from '@mui/material';

import Markdown from 'markdown-to-jsx';
import { useLocation } from 'react-router-dom';
import { useQuery } from 'urql';

import { LEGAL_TERMS_QUERY } from 'src/api/gql/legalTerms';
import Error from 'src/components/shared/Error';
import { useUpdateHelmet } from 'src/context/UpdateHelmet';

const SUBSECTION_INDENT = '2em';

const markdownOptions = {
    disableParsingRawHTML: true,
    overrides: {
        h1: {
            component: Typography,
            props: {
                variant: 'h4',
                component: 'h1',
                gutterBottom: true,
                align: 'center',
            },
        },
        h2: {
            component: Typography,
            props: {
                variant: 'h5',
                component: 'h2',
                sx: { mt: 4, mb: 1 },
            },
        },
        h3: {
            component: Typography,
            props: {
                variant: 'body1',
                component: 'h3',
                fontWeight: 700,
            },
        },
        h4: {
            component: Typography,
            props: {
                variant: 'body1',
                component: 'h4',
                fontWeight: 700,
            },
        },
        strong: {
            component: Box,
            props: { component: 'span', sx: { textDecoration: 'underline' } },
        },
        p: {
            component: Typography,
            props: { paragraph: true },
        },
        a: {
            component: ({
                href,
                children,
            }: {
                href?: string;
                children: ReactNode;
            }) => (
                <Link
                    href={href}
                    target={href?.startsWith('#') ? undefined : '_blank'}
                    rel={
                        href?.startsWith('#')
                            ? undefined
                            : 'noopener noreferrer'
                    }
                >
                    {children}
                </Link>
            ),
        },
    },
};

export function Terms() {
    const { updateTitle } = useUpdateHelmet();
    const { hash } = useLocation();

    useEffect(() => {
        updateTitle('Estuary | Master Services Agreement');
    }, [updateTitle]);

    const [{ data, fetching, error }] = useQuery({
        query: LEGAL_TERMS_QUERY,
        variables: { type: 'MSA' },
    });

    const text = data?.legalTerms?.text;

    useEffect(() => {
        if (fetching || error || !text || !hash) return;

        let id: string;
        try {
            id = decodeURIComponent(hash.slice(1));
        } catch {
            return;
        }

        // The browser's initial fragment scroll happens before the terms load.
        document.getElementById(id)?.scrollIntoView();
    }, [text, fetching, error, hash]);

    return (
        <Box
            sx={{
                'maxWidth': 860,
                'mx': 'auto',
                'px': 3,
                'py': 6,
                // Subsection titles run in to the start of the paragraph that
                // follows them: the title floats left at body text size and
                // indents that paragraph's first line, one step per level.
                '& h3, & h4': {
                    float: 'left',
                    clear: 'left',
                    m: 0,
                    mr: '0.4em',
                },
                '& h3': { ml: SUBSECTION_INDENT },
                // Nested items indent as a whole block, aligned with their title.
                '& h4, & h4 + p': { ml: `calc(2 * ${SUBSECTION_INDENT})` },
                '& h4 + p': { mb: 1 },
                '& table': { borderCollapse: 'collapse', mb: 2 },
                '& th, & td': {
                    border: 1,
                    borderColor: 'divider',
                    px: 1.5,
                    py: 1,
                    textAlign: 'left',
                },
            }}
        >
            {fetching ? (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Error error={error} condensed />
            ) : text ? (
                <Markdown options={markdownOptions}>{text}</Markdown>
            ) : (
                <Typography>The terms are not available.</Typography>
            )}
        </Box>
    );
}
