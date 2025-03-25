import { Stack, Typography } from '@mui/material';
import DataPlaneIcon from 'components/shared/Entity/DataPlaneIcon';
import { hasLength } from 'utils/misc-utils';
import type { DataPlaneProps } from './types';

export default function DataPlane({
    dataPlaneName,
    formattedSuffix,
    hidePrefix,
    hideScopeIcon,
    logoSize,
    scope,
}: DataPlaneProps) {
    return (
        <Stack
            direction="row"
            spacing={1}
            style={{ alignItems: 'center', justifyContent: 'start' }}
        >
            {dataPlaneName ? (
                <DataPlaneIcon
                    hideScopeIcon={hideScopeIcon}
                    provider={dataPlaneName.provider}
                    scope={scope}
                    size={logoSize}
                />
            ) : null}

            <Stack>
                {!hidePrefix &&
                dataPlaneName &&
                hasLength(dataPlaneName.prefix) ? (
                    <Typography variant="caption" style={{ fontSize: 10 }}>
                        {dataPlaneName.prefix}
                    </Typography>
                ) : null}

                <Typography>{formattedSuffix}</Typography>
            </Stack>
        </Stack>
    );
}
