import {
    Collapse,
    LinearProgress,
    Stack,
    SxProps,
    Theme,
    Toolbar,
    Typography,
} from '@mui/material';
import ValidationErrorSummary from 'components/shared/Entity/ValidationErrorSummary';
import { slate, tableBorderSx, zIndexIncrement } from 'context/Theme';
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

function FooHeader({ GenerateButton, TestButton, SaveButton, heading }: Props) {
    const useEntityCreateStore = useRouteStore();
    const formActive = useEntityCreateStore(
        entityCreateStoreSelectors.isActive
    );
    const displayValidation = useEntityCreateStore(
        entityCreateStoreSelectors.formState.displayValidation
    );

    const { inView, ref } = useInView({
        threshold: [1],
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
                    top: -1,
                    zIndex: zIndexIncrement,
                }}
            >
                <Typography variant="h6" noWrap>
                    {heading}
                </Typography>

                <Stack
                    direction="row"
                    alignItems="center"
                    sx={{
                        ml: 'auto',
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

            <Collapse in={displayValidation} unmountOnExit>
                <ValidationErrorSummary />
            </Collapse>
        </>
    );
}

export default FooHeader;
