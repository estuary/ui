export const compactTableSx = {
    '& th': {
        bgcolor: 'action.hover',
        color: 'text.secondary',
        typography: 'caption',
        fontWeight: 'fontWeightMedium',
    },
    '& :is(th, td)': { px: 1.5 },
    '& tr:last-child td': { borderBottom: 0 },
};
