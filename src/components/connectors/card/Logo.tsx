import { NetworkLeft } from 'iconoir-react';

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
        return <NetworkLeft style={{ fontSize: '3rem' }} />;
    }
}

export default ConnectorLogo;
