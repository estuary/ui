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
    return (
        <Box sx={{ width: '100%' }}>
            <Alert severity="error">
                <AlertTitle>
                    <FormattedMessage id="captureCreation.config.testing.failed" />
                </AlertTitle>
                <Typography variant="subtitle1">{props.title}</Typography>
                {props.errors.length > 0 && (
                    <List dense>
                        {props.errors.map((error: string, index: number) => {
                            return (
                                <ListItem key={index + error}>{error}</ListItem>
                            );
                        })}
                    </List>
                )}
            </Alert>
        </Box>
    );
}

export default NewCaptureError;
