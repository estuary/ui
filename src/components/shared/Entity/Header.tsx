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
import { useRouteStore } from 'hooks/useRouteStore';
import { ReactNode } from 'react';
import { useInView } from 'react-intersection-observer';
import { entityCreateStoreSelectors } from 'stores/Create';

interface Props {
    GenerateButton: ReactNode;
    TestButton: ReactNode;
    SaveButton: ReactNode;
    heading: ReactNode;
}

export const buttonSx: SxProps<Theme> = { ml: 1, borderRadius: 5 };

const stickySx: SxProps<Theme> = {
    ...tableBorderSx,
    background: slate[700],
    ml: '-16px',
    px: '16px',
    width: 'calc(100% + 32px)',
};

const stickyThreshold = 1;

function FooHeader({ GenerateButton, TestButton, SaveButton, heading }: Props) {
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
                />
            </Box>
        </>
    );
}

export default FooHeader;
