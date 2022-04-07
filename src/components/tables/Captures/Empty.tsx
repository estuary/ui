import { Box, Typography } from '@mui/material';
import ExternalLink from 'components/shared/ExternalLink';
import { FormattedMessage, useIntl } from 'react-intl';

function Empty() {
    const intl = useIntl();

    return (
        <Box
            sx={{
                alignItems: 'center',
                display: 'flex',
                height: 250,
                justifyContent: 'center',
            }}
        >
            <Box
                sx={{
                    height: 150,
                    padding: 2,
                    textAlign: 'center',
                    width: '90%',
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

export default Empty;
