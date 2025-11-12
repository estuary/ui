import type { LogoProps } from 'src/components/connectors/Grid/cards/types';

import { NetworkLeft } from 'iconoir-react';

function Logo({
    imageSrc,
    maxHeight,
    padding,
    unknownConnectorIconConfig,
}: LogoProps) {
    if (imageSrc) {
        return (
            <img
                src={imageSrc}
                loading="lazy"
                alt=""
                crossOrigin="anonymous"
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

export default Logo;
