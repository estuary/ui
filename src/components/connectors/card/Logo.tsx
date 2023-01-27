import { Cable } from '@mui/icons-material';

interface Props {
    imageSrc: string | null | undefined;
    maxHeight?: number;
    padding?: string | number;
}

function ConnectorLogo({ imageSrc, maxHeight, padding }: Props) {
    if (imageSrc) {
        return (
            <img
                src={imageSrc}
                loading="lazy"
                alt=""
                style={{
                    width: 'auto',
                    maxHeight: maxHeight ?? 75,
                    padding: padding ?? '0 1rem',
                }}
            />
        );
    } else {
        return <Cable sx={{ fontSize: '4rem' }} />;
    }
}

export default ConnectorLogo;
