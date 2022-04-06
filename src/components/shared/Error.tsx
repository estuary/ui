import { ExpandMore } from '@mui/icons-material';
import {
    Alert,
    AlertTitle,
    Box,
    Collapse,
    Divider,
    IconButton,
    List,
    ListItem,
    Paper,
    Typography,
} from '@mui/material';
import { PostgrestError } from '@supabase/postgrest-js';
import React from 'react';
import { FormattedMessage } from 'react-intl';

type ErrorProps = {
    error: PostgrestError;
    hideTitle?: boolean;
};

function Error(props: ErrorProps) {
    const { error, hideTitle } = props;

    const [expanded, setExpanded] = React.useState(false);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Alert severity="error" icon={!hideTitle}>
                {!hideTitle ? (
                    <AlertTitle>
                        <FormattedMessage id="error.title" />
                    </AlertTitle>
                ) : null}

                <FormattedMessage id="error.message" tagName={Box} />

                <Box>
                    <FormattedMessage id="error.messageLabel" tagName="b" />{' '}
                    {error.message}
                </Box>

                <Divider />
                <IconButton
                    onClick={handleExpandClick}
                    aria-expanded={expanded}
                    aria-label="show more"
                    sx={{
                        marginRight: 0,
                        transform: `rotate(${expanded ? '180' : '0'}deg)`,
                        transition: 'all 250ms ease-in-out',
                    }}
                >
                    <ExpandMore />
                </IconButton>
                <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <Paper variant="outlined" square>
                        <List dense>
                            <ListItem>
                                <Typography>
                                    <FormattedMessage id="error.codeLabel" />
                                </Typography>
                                {error.code}
                            </ListItem>
                            <ListItem>
                                <Typography>
                                    <FormattedMessage id="error.detailsLabel" />
                                </Typography>
                                {error.details}
                            </ListItem>
                            <ListItem>
                                <Typography>
                                    <FormattedMessage id="error.hintLabel" />
                                </Typography>
                                {error.hint}
                            </ListItem>
                        </List>
                    </Paper>
                </Collapse>
            </Alert>
        </Box>
    );
}

export default Error;
