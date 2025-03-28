import { Button } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import { useEditorStore_isSaving } from 'src/components/editor/Store/hooks';
import { useMutateDraftSpec } from 'src/components/shared/Entity/MutateDraftSpecContext';
import { entityHeaderButtonSx } from 'src/context/Theme';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';
import useGenerateCatalog from 'src/components/materialization/useGenerateCatalog';

interface Props {
    disabled: boolean;
}

function MaterializeGenerateButton({ disabled }: Props) {
    const generateCatalog = useGenerateCatalog();
    const isSaving = useEditorStore_isSaving();
    const formActive = useFormStateStore_isActive();
    const mutateDraftSpecs = useMutateDraftSpec();

    return (
        <Button
            onClick={async () => {
                await generateCatalog(mutateDraftSpecs);
            }}
            disabled={disabled || isSaving || formActive}
            sx={entityHeaderButtonSx}
        >
            <FormattedMessage id="cta.generateCatalog.materialization" />
        </Button>
    );
}

export default MaterializeGenerateButton;
