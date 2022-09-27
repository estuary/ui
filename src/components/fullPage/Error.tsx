import { Backdrop, Box, List, ListItem } from '@mui/material';
import AlertBox from 'components/shared/AlertBox';
import { FormattedMessage } from 'react-intl';
import { BaseError } from 'types';

interface Props {
    errors: BaseError[];
}
function FullPageError({ errors }: Props) {
    return (
        <Backdrop
            sx={{ color: 'error', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={true}
        >
            <Box sx={{ width: '100%' }}>
                <AlertBox
                    severity="error"
                    title={<FormattedMessage id="fullpage.error" />}
                >
                    {errors.length > 0 ? (
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
                    ) : null}
                </AlertBox>
            </Box>
        </Backdrop>
    );
}

export default FullPageError;
