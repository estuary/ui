import type { Dispatch, SetStateAction } from 'react';

import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Typography,
} from '@mui/material';

import { FormattedMessage } from 'react-intl';

import { defaultOutline } from 'src/context/Theme';
import { useTransformationCreate_name } from 'src/stores/TransformationCreate/hooks';

interface Props {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

const TITLE_ID = 'sql-data-preview-dialog-title';

function SQLDataPreviewDialog({ open, setOpen }: Props) {
    const entityName = useTransformationCreate_name();

    return (
        <Dialog open={open} maxWidth="md" fullWidth aria-labelledby={TITLE_ID}>
            <DialogTitle>
                <FormattedMessage id="newTransform.schema.dataPreview.header" />
            </DialogTitle>

            <DialogContent>
                <Box
                    sx={{
                        height: 37,
                        p: 1,
                        borderTop: (theme) =>
                            defaultOutline[theme.palette.mode],
                        borderRight: (theme) =>
                            defaultOutline[theme.palette.mode],
                        borderLeft: (theme) =>
                            defaultOutline[theme.palette.mode],
                    }}
                >
                    {entityName ? (
                        <Typography
                            sx={{ fontWeight: 500 }}
                        >{`${entityName}.query`}</Typography>
                    ) : null}
                </Box>

                <Divider />

                <Box
                    sx={{
                        height: 400,
                        borderBottom: (theme) =>
                            defaultOutline[theme.palette.mode],
                    }}
                >
                    Data Preview needs Rebuilt
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={() => setOpen(false)}>
                    <FormattedMessage id="cta.close" />
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default SQLDataPreviewDialog;
