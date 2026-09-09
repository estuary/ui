import type { ReactNode } from 'react';

import { isValidElement, useMemo } from 'react';

import { Box, Link, Stack, Typography, useTheme } from '@mui/material';

import Markdown from 'markdown-to-jsx';

import SingleLineCode from 'src/components/content/SingleLineCode';
import TechnicalEmphasis from 'src/components/derivation/Create/TechnicalEmphasis';

function interpolate(
    template: string,
    variables: Record<string, string>
): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] ?? '');
}

function extractText(children: ReactNode): string {
    if (typeof children === 'string') return children;
    if (Array.isArray(children)) return children.map(extractText).join('');
    if (isValidElement<{ children?: ReactNode }>(children)) {
        return extractText(children.props.children);
    }
    return '';
}

interface MarkdownInstructionsProps {
    markdown: string;
    variables: Record<string, string>;
}

export function MarkdownInstructions({
    markdown,
    variables,
}: MarkdownInstructionsProps) {
    const theme = useTheme();

    const content = useMemo(
        () => interpolate(markdown, variables),
        [markdown, variables]
    );
    const markdownOptions = useMemo(
        () => ({
            disableParsingRawHTML: true,
            overrides: {
                h1: {
                    component: Typography,
                    props: {
                        variant: 'h6',
                        fontSize: 18,
                        fontWeight: 700,
                    },
                },
                h2: {
                    component: Typography,
                    props: {
                        variant: 'subtitle2',
                        fontWeight: 700,
                    },
                },
                code: {
                    component: TechnicalEmphasis,
                    props: {
                        enableBackground: true,
                        sx: { px: '4px', py: '1px', borderRadius: 2 },
                    },
                },
                pre: {
                    component: ({ children }: { children: ReactNode }) => {
                        const text = extractText(children);

                        if (text.includes('\n')) {
                            return (
                                <Box
                                    component="pre"
                                    sx={{
                                        p: 2,
                                        borderRadius: 2,
                                        bgcolor:
                                            theme.palette.background.code,
                                        overflow: 'auto',
                                        fontFamily: 'monospace',
                                    }}
                                >
                                    {text}
                                </Box>
                            );
                        }

                        return <SingleLineCode value={text} sx={{ my: 2 }} />;
                    },
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
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {children}
                        </Link>
                    ),
                },
                blockquote: {
                    component: ({ children }: { children: ReactNode }) => (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                mx: 0,
                                my: 2,
                                borderLeft: '4px solid',
                                borderColor: 'divider',
                                pl: 2,
                            }}
                        >
                            {extractText(children)}
                        </Typography>
                    ),
                },
            },
        }),
        [theme.palette.background.code]
    );

    return (
        <Stack spacing={2}>
            <Markdown options={markdownOptions}>{content}</Markdown>
        </Stack>
    );
}
