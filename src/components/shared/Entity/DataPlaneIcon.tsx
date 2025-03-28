import type { PaletteMode} from '@mui/material';
import { Avatar, Box, useTheme } from '@mui/material';

import { Lock, QuestionMark } from 'iconoir-react';

import type { DataPlaneIconProps } from 'src/components/shared/Entity/types';
import { semiTransparentBackground_oneLayerElevated } from 'src/context/Theme';
import awsLogoWhite from 'src/images/data-plane-providers/aws_logo-white.png';
import awsLogo from 'src/images/data-plane-providers/aws.png';
import gcpLogo from 'src/images/data-plane-providers/google_cloud.png';

const DEFAULT_AVATAR_SIZE = 20;

const getProviderIconPath = (
    provider: string | undefined,
    colorMode: PaletteMode
) => {
    if (provider === 'aws') {
        return colorMode === 'light' ? awsLogo : awsLogoWhite;
    }

    if (provider === 'gcp') {
        return gcpLogo;
    }

    return null;
};

export default function DataPlaneIcon({
    hideScopeIcon,
    provider,
    scope,
    size = DEFAULT_AVATAR_SIZE,
}: DataPlaneIconProps) {
    const theme = useTheme();

    const providerIconPath = getProviderIconPath(provider, theme.palette.mode);

    return (
        <Box style={{ height: size, position: 'relative', width: size }}>
            {providerIconPath ? (
                <Avatar
                    variant="rounded"
                    sx={{
                        background: 'transparent',
                        width: size,
                        height: size,
                    }}
                >
                    <img
                        width={size - 1}
                        height={size - 1}
                        src={providerIconPath}
                        loading="lazy"
                        alt=""
                    />
                </Avatar>
            ) : (
                <QuestionMark
                    style={{
                        height: size,
                        width: size,
                    }}
                />
            )}

            {!hideScopeIcon && scope === 'private' ? (
                <Box
                    sx={{
                        position: 'absolute',
                        right: -2,
                        top: size === DEFAULT_AVATAR_SIZE ? 4 : 12,
                    }}
                >
                    <Lock
                        style={{
                            backgroundColor:
                                semiTransparentBackground_oneLayerElevated[
                                    theme.palette.mode
                                ],
                            borderRadius: '100%',
                            height: size === DEFAULT_AVATAR_SIZE ? 10 : 12,
                            width: size === DEFAULT_AVATAR_SIZE ? 10 : 12,
                        }}
                    />
                </Box>
            ) : null}
        </Box>
    );
}
