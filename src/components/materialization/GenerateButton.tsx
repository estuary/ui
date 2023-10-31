import { Button } from '@mui/material';

import { useEditorStore_isSaving } from 'components/editor/Store/hooks';
import { buttonSx } from 'components/shared/Entity/Header';
import { useMutateDraftSpec } from 'components/shared/Entity/MutateDraftSpecContext';
import { FormattedMessage } from 'react-intl';

import { useFormStateStore_isActive } from 'stores/FormState/hooks';

import useGenerateCatalog from './useGenerateCatalog';

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
            sx={buttonSx}
        >
            <FormattedMessage id="cta.generateCatalog.materialization" />
        </Button>
    );
}

export default MaterializeGenerateButton;
