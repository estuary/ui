import { Refresh } from '@mui/icons-material';
import {
    Box,
    CircularProgress,
    IconButton,
    Stack,
    styled,
    Tooltip,
    tooltipClasses,
    TooltipProps,
    Typography,
} from '@mui/material';
import {
    handleInferredSchemaFailure,
    handleInferredSchemaSuccess,
} from 'components/editor/Bindings/SchemaInference/service-utils';
import { CollectionData } from 'components/editor/Bindings/types';
import { monacoEditorHeaderBackground } from 'context/Theme';
import { Dispatch, SetStateAction } from 'react';
import { useLocalStorage } from 'react-use';
import getInferredSchema from 'services/schema-inference';
import { Schema } from 'types';
import {
    getStoredGatewayAuthConfig,
    LocalStorageKeys,
} from 'utils/localStorage-utils';

interface Props {
    catalogName: string;
    collectionData: CollectionData;
    inferredSchema: Schema | null | undefined;
    schemaUpdateErrored: boolean;
    loading: boolean;
    setInferredSchema: Dispatch<SetStateAction<Schema | null | undefined>>;
    setSchemaUpdateErrored: Dispatch<SetStateAction<boolean>>;
    setLoading: Dispatch<SetStateAction<boolean>>;
    toolbarHeight?: number;
}

const CustomWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
))({
    [`& .${tooltipClasses.tooltip}`]: {
        maxWidth: 400,
    },
    [`& .${tooltipClasses.popper}`]: {
        overflowWrap: 'break-word',
    },
});

function DiffEditorHeader({
    catalogName,
    collectionData,
    loading,
    setInferredSchema,
    setSchemaUpdateErrored,
    setLoading,
    toolbarHeight,
}: Props) {
    const [gatewayConfig] = useLocalStorage(
        LocalStorageKeys.GATEWAY,
        getStoredGatewayAuthConfig()
    );

    const handlers = {
        refreshInferredSchema: (event: React.MouseEvent<HTMLElement>) => {
            event.preventDefault();

            setSchemaUpdateErrored(false);
            setLoading(true);

            if (gatewayConfig?.gateway_url) {
                getInferredSchema(gatewayConfig, catalogName).then(
                    (response) =>
                        handleInferredSchemaSuccess(
                            response,
                            collectionData.spec,
                            setInferredSchema,
                            setLoading
                        ),
                    (error) =>
                        handleInferredSchemaFailure(
                            error,
                            setInferredSchema,
                            setLoading
                        )
                );
            } else {
                setLoading(false);
            }
        },
    };

    return (
        <Box
            sx={{
                p: 1,
                minHeight: toolbarHeight,
                backgroundColor: (theme) =>
                    monacoEditorHeaderBackground[theme.palette.mode],
            }}
        >
            <Stack
                direction="row"
                sx={{
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <CustomWidthTooltip
                    title={catalogName}
                    placement="bottom-start"
                >
                    <Typography noWrap sx={{ mr: 2 }}>
                        {catalogName}
                    </Typography>
                </CustomWidthTooltip>

                {loading ? (
                    <Box sx={{ px: 1, pt: 1 }}>
                        <CircularProgress size="1.5rem" />
                    </Box>
                ) : (
                    <IconButton onClick={handlers.refreshInferredSchema}>
                        <Refresh />
                    </IconButton>
                )}
            </Stack>
        </Box>
    );
}

export default DiffEditorHeader;
