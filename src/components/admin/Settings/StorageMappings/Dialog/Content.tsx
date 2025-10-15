import type { DataPlaneOption } from 'src/stores/DetailsForm/types';

import { useEffect, useState } from 'react';

import { Box, DialogContent, Skeleton, Stack, Typography } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import { getDataPlaneOptions } from 'src/api/dataPlanes';
import DataPlaneSelector from 'src/components/admin/Settings/StorageMappings/Dialog/DataPlaneSelector';
import RepublicationError from 'src/components/admin/Settings/StorageMappings/Dialog/Error';
import StorageMappingForm from 'src/components/admin/Settings/StorageMappings/Dialog/Form';
import RepublicationLogs from 'src/components/admin/Settings/StorageMappings/Dialog/Logs';
import ProviderSelector from 'src/components/admin/Settings/StorageMappings/Dialog/ProviderSelector';
import { REPUBLICATION_FAILURE_MESSAGE_ID } from 'src/components/admin/Settings/StorageMappings/Dialog/useRepublishPrefix';
import { useStorageMappingStore } from 'src/components/admin/Settings/StorageMappings/Store/create';
import Error from 'src/components/shared/Error';
import ErrorBoundryWrapper from 'src/components/shared/ErrorBoundryWrapper';
import { BASE_ERROR } from 'src/services/supabase';
import { DATA_PLANE_SETTINGS } from 'src/settings/dataPlanes';
import { useTenantStore } from 'src/stores/Tenant/Store';
import { generateDataPlaneOption } from 'src/utils/dataPlane-utils';
import { defaultDataPlaneSuffix } from 'src/utils/env-utils';

function StorageMappingContent() {
    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    const logToken = useStorageMappingStore((state) => state.logToken);
    const provider = useStorageMappingStore((state) => state.provider);
    const serverError = useStorageMappingStore((state) => state.serverError);
    const setDataPlaneName = useStorageMappingStore(
        (state) => state.setDataPlaneName
    );
    const setServerError = useStorageMappingStore(
        (state) => state.setServerError
    );

    const [dataPlaneOptions, setDataPlaneOptions] = useState<
        DataPlaneOption[] | null
    >(null);

    useEffect(() => {
        getDataPlaneOptions(undefined, selectedTenant).then(
            (response) => {
                // TODO: Determine whether this is worthy of an alert.
                if (!response.data) {
                    setServerError({
                        ...BASE_ERROR,
                        message: 'data-plane options not found',
                    });

                    setDataPlaneOptions([]);

                    return;
                }

                const formattedData = response.data.map((datum) =>
                    generateDataPlaneOption(datum)
                );

                if (formattedData.length === 1) {
                    setDataPlaneName(formattedData[0].dataPlaneName.whole);
                } else {
                    const defaultDataPlaneOption =
                        formattedData.find(
                            (option) => option.scope === 'private'
                        ) ??
                        formattedData.find(
                            (option) =>
                                option.dataPlaneName.whole ===
                                `${DATA_PLANE_SETTINGS.public.prefix}${defaultDataPlaneSuffix}`
                        ) ??
                        formattedData[0];

                    setDataPlaneName(
                        defaultDataPlaneOption.dataPlaneName.whole
                    );
                }

                setDataPlaneOptions(formattedData);
            },
            (error) => {
                setDataPlaneOptions([]);
                setServerError(error);
            }
        );
    }, [selectedTenant, setDataPlaneName, setDataPlaneOptions, setServerError]);

    return (
        <DialogContent sx={{ mt: 1 }}>
            <Box sx={{ mb: 2 }}>
                {serverError?.message === REPUBLICATION_FAILURE_MESSAGE_ID ? (
                    <RepublicationError error={serverError} />
                ) : serverError ? (
                    <Error severity="error" error={serverError} condensed />
                ) : null}
            </Box>

            <Typography sx={{ mb: 3 }}>
                <FormattedMessage
                    id="storageMappings.dialog.generate.description"
                    values={{ tenant: <b>{selectedTenant}</b> }}
                />
            </Typography>

            {logToken ? (
                <RepublicationLogs
                    errored={serverError !== null}
                    token={logToken}
                />
            ) : dataPlaneOptions !== null ? (
                <Stack spacing={2}>
                    <DataPlaneSelector options={dataPlaneOptions} />

                    <ProviderSelector />

                    {provider ? (
                        <ErrorBoundryWrapper>
                            <StorageMappingForm />
                        </ErrorBoundryWrapper>
                    ) : null}
                </Stack>
            ) : (
                <Stack spacing={2}>
                    <Skeleton height={45} />
                    <Skeleton height={27} />
                </Stack>
            )}
        </DialogContent>
    );
}

export default StorageMappingContent;
