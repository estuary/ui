import {
    Alert,
    AlertTitle,
    Backdrop,
    Box,
    List,
    ListItem,
} from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { BaseError } from 'types';

interface FullPageErrorProps {
    errors: BaseError[];
}
function FullPageError({ errors }: FullPageErrorProps) {
    return (
        <Backdrop
            sx={{ color: 'error', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={true}
        >
            <Box sx={{ width: '100%' }}>
                <Alert severity="error">
                    <AlertTitle>
                        <FormattedMessage id="fullpage.error" />
                    </AlertTitle>
                    {errors.length > 0 && (
                        <List dense>
                            {errors.map((error, index: number) => {
                                return (
                                    <ListItem key={`${index}${error.detail}`}>
                                        <b>{error.title} : </b>
                                        {error.detail}
                                    </ListItem>
                                );
                            })}
                        </List>
                    )}
                </Alert>
            </Box>
        </Backdrop>
    );
}

export default FullPageError;
