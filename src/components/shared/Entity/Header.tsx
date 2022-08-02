import {
    Box,
    Collapse,
    LinearProgress,
    Stack,
    SxProps,
    Theme,
    Toolbar,
    Typography,
} from '@mui/material';
import ValidationErrorSummary from 'components/shared/Entity/ValidationErrorSummary';
import { slate, stickyHeaderIndex, tableBorderSx } from 'context/Theme';
import {
    DetailsFormStoreNames,
    EndpointConfigStoreNames,
    FormStateStoreNames,
    ResourceConfigStoreNames,
    useZustandStore,
} from 'context/Zustand';
import { ReactNode } from 'react';
import { useInView } from 'react-intersection-observer';
import { EntityFormState } from 'stores/FormState';

interface Props {
    GenerateButton: ReactNode;
    TestButton: ReactNode;
    SaveButton: ReactNode;
    heading: ReactNode;
    formErrorsExist: boolean;
    endpointConfigStoreName: EndpointConfigStoreNames;
    formStateStoreName: FormStateStoreNames;
    detailsFormStoreName: DetailsFormStoreNames;
    resourceConfigStoreName?: ResourceConfigStoreNames;
}

export const buttonSx: SxProps<Theme> = { ml: 1 };

const stickySx: SxProps<Theme> = {
    ...tableBorderSx,
    background: (theme) =>
        theme.palette.mode === 'dark' ? slate[700] : slate[25],
    ml: '-16px',
    px: '16px',
    width: 'calc(100% + 32px)',
};

const stickyThreshold = 1;

function FooHeader({
    GenerateButton,
    TestButton,
    SaveButton,
    heading,
    formErrorsExist,
    endpointConfigStoreName,
    formStateStoreName,
    detailsFormStoreName,
    resourceConfigStoreName,
}: Props) {
    const formActive = useZustandStore<
        EntityFormState,
        EntityFormState['isActive']
    >(formStateStoreName, (state) => state.isActive);

    const { inView, ref } = useInView({
        threshold: [stickyThreshold],
    });

    return (
        <>
            <Toolbar
                ref={ref}
                disableGutters
                sx={{
                    ...(!inView
                        ? {
                              ...stickySx,
                          }
                        : {}),
                    position: 'sticky',
                    top: -stickyThreshold,
                    zIndex: stickyHeaderIndex,
                }}
            >
                <Typography variant="h6" noWrap>
                    {heading}
                </Typography>

                <Stack
                    direction="row"
                    alignItems="center"
                    sx={{
                        'ml': 'auto',
                        '& > button': {
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                        },
                    }}
                >
                    {GenerateButton}

                    {TestButton}

                    {SaveButton}
                </Stack>
            </Toolbar>

            <Collapse in={formActive} unmountOnExit>
                <LinearProgress sx={{ mb: 2 }} />
            </Collapse>

            <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                <ValidationErrorSummary
                    errorsExist={formErrorsExist}
                    endpointConfigStoreName={endpointConfigStoreName}
                    formStateStoreName={formStateStoreName}
                    detailsFormStoreName={detailsFormStoreName}
                    resourceConfigStoreName={resourceConfigStoreName}
                />
            </Box>
        </>
    );
}

export default FooHeader;
