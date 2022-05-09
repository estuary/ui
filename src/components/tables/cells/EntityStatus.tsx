import { Tooltip } from '@mui/material';
import { getDeploymentStatusHexCode } from 'utils/misc-utils';

function EntityStatus() {
    return (
        <Tooltip title="Status" placement="bottom-start">
            <span
                style={{
                    height: 16,
                    width: 16,
                    backgroundColor: getDeploymentStatusHexCode('ACTIVE'),
                    borderRadius: 50,
                    display: 'inline-block',
                    verticalAlign: 'middle',
                    marginRight: 12,
                }}
            />
        </Tooltip>
    );
}

export default EntityStatus;
