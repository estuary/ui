import { FormattedMessage } from 'react-intl';

import { Stack, Typography } from '@mui/material';

import ExternalLink from 'components/shared/ExternalLink';
import StorageMappingsTable from 'components/tables/StorageMappings';

const docsUrl = 'https://docs.estuary.dev/concepts/storage-mappings/';

// Basically a wrapper around the table because it felt right. We might want
//  to use the table elsewhere (for a read only mode maybe). Also, keepings the
//  header and the table stuff apart felt good and did not want to make a new
//  header file just for this work.
function StorageMappings() {
    return (
        <StorageMappingsTable
            header={
                <Stack direction="column" spacing={2} sx={{ m: 2, ml: 0 }}>
                    <Stack direction="row" spacing={1}>
                        <Typography
                            component="span"
                            variant="h6"
                            sx={{
                                alignItems: 'center',
                            }}
                        >
                            <FormattedMessage id="storageMappings.header" />
                        </Typography>
                        <ExternalLink link={docsUrl}>
                            <FormattedMessage id="terms.documentation" />
                        </ExternalLink>
                    </Stack>
                    <Typography>
                        <FormattedMessage id="storageMappings.message" />
                    </Typography>
                </Stack>
            }
        />
    );
}

export default StorageMappings;
