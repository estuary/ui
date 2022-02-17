import InputIcon from '@mui/icons-material/Input';
import {
    Box,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Typography,
} from '@mui/material';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import ExternalLink from './shared/ExternalLink';

type CatalogListProps = {
    isLoading: boolean;
    captures: any[];
};
function CatalogList(props: CatalogListProps) {
    const { captures, isLoading } = props;

    const intl = useIntl();

    if (isLoading) {
        return (
            <Box>
                <FormattedMessage id="common.loading" />
            </Box>
        );
    } else if (captures.length > 0) {
        return (
            <Box>
                <List>
                    {captures.map((element: any) => (
                        <ListItem key={element.path}>
                            <ListItemIcon>
                                <InputIcon />
                            </ListItemIcon>
                            <ListItemText primary={`${element.path}`} />
                        </ListItem>
                    ))}
                </List>
            </Box>
        );
    } else {
        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 250,
                }}
            >
                <Box
                    sx={{
                        padding: 2,
                        height: 150,
                        width: '90%',
                        textAlign: 'center',
                    }}
                >
                    <Typography gutterBottom variant="h5" component="div">
                        <FormattedMessage id="captures.main.message1" />
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        <FormattedMessage
                            id="captures.main.message2"
                            values={{
                                docLink: (
                                    <ExternalLink
                                        link={intl.formatMessage({
                                            id: 'captures.main.message2.docPath',
                                        })}
                                    >
                                        <FormattedMessage id="captures.main.message2.docLink" />
                                    </ExternalLink>
                                ),
                            }}
                        />
                    </Typography>
                </Box>
            </Box>
        );
    }
}

export default CatalogList;
