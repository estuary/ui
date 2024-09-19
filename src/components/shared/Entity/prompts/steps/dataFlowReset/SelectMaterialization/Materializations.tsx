import { Box, LinearProgress, Typography } from '@mui/material';
import { useEditorStore_queryResponse_draftSpecs } from 'components/editor/Store/hooks';
import Error from 'components/shared/Error';
import { useLiveSpecsExt_related } from 'hooks/useLiveSpecsExt';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { hasLength } from 'utils/misc-utils';
import Selector from './Selector';

function Materializations() {
    const intl = useIntl();

    const draftSpecs = useEditorStore_queryResponse_draftSpecs();

    const { related, error, isValidating } = useLiveSpecsExt_related(
        draftSpecs[0].catalog_name
    );

    const foundData = useMemo(() => hasLength(related), [related]);

    return (
        <Box>
            <Typography>
                {intl.formatMessage(
                    {
                        id: 'resetDataFlow.materializations.header',
                    },
                    {
                        captureName: draftSpecs[0].catalog_name,
                    }
                )}
            </Typography>

            {isValidating ? <LinearProgress /> : null}

            {error ? <Error error={error} condensed /> : null}

            {!error && foundData ? (
                <Selector keys={related} value={null} />
            ) : (
                <Box>
                    {intl.formatMessage({
                        id: 'resetDataFlow.materializations.empty',
                    })}
                </Box>
            )}
        </Box>
    );
}

export default Materializations;
