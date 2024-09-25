import { Box, Typography } from '@mui/material';
import { useEditorStore_queryResponse_draftSpecs } from 'components/editor/Store/hooks';
import Error from 'components/shared/Error';
import { useLiveSpecsExt_related } from 'hooks/useLiveSpecsExt';
import { useIntl } from 'react-intl';
import Selector from './Selector';

function SelectMaterialization() {
    const intl = useIntl();

    const draftSpecs = useEditorStore_queryResponse_draftSpecs();

    // TODO (data flow backfill)
    // Go ahead and work this into the hydration of the store... I think
    const { related, error, isValidating } = useLiveSpecsExt_related(
        draftSpecs[0].catalog_name
    );

    return (
        <Box style={{ maxWidth: 'fit-content' }}>
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

            {error ? (
                <Error error={error} condensed />
            ) : (
                <Selector keys={related} value={null} loading={isValidating} />
            )}
        </Box>
    );
}

export default SelectMaterialization;
