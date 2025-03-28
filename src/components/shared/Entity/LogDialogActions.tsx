import { useMemo } from 'react';

import { Box, Button, Stack } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import { TaskEndpoint } from 'src/components/shared/Endpoints/TaskEndpoint';
import Status from 'src/components/shared/Entity/Status';
import { useEntityType } from 'src/context/EntityContext';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import { useFormStateStore_status } from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';
import { useTransformationCreate_catalogName } from 'src/stores/TransformationCreate/hooks';
import { hasLength } from 'src/utils/misc-utils';
import type { LogDialogActionsProps } from 'src/components/shared/Entity/types';

function LogDialogActions({ close, closeCtaKey }: LogDialogActionsProps) {
    const entityType = useEntityType();

    const formStatus = useFormStateStore_status();

    const catalogNameFromDerivationForm = useTransformationCreate_catalogName();

    const catalogNameFromDetailsForm = useDetailsFormStore(
        (state) => state.details.data.entityName
    );
    const reactorAddress = useDetailsFormStore(
        (state) => state.details.data.dataPlane?.reactorAddress
    );

    const taskName = useMemo(
        () =>
            entityType === 'collection'
                ? catalogNameFromDerivationForm
                : catalogNameFromDetailsForm,
        [catalogNameFromDerivationForm, catalogNameFromDetailsForm, entityType]
    );

    // Only show endpoints after a completed publication, since publishing can potentially
    // change the endpoints.
    let endpoints = null;
    if (
        formStatus === FormStatus.SAVED &&
        hasLength(taskName) &&
        reactorAddress
    ) {
        endpoints = (
            <Box sx={{ pl: 2, display: 'flex', flexDirection: 'column' }}>
                <TaskEndpoint
                    key={taskName}
                    reactorAddress={reactorAddress}
                    taskName={taskName}
                />
            </Box>
        );
    }

    return (
        <>
            <Box sx={{ pl: 2 }}>
                <Status />
            </Box>

            {endpoints}

            <Stack direction="row" spacing={2}>
                <Button onClick={close}>
                    <FormattedMessage id={closeCtaKey ?? 'cta.close'} />
                </Button>
            </Stack>
        </>
    );
}

export default LogDialogActions;
