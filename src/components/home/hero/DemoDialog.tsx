import type { Dispatch, SetStateAction } from 'react';

import { useState } from 'react';

import {
    Box,
    Collapse,
    Dialog,
    DialogContent,
    LinearProgress,
    Stack,
    Typography,
} from '@mui/material';

import { useIntl } from 'react-intl';

import AcceptDemoInvitation from 'src/components/home/hero/AcceptDemoInvitation';
import Logo from 'src/components/navigation/Logo';

const TITLE_ID = 'accept-demo-tenant-dialog-title';

interface Props {
    objectRoles: string[];
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    goToFilteredTable: () => void;
}

function DemoDialog({ objectRoles, open, setOpen, goToFilteredTable }: Props) {
    const intl = useIntl();

    const [loading, setLoading] = useState(false);

    const closeDialog = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();

        setOpen(false);
    };

    return (
        <Dialog
            open={open}
            maxWidth="md"
            fullWidth
            aria-labelledby={TITLE_ID}
            onClose={closeDialog}
        >
            <DialogContent
                sx={{ p: 0, display: 'flex', flexDirection: 'column' }}
            >
                <Collapse in={loading}>
                    <LinearProgress sx={{ flexGrow: 1 }} />
                </Collapse>

                <Stack
                    direction="row"
                    sx={{ px: 3, py: 2, alignItems: 'center' }}
                >
                    <Box sx={{ mr: 3 }}>
                        <Logo width={50} />
                    </Box>

                    {objectRoles.length > 0 ? (
                        <AcceptDemoInvitation
                            tenant={objectRoles[0]}
                            loading={loading}
                            setLoading={setLoading}
                            setOpen={setOpen}
                            goToFilteredTable={goToFilteredTable}
                        />
                    ) : (
                        <Typography>
                            {intl.formatMessage({
                                id: 'admin.users.prefixInvitation.header',
                            })}
                        </Typography>
                    )}
                </Stack>
            </DialogContent>
        </Dialog>
    );
}

export default DemoDialog;
