import { NetworkLeft } from 'iconoir-react';

interface Props {
    imageSrc: string | null | undefined;
    maxHeight?: number;
    padding?: string | number;
    unknownConnectorIconConfig?: {
        width: string | number;
        fontSize: string | number;
    };
}

function ConnectorLogo({
    imageSrc,
    maxHeight,
    padding,
    unknownConnectorIconConfig,
}: Props) {
    if (imageSrc) {
        return (
            <img
                src={imageSrc}
                loading="lazy"
                alt=""
                style={{
                    maxHeight: maxHeight ?? 75,
                    maxWidth: '100%',
                    padding: padding ?? '0 1rem',
                }}
            />
        );
    } else {
        return (
            <NetworkLeft
                style={{
                    width: unknownConnectorIconConfig?.width,
                    fontSize: unknownConnectorIconConfig?.fontSize ?? '3rem',
                }}
            />
        );
    }
}

export default ConnectorLogo;
