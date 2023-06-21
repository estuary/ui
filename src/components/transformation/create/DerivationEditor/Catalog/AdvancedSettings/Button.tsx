import { Button } from '@mui/material';
import AdvancedCatalogSettingsDialog from 'components/transformation/create/DerivationEditor/Catalog/AdvancedSettings/Dialog';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';

function AdvancedCatalogSettingsButton() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button
                variant="text"
                onClick={() => {
                    setOpen(true);
                }}
            >
                <FormattedMessage id="newTransform.editor.catalog.advancedSettings" />
            </Button>

            <AdvancedCatalogSettingsDialog open={open} setOpen={setOpen} />
        </>
    );
}

export default AdvancedCatalogSettingsButton;
