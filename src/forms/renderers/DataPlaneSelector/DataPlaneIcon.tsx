import { Avatar, Box } from '@mui/material';
import { Language, Lock, QuestionMark } from 'iconoir-react';
import { DataPlaneOption } from 'stores/DetailsForm/types';

interface Props {
    scope: DataPlaneOption['scope'];
    iconPath?: string | null;
    size?: number;
}

const DEFAULT_AVATAR_SIZE = 20;

const getScopeIcon = (scope: DataPlaneOption['scope']) => {
    if (scope === 'private') {
        return Lock;
    }

    return Language;
};

export default function DataPlaneIcon({
    iconPath,
    scope,
    size = DEFAULT_AVATAR_SIZE,
}: Props) {
    const scopeIconSize = scope === 'private' ? 10 : 9;
    const ScopeIcon = getScopeIcon(scope);

    return (
        <Box style={{ height: size, width: size }}>
            {iconPath ? (
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
                        src={iconPath}
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

            <Box
                sx={{
                    position: 'absolute',
                    right: -2,
                    top: 4,
                }}
            >
                <ScopeIcon
                    style={{
                        height: scopeIconSize,
                        width: scopeIconSize,
                    }}
                />
            </Box>
        </Box>
    );
}
