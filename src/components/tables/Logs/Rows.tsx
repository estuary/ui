import {
    Box,
    Collapse,
    SxProps,
    TableCell,
    TableRow,
    Theme,
    Typography,
    useTheme,
} from '@mui/material';
import { DateTime } from 'luxon';
import { FormattedMessage } from 'react-intl';
import { useToggle } from 'react-use';
import ReactJson from '@microlink/react-json-view';
import { jsonViewTheme } from 'context/Theme';
import { ObjectPreview } from 'react-inspector';
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
const BaseTypographySx: SxProps<Theme> = {
    fontFamily: 'Monospace',
};
const BaseCellSx: SxProps<Theme> = {
    py: 0,
};

function Row({ row }: RowProps) {
    const theme = useTheme();
    const columns = useLogColumns();

    const [expanded, toggleExpanded] = useToggle(false);

    const enableExpansion = Boolean(row.fields);

    return (
        <>
            <TableRow
                hover={enableExpansion}
                aria-expanded={expanded}
                sx={{
                    cursor: enableExpansion ? 'pointer' : undefined,
                }}
                onClick={
                    enableExpansion
                        ? () => {
                              toggleExpanded();
                          }
                        : undefined
                }
            >
                <LevelCell
                    disableExpand={!enableExpansion}
                    expanded={expanded}
                    row={row}
                />

                <TableCell sx={BaseCellSx}>
                    <Typography noWrap sx={BaseTypographySx}>
                        {DateTime.fromISO(row.ts).toFormat(
                            'yyyy-LL-dd HH:mm:ss.SSS ZZZZ'
                        )}
                    </Typography>
                </TableCell>

                <TableCell>
                    <Typography
                        component="div"
                        sx={{
                            ...BaseTypographySx,
                            width: '100%',
                        }}
                    >
                        {row.message}
                    </Typography>

                    {row.fields ? (
                        <Typography component="div" sx={BaseTypographySx}>
                            {row.fields ? (
                                <ObjectPreview data={row.fields} />
                            ) : (
                                <FormattedMessage id="common.missing" />
                            )}
                        </Typography>
                    ) : null}
                </TableCell>
            </TableRow>
            {row.fields ? (
                <TableRow>
                    <TableCell
                        sx={{ ...BaseCellSx, pl: 5 }}
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
                                        backgroundColor:
                                            'transparent !important',
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
            ) : null}
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
