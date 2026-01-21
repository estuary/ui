import type { ButtonProps } from '@mui/material';

import {
    DialogTitle,
    IconButton,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';

import { Xmark } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';

import { useStorageMappingStore } from 'src/components/admin/Settings/StorageMappings/Store/create';

interface Props {
    closeDialog: ButtonProps['onClick'];
}

function StorageMappingTitle({ closeDialog }: Props) {
    const theme = useTheme();

    const saving = useStorageMappingStore((state) => state.saving);

    return (
        <DialogTitle
            component="div"
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                pb: 0,
            }}
        >
            <Stack direction="row" spacing={1}>
                <Typography variant="h6">
                    <FormattedMessage id="storageMappings.configureStorage.label" />
                </Typography>
            </Stack>

            <IconButton disabled={saving} onClick={closeDialog}>
                <Xmark
                    style={{
                        fontSize: '1rem',
                        color: theme.palette.text.primary,
                    }}
                />
            </IconButton>
        </DialogTitle>
    );
}

export default StorageMappingTitle;
