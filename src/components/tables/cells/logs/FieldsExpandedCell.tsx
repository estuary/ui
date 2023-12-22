import { TableCell, Box, Collapse, TableRow, useTheme } from '@mui/material';
import ReactJson from '@microlink/react-json-view';
import { jsonViewTheme } from 'context/Theme';
import useLogColumns from 'components/tables/Logs/useLogColumns';
import { BaseCellSx } from './shared';

interface Props {
    expanded: boolean;
    fields: any;
}

// const reactInspectorTheme = {
//     light: chromeLight,
//     dark: chromeDark,
// };

function FieldsExpandedCell({ expanded, fields }: Props) {
    const theme = useTheme();
    const columns = useLogColumns();

    return (
        <TableRow>
            <TableCell sx={{ ...BaseCellSx, pl: 5 }} colSpan={columns.length}>
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
                            src={fields ?? {}}
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
    );
}

export default FieldsExpandedCell;
