import { Collapse, Divider, IconButton, Paper, useTheme } from '@mui/material';
import KeyValueList, { KeyValue } from 'components/shared/KeyValueList';
import { NavArrowDown } from 'iconoir-react';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { isProduction } from 'utils/env-utils';
import { hasLength } from 'utils/misc-utils';
import { ErrorDetails } from './types';

interface Props {
    error?: ErrorDetails;
}

function Details({ error }: Props) {
    const intl = useIntl();
    const theme = useTheme();

    const [expanded, setExpanded] = useState(false);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    if (!isProduction) {
        return null;
    }

    const details: KeyValue[] = [];
    if (error) {
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
    }

    if (!hasLength(details)) {
        return null;
    }

    return (
        <>
            <Divider />
            <IconButton
                onClick={handleExpandClick}
                aria-expanded={expanded}
                aria-label={intl.formatMessage({
                    id: expanded ? 'aria.closeExpand' : 'aria.openExpand',
                })}
                sx={{
                    marginRight: 0,
                    transform: `rotate(${expanded ? '180' : '0'}deg)`,
                    transition: 'all 250ms ease-in-out',
                }}
            >
                <NavArrowDown
                    style={{
                        color: theme.palette.text.primary,
                    }}
                />
            </IconButton>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <Paper
                    variant="outlined"
                    sx={{
                        width: '100%',
                    }}
                    square
                >
                    <KeyValueList data={details} />
                </Paper>
            </Collapse>
        </>
    );
}

export default Details;
