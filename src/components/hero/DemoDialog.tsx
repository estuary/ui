import { Box, Dialog, DialogContent, Typography } from '@mui/material';
import AcceptDemoInvitation from 'components/hero/AcceptDemoInvitation';
import Logo from 'components/navigation/Logo';
import { Dispatch, SetStateAction } from 'react';
import { FormattedMessage } from 'react-intl';

const TITLE_ID = 'accept-demo-tenant-dialog-title';

interface Props {
    objectRoles: string[];
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    goToFilteredTable: () => void;
}

function DemoDialog({ objectRoles, open, setOpen, goToFilteredTable }: Props) {
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
            <DialogContent sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ mr: 3 }}>
                    <Logo width={50} />
                </Box>

                {objectRoles.length > 0 ? (
                    <AcceptDemoInvitation
                        tenant={objectRoles[0]}
                        setOpen={setOpen}
                        goToFilteredTable={goToFilteredTable}
                    />
                ) : (
                    <Typography>
                        <FormattedMessage id="admin.users.prefixInvitation.header" />
                    </Typography>
                )}
            </DialogContent>
        </Dialog>
    );
}

export default DemoDialog;
