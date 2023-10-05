import { Box, Stack, Typography } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import NotDateTime from './NotDateTime';

interface Props {
    collectionName: string;
}

function Filters({ collectionName }: Props) {
    const intl = useIntl();

    return (
        <Box sx={{ mt: 3 }}>
            <Stack>
                <Stack spacing={1} sx={{ mb: 2 }}>
                    <Stack direction="row">
                        <Typography variant="h6">
                            <FormattedMessage id="notBeforeNotAfter.header" />
                        </Typography>
                    </Stack>

                    <Typography>
                        <FormattedMessage id="notBeforeNotAfter.message" />
                    </Typography>
                </Stack>

                <Stack spacing={2}>
                    <NotDateTime
                        collectionName={collectionName}
                        description={intl.formatMessage({
                            id: 'notBefore.input.description',
                        })}
                        label={intl.formatMessage({
                            id: 'notBefore.input.label',
                        })}
                        setting="notBefore"
                    />
                    <NotDateTime
                        collectionName={collectionName}
                        description={intl.formatMessage({
                            id: 'notAfter.input.description',
                        })}
                        label={intl.formatMessage({
                            id: 'notAfter.input.label',
                        })}
                        setting="notAfter"
                    />
                </Stack>
            </Stack>
        </Box>
    );
}

export default Filters;
