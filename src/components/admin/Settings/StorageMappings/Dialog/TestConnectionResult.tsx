import type {
    ConnectionTestResults,
    StorageMappingFormData,
} from 'src/components/admin/Settings/StorageMappings/Dialog/schema';

import { useEffect, useMemo, useRef, useState } from 'react';

import { Box, Link, Stack, Typography, useTheme } from '@mui/material';

import { useFormContext } from 'react-hook-form';

import { useDataPlanes } from 'src/api/dataPlanesGql';
import { DataPlaneAccordion } from 'src/components/admin/Settings/StorageMappings/Dialog/DataPlaneAccordion';
import { CloudProviderCodes } from 'src/components/admin/Settings/StorageMappings/Dialog/schema';
import TechnicalEmphasis from 'src/components/derivation/Create/TechnicalEmphasis';
import { codeBackground } from 'src/context/Theme';

const docsBaseUrl = 'https://docs.estuary.dev/getting-started/installation/#';

const anchorMap: Record<string, string> = {
    aws: 'amazon-s3-buckets',
    gcp: 'google-cloud-storage-buckets',
    azure: 'azure-blob-storage',
};

interface TestConnectionResultProps {
    results: ConnectionTestResults;
    onRetry: (dataPlaneId: string) => void;
}

const getProviderLabel = (provider: string): string => {
    if (provider === 'gcp' || provider === CloudProviderCodes.GCP) {
        return 'Google Cloud Storage';
    }
    if (provider === 'aws' || provider === CloudProviderCodes.AWS) {
        return 'Amazon S3';
    }
    return provider || '—';
};

function TestConnectionResult({ results, onRetry }: TestConnectionResultProps) {
    const theme = useTheme();
    const { getValues } = useFormContext<StorageMappingFormData>();
    const formData = getValues();

    const { dataPlanes: dataPlaneOptions } = useDataPlanes();

    const [expandedPanel, setExpandedPanel] = useState<string | false>(false);
    const prevResultsRef = useRef<ConnectionTestResults>({});
    const [lastErrorMessages, setLastErrorMessages] = useState<
        Record<string, string>
    >({});

    // Track error messages and collapse accordion when connection succeeds
    useEffect(() => {
        // Capture error messages when they occur
        Object.entries(results).forEach(([id, result]) => {
            if (result.status === 'error' && result.errorMessage) {
                setLastErrorMessages((prev) => ({
                    ...prev,
                    [id]: result.errorMessage!,
                }));
            }
        });

        // Collapse accordion on status change to success
        if (expandedPanel) {
            const prevStatus = prevResultsRef.current[expandedPanel]?.status;
            const currentStatus = results[expandedPanel]?.status;
            if (prevStatus !== 'success' && currentStatus === 'success') {
                setExpandedPanel(false);
            }
        }
        prevResultsRef.current = results;
    }, [results, expandedPanel]);

    // Derive provider, region for display (from primary data plane or form)
    const { provider, displayProvider, displayRegion } = useMemo(() => {
        const primaryDataPlane = formData.data_planes?.[0];
        const dataPlane = primaryDataPlane
            ? dataPlaneOptions.find(
                  (dp) => dp.dataPlaneName === primaryDataPlane.dataPlaneName
              )
            : undefined;

        if (formData.use_same_region && dataPlane) {
            return {
                provider: dataPlane.cloudProvider,
                displayProvider: getProviderLabel(dataPlane.cloudProvider),
                displayRegion: dataPlane.region,
            };
        }
        return {
            provider: formData.provider,
            displayProvider: getProviderLabel(formData.provider),
            displayRegion: formData.region,
        };
    }, [
        dataPlaneOptions,
        formData.use_same_region,
        formData.data_planes,
        formData.provider,
        formData.region,
    ]);

    return (
        <Stack spacing={3}>
            <Typography>
                Grant Estuary access to your storage bucket. For detailed
                instructions,
                <br /> see the{' '}
                <Link
                    href={docsBaseUrl + anchorMap[provider]}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    documentation
                </Link>
            </Typography>

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr',
                    columnGap: 2,
                    rowGap: 0.5,
                    p: 2,
                    borderRadius: 3,
                    bgcolor: codeBackground[theme.palette.mode],
                    border: 1,
                    borderColor: 'divider',
                }}
            >
                <Typography variant="body2">
                    <strong>Bucket:</strong>
                </Typography>
                <TechnicalEmphasis>{formData.bucket || '—'}</TechnicalEmphasis>

                <Typography variant="body2">
                    <strong>Provider:</strong>
                </Typography>
                <TechnicalEmphasis>{displayProvider}</TechnicalEmphasis>

                <Typography variant="body2">
                    <strong>Region:</strong>
                </Typography>
                <TechnicalEmphasis>{displayRegion}</TechnicalEmphasis>

                {formData.storage_prefix ? (
                    <>
                        <Typography variant="body2">
                            <strong>Prefix:</strong>
                        </Typography>
                        <TechnicalEmphasis>
                            {formData.storage_prefix}
                        </TechnicalEmphasis>
                    </>
                ) : null}
            </Box>

            <Stack spacing={1}>
                {formData.data_planes?.map((dataPlane) => {
                    const testResult = results[dataPlane.dataPlaneName] ?? {
                        status: 'idle',
                    };

                    return (
                        <DataPlaneAccordion
                            key={dataPlane.dataPlaneName}
                            dataPlane={dataPlane}
                            testResult={testResult}
                            expanded={expandedPanel === dataPlane.dataPlaneName}
                            onExpandedChange={(isExpanded) =>
                                setExpandedPanel(
                                    isExpanded ? dataPlane.dataPlaneName : false
                                )
                            }
                            lastErrorMessage={
                                lastErrorMessages[dataPlane.dataPlaneName]
                            }
                            onRetry={() => onRetry(dataPlane.dataPlaneName)}
                            provider={provider}
                            bucket={formData.bucket}
                        />
                    );
                })}
            </Stack>
        </Stack>
    );
}

export default TestConnectionResult;
