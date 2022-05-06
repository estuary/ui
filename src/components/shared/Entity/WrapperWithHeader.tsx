import { Divider, Paper } from '@mui/material';
import RelativeAppBar from 'components/shared/RelativeAppBar';
import { ReactNode } from 'react';

interface Props {
    header: ReactNode;
    body: ReactNode;
}

function WrapperWithHeader({ header, body }: Props) {
    return (
        <Paper sx={{ width: '100%', mb: 2 }} variant="outlined">
            <RelativeAppBar>{header}</RelativeAppBar>

            <Divider />
            {body}
        </Paper>
    );
}

export default WrapperWithHeader;
