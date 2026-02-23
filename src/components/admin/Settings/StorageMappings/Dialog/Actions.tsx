import type { ButtonProps } from '@mui/material';

import { Button, DialogActions } from '@mui/material';

import { useIntl } from 'react-intl';

import SaveButton from 'src/components/admin/Settings/StorageMappings/Dialog/SaveButton';
import { useStorageMappingStore } from 'src/components/admin/Settings/StorageMappings/Store/create';

interface Props {
    closeDialog: ButtonProps['onClick'];
}

function StorageMappingActions({ closeDialog }: Props) {
    const intl = useIntl();

    const logToken = useStorageMappingStore((state) => state.logToken);
    const saving = useStorageMappingStore((state) => state.saving);

    return (
        <DialogActions>
            {logToken ? (
                <Button
                    disabled={saving}
                    loading={saving}
                    onClick={closeDialog}
                    size="small"
                    variant="contained"
                >
                    {intl.formatMessage({ id: 'cta.close' })}
                </Button>
            ) : (
                <>
                    <Button
                        disabled={saving}
                        variant="outlined"
                        size="small"
                        onClick={closeDialog}
                    >
                        {intl.formatMessage({ id: 'cta.cancel' })}
                    </Button>

                    <SaveButton />
                </>
            )}
        </DialogActions>
    );
}

export default StorageMappingActions;
