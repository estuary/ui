import { ExpandMore } from '@mui/icons-material';
import {
    Alert,
    AlertTitle,
    Box,
    Collapse,
    Divider,
    IconButton,
    Paper,
} from '@mui/material';
import { PostgrestError } from '@supabase/postgrest-js';
import KeyValueList, { KeyValue } from 'components/shared/KeyValueList';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

export interface ErrorProps {
    error?: PostgrestError | any | null;
    hideTitle?: boolean;
}

function Error({ error, hideTitle }: ErrorProps) {
    const intl = useIntl();

    const [expanded, setExpanded] = useState(false);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    if (error) {
        const details: KeyValue[] = [];

        if (error.description) {
            details.push({
                title: intl.formatMessage({ id: 'error.descriptionLabel' }),
                val: error.description,
            });
        }

        if (error.code) {
            details.push({
                title: intl.formatMessage({ id: 'error.codeLabel' }),
                val: error.code,
            });
        }

        if (error.details) {
            details.push({
                title: intl.formatMessage({ id: 'error.detailsLabel' }),
                val: error.details,
            });
        }

        if (error.hint) {
            details.push({
                title: intl.formatMessage({ id: 'error.hintLabel' }),
                val: error.hint,
            });
        }

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
                        aria-label={intl.formatMessage({
                            id: expanded
                                ? 'aria.closeExpand'
                                : 'aria.openExpand',
                        })}
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
                            <KeyValueList data={details} />
                        </Paper>
                    </Collapse>
                </Alert>
            </Box>
        );
    } else {
        return null;
    }
}

export default Error;
