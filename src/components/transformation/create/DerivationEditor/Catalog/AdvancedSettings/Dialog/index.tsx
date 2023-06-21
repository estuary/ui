import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
    useTheme,
} from '@mui/material';
import ListAndDetails from 'components/editor/ListAndDetails';
import MigrationList from 'components/transformation/create/DerivationEditor/Catalog/MigrationList';
import SQLEditor from 'components/transformation/create/DerivationEditor/SQLEditor';
import EmptySQLEditor from 'components/transformation/create/DerivationEditor/SQLEditor/Empty';
import { alternativeReflexContainerBackground } from 'context/Theme';
import { isEmpty } from 'lodash';
import { Dispatch, SetStateAction } from 'react';
import { FormattedMessage } from 'react-intl';
import {
    useTransformationCreate_catalogName,
    useTransformationCreate_migrations,
} from 'stores/TransformationCreate/hooks';

interface Props {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

const TITLE_ID = 'advanced-catalog-settings-dialog-title';

const EDITOR_HEIGHT = 532;

function AdvancedCatalogSettingsDialog({ open, setOpen }: Props) {
    const theme = useTheme();

    // Transformation Create Store
    const catalogName = useTransformationCreate_catalogName();
    const migrations = useTransformationCreate_migrations();

    return (
        <Dialog open={open} maxWidth="md" fullWidth aria-labelledby={TITLE_ID}>
            <DialogTitle>
                <FormattedMessage id="newTransform.editor.catalog.advancedSettings" />
            </DialogTitle>

            <DialogContent>
                <Typography sx={{ mb: 2, fontSize: 18 }}>
                    <FormattedMessage id="newTransform.editor.catalog.migration.header" />
                </Typography>

                <ListAndDetails
                    list={<MigrationList />}
                    details={
                        catalogName && !isEmpty(migrations) ? (
                            <SQLEditor
                                entityName={catalogName}
                                editorHeight={EDITOR_HEIGHT}
                            />
                        ) : (
                            <EmptySQLEditor editorHeight={EDITOR_HEIGHT} />
                        )
                    }
                    backgroundColor={
                        alternativeReflexContainerBackground[theme.palette.mode]
                    }
                    displayBorder={true}
                    height={550}
                />
            </DialogContent>

            <DialogActions>
                <Button onClick={() => setOpen(false)}>
                    <FormattedMessage id="cta.close" />
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default AdvancedCatalogSettingsDialog;
