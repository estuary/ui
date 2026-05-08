import { styled } from '@mui/material';

export const PrimarySpan = styled('span')(({ theme }) => ({
    color: theme.palette.primary.main,
    fontWeight: 700,
}));
