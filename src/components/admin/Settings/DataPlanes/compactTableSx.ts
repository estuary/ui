// Set containerType to 'inline-size' on the table container for stacked rows.
export function compactTableSx(stackBelow: number) {
    return {
        '& th': {
            bgcolor: 'action.hover',
            color: 'text.secondary',
            typography: 'caption',
            fontWeight: 'fontWeightMedium',
        },
        '& :is(th, td)': { px: 1.5 },
        '& tr:last-child td': { borderBottom: 0 },
        [`@container (max-width: ${stackBelow}px)`]: {
            '& thead': {
                position: 'absolute',
                clipPath: 'inset(50%)',
                width: 1,
                height: 1,
                overflow: 'hidden',
            },
            '& tbody, & td': { display: 'block' },
            '& td': { borderBottom: 0, p: 0 },
            '& tbody tr': {
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) auto',
                alignItems: 'center',
                gap: 0.5,
                px: 1.5,
                py: 1,
                borderBottom: 1,
                borderColor: 'divider',
            },
            '& tbody tr:last-child': { borderBottom: 0 },
        },
    };
}
