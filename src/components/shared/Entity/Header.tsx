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
    EndpointConfigStoreNames,
    ResourceConfigStoreNames,
} from 'context/Zustand';
import { useRouteStore } from 'hooks/useRouteStore';
import { ReactNode } from 'react';
import { useInView } from 'react-intersection-observer';
import { entityCreateStoreSelectors } from 'stores/Create';

interface Props {
    GenerateButton: ReactNode;
    TestButton: ReactNode;
    SaveButton: ReactNode;
    heading: ReactNode;
    endpointConfigStoreName: EndpointConfigStoreNames;
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
    endpointConfigStoreName,
    resourceConfigStoreName,
}: Props) {
    const useEntityCreateStore = useRouteStore();
    const formActive = useEntityCreateStore(
        entityCreateStoreSelectors.isActive
    );

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
                    hasErrorsSelector={entityCreateStoreSelectors.hasErrors}
                    endpointConfigStoreName={endpointConfigStoreName}
                    resourceConfigStoreName={resourceConfigStoreName}
                />
            </Box>
        </>
    );
}

export default FooHeader;
