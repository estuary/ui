import Box from '@mui/material/Box';
import logoLight from '../../images/light/logo-estuary.png';
import logoDark from '../../images/dark/logo-estuary.png';
import { useTheme } from '@mui/material/styles';

function Logo(props: LogoProps) {
    const theme = useTheme();
    return (
        <Box
            sx={{
                pr: 2,
                border: 0,
            }}
        >
            <img
                src={theme.palette.mode === 'dark' ? logoDark : logoLight}
                alt={props.alt}
                width={props.width}
            />
        </Box>
    );
}

export type LogoProps = {
    alt: string;
    width: number;
};
export default Logo;
