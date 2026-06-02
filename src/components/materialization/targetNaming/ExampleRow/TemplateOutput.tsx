import type { ReactNode } from 'react';

import { Box } from '@mui/material';

import { PrimarySpan } from 'src/components/materialization/targetNaming/ExampleRow/shared';
import { splitAroundToken } from 'src/components/materialization/targetNaming/shared';

interface Props {
    value: string | ReactNode;
    source: string | undefined;
}

export function TemplateOutput({ value, source }: Props) {
    const split =
        typeof value === 'string' && source
            ? splitAroundToken(value, source)
            : null;

    const parts =
        split && (split.prefix || split.suffix)
            ? { ...split, tokenReplaced: source as string }
            : null;

    if (!parts) {
        if (typeof value === 'string' && source && value !== source) {
            return <PrimarySpan>{value}</PrimarySpan>;
        }

        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <>{value}</>;
    }

    return (
        <>
            <PrimarySpan>{parts.prefix.trim()}</PrimarySpan>
            <Box component="span">{parts.tokenReplaced}</Box>
            <PrimarySpan>{parts.suffix.trim()}</PrimarySpan>
        </>
    );
}
