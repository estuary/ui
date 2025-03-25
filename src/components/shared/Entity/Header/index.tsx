import type { EntityToolbarProps } from '../types';
import { Stack, Toolbar } from '@mui/material';
import EditCapabilityGuard from 'components/shared/guards/EditCapability';
import HeaderLogs from '../HeaderLogs';
import HeaderActions from './Actions';
import HeaderProgress from './Progress';

function EntityToolbar({
    GenerateButton,
    PrimaryButtonComponent,
    SecondaryButtonComponent,
    primaryButtonProps,
    secondaryButtonProps,
    hideLogs,
    waitTimes,
}: EntityToolbarProps) {
    return (
        <EditCapabilityGuard>
            <Stack spacing={2} sx={{ mb: 1 }}>
                <Toolbar disableGutters>
                    <HeaderActions
                        GenerateButton={GenerateButton}
                        PrimaryButtonComponent={PrimaryButtonComponent}
                        SecondaryButtonComponent={SecondaryButtonComponent}
                        primaryButtonProps={primaryButtonProps}
                        secondaryButtonProps={secondaryButtonProps}
                    />
                </Toolbar>

                <HeaderProgress waitTimes={waitTimes} />

                {!hideLogs ? <HeaderLogs /> : null}
            </Stack>
        </EditCapabilityGuard>
    );
}

export default EntityToolbar;
