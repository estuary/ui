import { Typography } from '@mui/material';
import Error from 'components/shared/Error';
import FullPageWrapper from 'directives/FullPageWrapper';
import { ReactElement } from 'react';

interface Props {
    error: any;
    title: ReactElement | string;
}
function FullPageError({ error, title }: Props) {
    return (
        <FullPageWrapper fullWidth={true}>
            <Typography>{title}</Typography>
            <Error error={error} />
        </FullPageWrapper>
    );
}

export default FullPageError;
