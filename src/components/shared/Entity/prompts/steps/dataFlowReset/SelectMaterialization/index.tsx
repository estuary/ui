import { Box } from '@mui/material';


import { useEditorStore_queryResponse_draftSpecs } from 'src/components/editor/Store/hooks';
import Error from 'src/components/shared/Error';
import { useLiveSpecsExt_related } from 'src/hooks/useLiveSpecsExt';
import Selector from 'src/components/shared/Entity/prompts/steps/dataFlowReset/SelectMaterialization/Selector';

function SelectMaterialization() {
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();

    // TODO (data flow backfill)
    // Go ahead and work this into the hydration of the store... I think
    const { related, error, isValidating } = useLiveSpecsExt_related(
        draftSpecs[0].catalog_name
    );

    if (error) {
        return (
            <Box style={{ maxWidth: 'fit-content' }}>
                <Error error={error} condensed />
            </Box>
        );
    }

    return <Selector keys={related} value={null} loading={isValidating} />;
}

export default SelectMaterialization;
