import type { TypographyProps } from '@mui/material';

import { Typography } from '@mui/material';

import { breakAtSlashes } from 'src/utils/path-utils';

interface CatalogPathProps extends Omit<TypographyProps, 'children'> {
    path: string;
}

/**
 * A catalog name or prefix, set in monospace and folded only at its separators.
 *
 * A path that does not fit stays on one line until it has to wrap, then breaks
 * after a `/` rather than mid-name. A single segment wider than the container is
 * truncated with an ellipsis, and the segment after it starts on the next line.
 *
 * Everything `Typography` accepts passes through, so callers set their own
 * variant, color, and flex behaviour.
 */
export function CatalogPath({ path, sx, ...props }: CatalogPathProps) {
    return (
        <Typography
            sx={[
                { fontFamily: 'monospace', minWidth: 0 },
                ...(Array.isArray(sx) ? sx : [sx ?? {}]),
            ]}
            {...props}
        >
            {breakAtSlashes(path)}
        </Typography>
    );
}
