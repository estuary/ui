import { Cable } from '@mui/icons-material';

interface Props {
    imageSrc: string | null | undefined;
    maxHeight?: number;
}

function ConnectorLogo({ imageSrc, maxHeight }: Props) {
    if (imageSrc) {
        return (
            <img
                src={imageSrc}
                loading="lazy"
                alt=""
                style={{
                    width: 'auto',
                    maxHeight: maxHeight ?? 75,
                    padding: '0 1rem',
                }}
            />
        );
    } else {
        return <Cable sx={{ fontSize: '4rem' }} />;
    }
}

export default ConnectorLogo;
