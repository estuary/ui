import type { ReactNode } from 'react';
import type { SxProps, Theme } from '@mui/material';

import { Box } from '@mui/material';

import { diminishedTextColor } from 'src/context/Theme';

import { splitCatalogName } from 'src/components/admin/ServiceAccounts/shared';

interface CatalogNameProps {
    catalogName: string;
    // Render the leaf segment in bold; the containing prefix stays muted.
    emphasizeLeaf?: boolean;
    sx?: SxProps<Theme>;
}

// Insert word-break opportunities after path separators so long catalog names
// wrap gracefully instead of forcing horizontal scroll.
function withBreaks(text: string): ReactNode[] {
    return text.split(/(?<=[/_-])/).map((segment, index) => (
        <span key={index}>
            {segment}
            <wbr />
        </span>
    ));
}

// Renders a catalog name as a muted prefix plus an emphasized leaf, in
// monospace, matching how service account identities are shown in the design.
function CatalogName({
    catalogName,
    emphasizeLeaf = true,
    sx,
}: CatalogNameProps) {
    const { prefix, leaf } = splitCatalogName(catalogName);

    return (
        <Box
            component="span"
            sx={{
                fontFamily: 'monospace',
                overflowWrap: 'anywhere',
                wordBreak: 'keep-all',
                ...sx,
            }}
        >
            {prefix ? (
                <Box
                    component="span"
                    sx={{
                        color: (theme) =>
                            diminishedTextColor[theme.palette.mode],
                    }}
                >
                    {withBreaks(prefix)}
                </Box>
            ) : null}

            <Box
                component="span"
                sx={{
                    color: 'text.primary',
                    fontWeight: emphasizeLeaf ? 600 : 400,
                }}
            >
                {withBreaks(leaf)}
            </Box>
        </Box>
    );
}

export default CatalogName;
