import { Container, Paper, Stack, useTheme } from '@mui/material';

import { PoweredByEstuaryLogo } from 'src/components/graphics/PoweredByEstuaryLogo';
import { paperBackground } from 'src/context/Theme';
import { BaseComponentProps } from 'src/types';

export const ExpressWorkflowWrapper = ({ children }: BaseComponentProps) => {
    const theme = useTheme();

    return (
        <Container maxWidth={false} style={{ height: '100vh' }}>
            <Stack
                spacing={3}
                style={{
                    justifyContent: 'space-between',
                    height: 'inherit',
                    paddingTop: 24,
                }}
            >
                <Paper
                    style={{
                        background: paperBackground[theme.palette.mode],
                        borderRadius: 6,
                        boxShadow:
                            'rgb(50 50 93 / 2%) 0px 2px 5px -1px, rgb(0 0 0 / 5%) 0px 1px 3px -1px',
                        padding: 16,
                        width: '100%',
                    }}
                >
                    {children}
                </Paper>

                <Stack
                    direction="row"
                    style={{ justifyContent: 'flex-end', paddingBottom: 8 }}
                >
                    <PoweredByEstuaryLogo />
                </Stack>
            </Stack>
        </Container>
    );
};
