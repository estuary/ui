import { Box } from '@mui/material';
import { Relationship } from 'components/graphs/ScopedSystemGraph';
import { CloudDownload, CloudUpload, DatabaseScript } from 'iconoir-react';
import { CSSProperties, ReactElement } from 'react';
import { Entity } from 'types';
import { useScopedSystemGraph } from '../Store/Store';

const getEntityColor = (relationship?: Relationship): string => {
    if (relationship === 'parent') {
        return 'rgba(83, 83, 204, 0.3)';
    }

    if (relationship === 'child') {
        return 'rgba(32, 140, 81, 0.4)';
    }

    return '#EFEFEF';
};

const getEntityIcon = (
    entityType?: Entity,
    style?: CSSProperties
): ReactElement | null => {
    let icon: ReactElement | null;

    switch (entityType) {
        case 'capture':
            icon = <CloudUpload style={style} />;
            break;
        case 'collection':
            icon = <DatabaseScript style={style} />;
            break;
        case 'materialization':
            icon = <CloudDownload style={style} />;
            break;
        default:
            icon = null;
    }

    return icon;
};

function EntityIcon() {
    const entityType = useScopedSystemGraph((state) => state.currentNode?.type);
    const relationship = useScopedSystemGraph(
        (state) => state.currentNode?.relationship
    );

    const entityColor = getEntityColor(relationship);
    const entityIcon = getEntityIcon(entityType);

    return entityIcon ? (
        <Box
            style={{
                alignItems: 'center',
                backgroundColor: entityColor,
                borderRadius: '50%',
                display: 'inline-flex',
                padding: 4,
            }}
        >
            {entityIcon}
        </Box>
    ) : null;
}

export default EntityIcon;
