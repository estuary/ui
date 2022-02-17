import {
    Alert,
    AlertTitle,
    Box,
    List,
    ListItem,
    Typography,
} from '@mui/material';
import { FormattedMessage } from 'react-intl';

type NewCaptureErrorProps = {
    title: string;
    errors: string[];
};

function NewCaptureError(props: NewCaptureErrorProps) {
    const { errors, title } = props;

    return (
        <Box sx={{ width: '100%' }}>
            <Alert severity="error">
                <AlertTitle>
                    <FormattedMessage id="captureCreation.config.testing.failed" />
                </AlertTitle>
                <Typography variant="subtitle1">{title}</Typography>
                {errors.length > 0 && (
                    <List dense>
                        {errors.map((error: string, index: number) => {
                            return (
                                <ListItem key={`${index}${error}`}>
                                    {error}
                                </ListItem>
                            );
                        })}
                    </List>
                )}
            </Alert>
        </Box>
    );
}

export default NewCaptureError;
