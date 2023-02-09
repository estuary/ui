import { NetworkLeft } from 'iconoir-react';

interface Props {
    imageSrc: string | null | undefined;
}

function ConnectorCardLogo({ imageSrc }: Props) {
    if (imageSrc) {
        return (
            <img
                src={imageSrc}
                loading="lazy"
                alt=""
                style={{
                    width: 'auto',
                    maxHeight: 75,
                    padding: '0 1rem',
                }}
            />
        );
    } else {
        return <NetworkLeft style={{ fontSize: '3rem' }} />;
    }
}

export default ConnectorCardLogo;
