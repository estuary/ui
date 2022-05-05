import { Box, TableCell, Tooltip } from '@mui/material';
import { getDeploymentStatusHexCode } from 'utils/misc-utils';

interface Props {
    name: string;
}

function EntityName({ name }: Props) {
    return (
        <TableCell
            sx={{
                'minWidth': 256,
                '& > *': {
                    borderBottom: 'unset',
                },
            }}
        >
            <Tooltip title={name} placement="bottom-start">
                <Box>
                    <span
                        style={{
                            height: 16,
                            width: 16,
                            backgroundColor:
                                getDeploymentStatusHexCode('ACTIVE'),
                            borderRadius: 50,
                            display: 'inline-block',
                            verticalAlign: 'middle',
                            marginRight: 12,
                        }}
                    />
                    <span
                        style={{
                            verticalAlign: 'middle',
                        }}
                    >
                        {name}
                    </span>
                </Box>
            </Tooltip>
        </TableCell>
    );
}

export default EntityName;
