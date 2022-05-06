import { Divider, Paper } from '@mui/material';
import RelativeAppBar from 'components/shared/RelativeAppBar';
import { ReactNode } from 'react';

interface Props {
    header: ReactNode;
    children: ReactNode;
}

function WrapperWithHeader({ header, children }: Props) {
    return (
        <Paper sx={{ width: '100%', mb: 2 }} variant="outlined">
            <RelativeAppBar>{header}</RelativeAppBar>

            <Divider />
            {children}
        </Paper>
    );
}

export default WrapperWithHeader;
