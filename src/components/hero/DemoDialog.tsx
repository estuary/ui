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

                <Box sx={{ ml: 3 }}>
                    <Logo width={50} />
                </Box>
            </DialogContent>
        </Dialog>
    );
}

export default DemoDialog;
