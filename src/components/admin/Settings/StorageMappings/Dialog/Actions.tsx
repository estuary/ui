import type { ButtonProps } from '@mui/material';

import { Button, DialogActions } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import SaveButton from 'src/components/admin/Settings/StorageMappings/Dialog/SaveButton';
import { useStorageMappingStore } from 'src/components/admin/Settings/StorageMappings/Store/create';
import SafeLoadingButton from 'src/components/SafeLoadingButton';

interface Props {
    closeDialog: ButtonProps['onClick'];
}

function StorageMappingActions({ closeDialog }: Props) {
    const logToken = useStorageMappingStore((state) => state.logToken);
    const saving = useStorageMappingStore((state) => state.saving);

    return (
        <DialogActions>
            {logToken ? (
                <SafeLoadingButton
                    disabled={saving}
                    loading={saving}
                    onClick={closeDialog}
                    size="small"
                    variant="contained"
                >
                    <FormattedMessage id="cta.close" />
                </SafeLoadingButton>
            ) : (
                <>
                    <Button
                        disabled={saving}
                        variant="outlined"
                        size="small"
                        onClick={closeDialog}
                    >
                        <FormattedMessage id="cta.cancel" />
                    </Button>

                    <SaveButton />
                </>
            )}
        </DialogActions>
    );
}

export default StorageMappingActions;
