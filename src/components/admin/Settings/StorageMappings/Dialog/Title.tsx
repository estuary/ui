import {
    ButtonProps,
    DialogTitle,
    IconButton,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';
import { useStorageMappingStore } from 'components/admin/Settings/StorageMappings/Store/create';
import ExternalLink from 'components/shared/ExternalLink';
import { Xmark } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';

interface Props {
    closeDialog: ButtonProps['onClick'];
}

const docsUrl =
    'https://docs.estuary.dev/getting-started/installation/#configuring-your-cloud-storage-bucket-for-use-with-flow';

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
            }}
        >
            <Stack direction="row" spacing={1}>
                <Typography variant="h6">
                    <FormattedMessage id="storageMappings.configureStorage.label" />
                </Typography>

                <ExternalLink link={docsUrl}>
                    <FormattedMessage id="terms.documentation" />
                </ExternalLink>
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
