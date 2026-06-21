import type { AnchorHTMLAttributes, HTMLAttributes, PropsWithChildren } from 'react';

import { Box, Divider, Link } from '@mui/material';

import Markdown from 'markdown-to-jsx';

// Renders assistant chat content as markdown, styled to sit inside the
// monospace terminal transcript. Text inherits the terminal font and color
// from the surrounding scroll area; the overrides only add structure —
// headings, emphasis, lists, tables, code blocks, and links.

type MdProps = PropsWithChildren<HTMLAttributes<HTMLElement>>;

const heading = (fontSize: number) =>
    function Heading(props: MdProps) {
        return (
            <Box
                sx={{ fontSize, fontWeight: 700, mt: 1.25, mb: 0.5 }}
                {...props}
            />
        );
    };

const inlineCodeSx = {
    px: 0.5,
    py: '1px',
    borderRadius: 0.5,
    fontSize: 12.5,
    background: 'action.hover',
};

const markdownOptions = {
    overrides: {
        h1: { component: heading(16) },
        h2: { component: heading(15) },
        h3: { component: heading(14) },
        h4: { component: heading(13) },
        h5: { component: heading(13) },
        h6: { component: heading(13) },
        p: {
            component: (props: MdProps) => (
                <Box
                    component="p"
                    sx={{ my: 0.75, overflowWrap: 'anywhere' }}
                    {...props}
                />
            ),
        },
        a: {
            component: ({
                href,
                ...props
            }: AnchorHTMLAttributes<HTMLAnchorElement>) => (
                <Link
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ color: 'info.main' }}
                    {...props}
                />
            ),
        },
        strong: {
            component: (props: MdProps) => (
                <Box component="strong" sx={{ fontWeight: 700 }} {...props} />
            ),
        },
        em: {
            component: (props: MdProps) => (
                <Box component="em" sx={{ fontStyle: 'italic' }} {...props} />
            ),
        },
        ul: {
            component: (props: MdProps) => (
                <Box
                    component="ul"
                    sx={{ my: 0.5, pl: 2.5, listStyleType: 'disc' }}
                    {...props}
                />
            ),
        },
        ol: {
            component: (props: MdProps) => (
                <Box
                    component="ol"
                    sx={{ my: 0.5, pl: 2.5, listStyleType: 'decimal' }}
                    {...props}
                />
            ),
        },
        li: {
            component: (props: MdProps) => (
                <Box
                    component="li"
                    sx={{ my: 0.25, display: 'list-item' }}
                    {...props}
                />
            ),
        },
        blockquote: {
            component: (props: MdProps) => (
                <Box
                    component="blockquote"
                    sx={{
                        my: 0.75,
                        pl: 1.5,
                        borderLeft: (theme) =>
                            `2px solid ${theme.palette.divider}`,
                        color: 'text.secondary',
                    }}
                    {...props}
                />
            ),
        },
        hr: { component: () => <Divider sx={{ my: 1 }} /> },
        code: {
            component: ({
                className,
                ...props
            }: HTMLAttributes<HTMLElement>) => (
                <Box
                    component="code"
                    className={className}
                    // Fenced blocks carry a language className and live inside
                    // <pre> (which supplies the background); only standalone
                    // inline code gets the chip treatment.
                    sx={className ? { fontSize: 12.5 } : inlineCodeSx}
                    {...props}
                />
            ),
        },
        pre: {
            component: (props: MdProps) => (
                <Box
                    component="pre"
                    sx={{
                        my: 1,
                        p: 1,
                        borderRadius: 1,
                        overflowX: 'auto',
                        whiteSpace: 'pre',
                        fontSize: 12.5,
                        lineHeight: 1.5,
                        background: 'action.hover',
                        border: (theme) => `1px solid ${theme.palette.divider}`,
                    }}
                    {...props}
                />
            ),
        },
        table: {
            component: (props: MdProps) => (
                <Box sx={{ my: 1, overflowX: 'auto' }}>
                    <Box
                        component="table"
                        sx={{ borderCollapse: 'collapse', width: 'auto' }}
                        {...props}
                    />
                </Box>
            ),
        },
        th: {
            component: (props: MdProps) => (
                <Box
                    component="th"
                    sx={{
                        border: (theme) =>
                            `1px solid ${theme.palette.divider}`,
                        px: 1,
                        py: 0.5,
                        textAlign: 'left',
                        fontWeight: 700,
                        background: 'action.hover',
                    }}
                    {...props}
                />
            ),
        },
        td: {
            component: (props: MdProps) => (
                <Box
                    component="td"
                    sx={{
                        border: (theme) =>
                            `1px solid ${theme.palette.divider}`,
                        px: 1,
                        py: 0.5,
                    }}
                    {...props}
                />
            ),
        },
    },
};

export function AssistantMarkdown({ children }: { children: string }) {
    return <Markdown options={markdownOptions}>{children}</Markdown>;
}
