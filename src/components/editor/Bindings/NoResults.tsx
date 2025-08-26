import { Box } from '@mui/material';

import { useIntl } from 'react-intl';

function NoResults() {
    const intl = useIntl();

    return (
        <Box
            sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignSelf: 'center',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {intl.formatMessage({
                id: 'entityCreate.bindingsConfig.noResults',
            })}
        </Box>
    );
}

export default NoResults;
