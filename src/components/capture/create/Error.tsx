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
                    <FormattedMessage id={title} />
                </AlertTitle>
                {errors.length > 0 && (
                    <List dense>
                        {errors.map((error: any, index: number) => {
                            return (
                                <ListItem key={`ErrorMessage_${index}`}>
                                    <Typography
                                        sx={{
                                            fontWeight: 'bold',
                                            textTransform: 'capitalize',
                                        }}
                                    >
                                        {error.title}
                                    </Typography>
                                    : {error.detail}
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
