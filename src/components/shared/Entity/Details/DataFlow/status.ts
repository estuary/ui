import type { Theme } from '@mui/material';
import type { StatusSummaryType } from 'src/gql-types/graphql';

export const getStatusColor = (
    theme: Theme,
    status: StatusSummaryType | null
) => {
    switch (status) {
        case 'OK':
            return theme.palette.success.main;
        case 'WARNING':
            return theme.palette.warning.main;
        case 'ERROR':
            return theme.palette.error.main;
        default:
            return theme.palette.text.disabled;
    }
};
