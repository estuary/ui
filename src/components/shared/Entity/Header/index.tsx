import { Stack, Toolbar } from '@mui/material';

import HeaderLogs from '../HeaderLogs';
import { EntityToolbarProps } from '../types';
import HeaderActions from './Actions';
import HeaderProgress from './Progress';

import EditCapabilityGuard from 'src/components/shared/guards/EditCapability';

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
