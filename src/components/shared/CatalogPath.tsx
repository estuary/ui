import type { TypographyProps } from '@mui/material';

import { Typography } from '@mui/material';

interface CatalogPathProps extends Omit<TypographyProps, 'children'> {
    path: string;
}

/**
 * A catalog name or prefix, set in monospace and folded only at its separators.
 *
 * Break opportunities after each `/` let a path wrap at its separators.
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
            {path
                .split('/')
                .flatMap((segment, index, segments) =>
                    index < segments.length - 1
                        ? [segment, '/', <wbr key={index} />]
                        : [segment]
                )}
        </Typography>
    );
}
