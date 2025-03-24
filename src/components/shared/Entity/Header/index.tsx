import { Stack } from '@mui/material';
import EditCapabilityGuard from 'components/shared/guards/EditCapability';
import HeaderLogs from '../HeaderLogs';
import { EntityToolbarProps } from '../types';
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
                <HeaderActions
                    GenerateButton={GenerateButton}
                    PrimaryButtonComponent={PrimaryButtonComponent}
                    SecondaryButtonComponent={SecondaryButtonComponent}
                    primaryButtonProps={primaryButtonProps}
                    secondaryButtonProps={secondaryButtonProps}
                />

                <HeaderProgress waitTimes={waitTimes} />

                {!hideLogs ? <HeaderLogs /> : null}
            </Stack>
        </EditCapabilityGuard>
    );
}

export default EntityToolbar;
