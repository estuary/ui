import { Avatar, Box, PaletteMode, useTheme } from '@mui/material';
import { DataPlaneIconProps } from 'components/shared/Entity/types';
import { semiTransparentBackground_oneLayerElevated } from 'context/Theme';
import { Lock, QuestionMark } from 'iconoir-react';
import azureLogo from 'images/data-plane-providers/10018-icon-service-Azure-A.svg';
import awsLogo from 'images/data-plane-providers/aws.png';
import awsLogoWhite from 'images/data-plane-providers/aws_logo-white.png';
import gcpLogo from 'images/data-plane-providers/google_cloud.png';

const DEFAULT_AVATAR_SIZE = 20;

const getProviderIconPath = (
    provider: string | undefined,
    colorMode: PaletteMode
) => {
    if (provider === 'aws') {
        return colorMode === 'light' ? awsLogo : awsLogoWhite;
    }

    if (provider === 'az') {
        return azureLogo;
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
