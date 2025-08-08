import { Button } from '@mui/material';

import { useIntl } from 'react-intl';

import { useEditorStore_isSaving } from 'src/components/editor/Store/hooks';
import useGenerateCatalog from 'src/components/materialization/useGenerateCatalog';
import { useMutateDraftSpec } from 'src/components/shared/Entity/MutateDraftSpecContext';
import { entityHeaderButtonSx } from 'src/context/Theme';
import {
    useFormStateStore_isActive,
    useFormStateStore_updateStatus,
} from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';

interface Props {
    disabled: boolean;
}

function MaterializeGenerateButton({ disabled }: Props) {
    const intl = useIntl();

    const updateStatus = useFormStateStore_updateStatus();
    const generateCatalog = useGenerateCatalog();
    const isSaving = useEditorStore_isSaving();
    const formActive = useFormStateStore_isActive();
    const mutateDraftSpecs = useMutateDraftSpec();

    return (
        <Button
            onClick={() => {
                updateStatus(FormStatus.GENERATING);
                void generateCatalog(mutateDraftSpecs);
            }}
            disabled={disabled || isSaving || formActive}
            sx={entityHeaderButtonSx}
        >
            {intl.formatMessage({
                id: 'cta.generateCatalog.materialization',
            })}
        </Button>
    );
}

export default MaterializeGenerateButton;
