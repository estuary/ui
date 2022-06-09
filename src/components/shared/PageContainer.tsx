import { Container, Paper } from '@mui/material';
import { ReactNode } from 'react';

interface Props {
    children: ReactNode | ReactNode[];
}

function PageContainer({ children }: Props) {
    return (
        <Container
            maxWidth={false}
            sx={{
                paddingTop: 2,
            }}
        >
            <Paper
                sx={{
                    padding: 2,
                    width: '100%',
                    background:
                        'linear-gradient(160deg, rgba(172, 199, 220, 0.18) 2.23%, rgba(70, 111, 143, 0.16) 40%)',
                    boxShadow: '0px 4px 30px -1px rgba(0, 0, 0, 0.25)',
                    borderRadius: '10px',
                    backdropFilter: 'blur(20px)',
                }}
                variant="outlined"
            >
                {children}
            </Paper>
        </Container>
    );
}

export default PageContainer;
