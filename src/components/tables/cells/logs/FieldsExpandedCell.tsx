import { Box, useTheme } from '@mui/material';
import ReactJson from '@microlink/react-json-view';
import { jsonViewTheme } from 'context/Theme';

interface Props {
    fields: any;
}

function FieldsExpandedCell({ fields }: Props) {
    const theme = useTheme();

    return (
        <Box
            sx={{
                '& .react-json-view': {
                    backgroundColor: 'transparent !important',
                },
            }}
        >
            <ReactJson
                collapsed={5}
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
    );
}

export default FieldsExpandedCell;
