import { Add } from '@mui/icons-material';
import { Box, ButtonBase, Typography } from '@mui/material';
import { useExistingEntity_setCreateNewTask } from 'components/shared/Entity/ExistingEntityCards/Store/hooks';
import {
    alternateConnectorImageBackgroundSx,
    semiTransparentBackground,
    semiTransparentBackgroundIntensified,
} from 'context/Theme';

function NewEntityCard() {
    // Existing Entity Store
    const setCreateNewTask = useExistingEntity_setCreateNewTask();

    return (
        <ButtonBase
            onClick={() => setCreateNewTask(true)}
            sx={{
                'width': '100%',
                'borderRadius': 5,
                'background': (theme) =>
                    semiTransparentBackground[theme.palette.mode],
                'padding': 1,
                '&:hover': {
                    background: (theme) =>
                        semiTransparentBackgroundIntensified[
                            theme.palette.mode
                        ],
                },
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    flexGrow: 1,
                }}
            >
                <Box
                    sx={{
                        ...alternateConnectorImageBackgroundSx,
                        width: 51,
                    }}
                >
                    <Add />
                </Box>

                <Box sx={{ ml: 2 }}>
                    <Typography sx={{ width: 'max-content' }}>
                        Create new
                    </Typography>
                </Box>
            </Box>
        </ButtonBase>
    );
}

export default NewEntityCard;
