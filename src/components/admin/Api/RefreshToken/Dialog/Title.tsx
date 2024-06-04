import { DialogTitle, IconButton, Typography, useTheme } from '@mui/material';
import { Xmark } from 'iconoir-react';
import { Dispatch, SetStateAction } from 'react';
import { FormattedMessage } from 'react-intl';
import { useRefreshTokenStore } from '../Store/create';

interface Props {
    setOpen: Dispatch<SetStateAction<boolean>>;
}

function RefreshTokenTitle({ setOpen }: Props) {
    const theme = useTheme();

    const saving = useRefreshTokenStore((state) => state.saving);
    const resetState = useRefreshTokenStore((state) => state.resetState);

    const closeDialog = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();

        setOpen(false);
        resetState();
    };

    return (
        <DialogTitle
            component="div"
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}
        >
            <Typography variant="h6">
                <FormattedMessage id="admin.cli_api.refreshToken.dialog.header" />
            </Typography>

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

export default RefreshTokenTitle;
