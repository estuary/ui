import type { EntityToolbarProps } from 'src/components/shared/Entity/types';

import { Stack, Toolbar } from '@mui/material';

import { ExpressHeaderText } from 'src/components/capture/ExpressCreate/HeaderText';
import HeaderActions from 'src/components/shared/Entity/Header/Actions';
import HeaderProgress from 'src/components/shared/Entity/Header/Progress';
import HeaderLogs from 'src/components/shared/Entity/HeaderLogs';
import EditCapabilityGuard from 'src/components/shared/guards/EditCapability';

function EntityToolbar({
    expressWorkflow,
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
                    {expressWorkflow ? <ExpressHeaderText /> : null}

                    <HeaderActions
                        expressWorkflow={expressWorkflow}
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
