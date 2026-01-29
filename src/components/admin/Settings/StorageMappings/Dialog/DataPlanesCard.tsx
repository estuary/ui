import type { StorageMappingFormData } from 'src/components/admin/Settings/StorageMappings/Dialog/schema';

import { useCallback, useEffect, useMemo } from 'react';

import { Box, Stack } from '@mui/material';

import { useFormContext } from 'react-hook-form';

import { DataPlaneNode, useDataPlanes } from 'src/api/dataPlanesGql';
import CardWrapper from 'src/components/shared/CardWrapper';
import { RHFCheckbox } from 'src/components/shared/forms/RHFCheckbox';
import { RHFMultiSelectWithDefault } from 'src/components/shared/forms/RHFMultiSelectWithDefault';
import { RHFSelect } from 'src/components/shared/forms/RHFSelect';
import { toPresentableName } from 'src/utils/dataPlane-utils';

export function DataPlanesCard() {
    const { dataPlanes: allDataPlanes } = useDataPlanes();

    const { watch, setValue } = useFormContext<StorageMappingFormData>();

    const allowPublic = watch('allow_public');
    const selectAdditional = watch('select_additional');
    const selectedDataPlanes = watch('data_planes');
    const [hasPrivate, hasPublic] = useMemo(
        () => [
            allDataPlanes.some((option) => option.isPrivate),
            allDataPlanes.some((option) => !option.isPrivate),
        ],
        [allDataPlanes]
    );
    // Auto-select "allow public" if there are no private options
    // (Checkbox will be hidden if there are no public options)
    useEffect(() => {
        setValue('allow_public', !hasPrivate);
    }, [hasPrivate, setValue]);

    // Remove public data planes when allowPublic is unchecked
    useEffect(() => {
        if (!allowPublic && selectedDataPlanes.some((dp) => !dp.isPrivate)) {
            setValue(
                'data_planes',
                selectedDataPlanes.filter((dp) => dp.isPrivate)
            );
        }
    }, [allowPublic, selectedDataPlanes, setValue]);

    const filteredDataPlanes = useMemo(
        () =>
            allDataPlanes
                .filter((option) => {
                    // if we only have private OR public, show all options
                    if (hasPrivate != hasPublic) {
                        return true;
                    }
                    return option.isPrivate || allowPublic;
                })
                .sort((a, b) => {
                    // Private data planes first, then alphabetically
                    if (a.isPrivate !== b.isPrivate) {
                        return a.isPrivate ? -1 : 1;
                    }

                    return a.dataPlaneName.localeCompare(b.dataPlaneName);
                })
                .map((option) => ({
                    value: option.dataPlaneName,
                    label: `${toPresentableName(option)} (${option.scope})`,
                })),
        [allDataPlanes, hasPrivate, allowPublic]
    );

    // Convert a data plane name to a DataPlane object
    const nameToDataPlane = useCallback(
        (name: string): DataPlaneNode | null =>
            allDataPlanes.find((opt) => opt.dataPlaneName === name) ?? null,

        [allDataPlanes]
    );
    return (
        <CardWrapper>
            <Stack spacing={2}>
                {filteredDataPlanes.length > 1 && selectAdditional ? (
                    <RHFMultiSelectWithDefault<
                        StorageMappingFormData,
                        'data_planes'
                    >
                        name="data_planes"
                        label="Data Planes"
                        options={filteredDataPlanes}
                        required
                        rules={{
                            validate: (value) =>
                                (Array.isArray(value) && value.length > 0) ||
                                'At least one data plane is required',
                        }}
                        valueTransform={(value) =>
                            value?.map((dp) => dp.dataPlaneName) ?? []
                        }
                        onChangeTransform={(names) =>
                            names
                                .map(nameToDataPlane)
                                .filter(
                                    (dp): dp is DataPlaneNode => dp !== null
                                )
                        }
                    />
                ) : (
                    <RHFSelect<StorageMappingFormData, 'data_planes'>
                        name="data_planes"
                        label="Data Plane"
                        options={filteredDataPlanes}
                        required
                        rules={{
                            validate: (value) =>
                                (Array.isArray(value) && value.length > 0) ||
                                'Data plane is required',
                        }}
                        valueTransform={(value) =>
                            value?.[0]?.dataPlaneName ?? ''
                        }
                        onChangeTransform={(name) => {
                            const dp = nameToDataPlane(name as string);
                            return dp ? [dp] : [];
                        }}
                    />
                )}

                <Box
                    sx={{
                        display: 'flex',
                        gap: 2,
                        color: 'text.secondary',
                    }}
                >
                    {hasPublic ? (
                        <RHFCheckbox<StorageMappingFormData>
                            name="allow_public"
                            label="Allow public data planes"
                            // disabled because this will be checked by default
                            // if there are no private options
                            disabled={!hasPrivate}
                        />
                    ) : null}
                    {filteredDataPlanes.length > 1 ? (
                        <RHFCheckbox<StorageMappingFormData>
                            name="select_additional"
                            label="Select multiple data planes"
                        />
                    ) : null}
                </Box>
            </Stack>
        </CardWrapper>
    );
}
