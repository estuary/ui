import {
    Box,
    Collapse,
    TableCell,
    TableRow,
    Typography,
    useTheme,
} from '@mui/material';
import { DateTime } from 'luxon';
import { ObjectPreview } from 'react-inspector';
import { FormattedMessage } from 'react-intl';
import { useToggle } from 'react-use';
import ReactJson from '@microlink/react-json-view';
import { jsonViewTheme } from 'context/Theme';
import LevelCell from '../cells/logs/LevelCell';
import useLogColumns from './useLogColumns';

interface RowProps {
    row: any;
}

interface RowsProps {
    data: any[];
}

// const reactInspectorTheme = {
//     light: chromeLight,
//     dark: chromeDark,
// };
const BaseTypographySx = { fontFamily: 'Monospace', textWrap: 'nowrap' };
const BaseCellSx = { maxWidth: 'min-content', py: 0 };

function Row({ row }: RowProps) {
    const theme = useTheme();
    const columns = useLogColumns();

    const [expanded, toggleExpanded] = useToggle(false);

    return (
        <>
            <TableRow
                hover
                aria-expanded={expanded}
                sx={{
                    cursor: 'pointer',
                }}
                onClick={() => {
                    toggleExpanded();
                }}
            >
                <LevelCell row={row} expanded={expanded} />

                <TableCell sx={BaseCellSx}>
                    <Typography sx={BaseTypographySx}>
                        {DateTime.fromISO(row.ts).toFormat(
                            'yyyy-LL-dd HH:mm:ss.SSS ZZZZ'
                        )}
                    </Typography>
                </TableCell>

                <TableCell sx={BaseCellSx}>
                    <Typography sx={BaseTypographySx}>{row.message}</Typography>
                </TableCell>

                <TableCell sx={BaseCellSx}>
                    <Typography component="div" sx={BaseTypographySx}>
                        {row.fields ? (
                            <ObjectPreview
                                data={row.fields}
                                theme={{
                                    BASE_COLOR: 'red',
                                }}
                            />
                        ) : (
                            <FormattedMessage id="common.missing" />
                        )}
                    </Typography>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell
                    sx={{ ...BaseCellSx, px: 3 }}
                    colSpan={columns.length}
                >
                    <Collapse
                        in={expanded}
                        timeout={100}
                        sx={{
                            mb: 1,
                        }}
                        unmountOnExit
                    >
                        <Box
                            sx={{
                                '& .react-json-view': {
                                    backgroundColor: 'transparent !important',
                                },
                            }}
                        >
                            <ReactJson
                                collapsed={1}
                                displayDataTypes={false}
                                displayObjectSize={false}
                                enableClipboard={false}
                                name="fields"
                                quotesOnKeys={false}
                                src={row.fields ?? {}}
                                style={{ wordBreak: 'break-all' }}
                                theme={jsonViewTheme[theme.palette.mode]}
                            />
                        </Box>

                        {/*                        <ObjectInspector
                            data={row.fields ?? {}}
                            name="fields"
                            expandLevel={1}
                            theme={
                                {
                                    ...reactInspectorTheme[theme.palette.mode],
                                    TREENODE_FONT_SIZE: 14,
                                } as any // hacky but the typing was complaining
                            }
                        />*/}
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
}

function Rows({ data }: RowsProps) {
    return (
        <>
            {data.map((record, index) => (
                <Row row={record} key={index} />
            ))}
        </>
    );
}

export default Rows;
