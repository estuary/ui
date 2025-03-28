import { Box, Collapse, Divider, Typography, useTheme } from '@mui/material';
import ReactJson from '@microlink/react-json-view';
import { jsonViewTheme, paperBackground } from 'src/context/Theme';

interface Props {
    fields: any;
    message: string;
    open: boolean;
    heightChanging: boolean;
    uuid: string;
}

function FieldsExpandedCell({
    fields,
    open,
    heightChanging,
    message,
    uuid,
}: Props) {
    const theme = useTheme();

    return (
        <Collapse
            key={`jsonPopper_${uuid}`}
            in={open}
            onClick={(event) => {
                // When clicking inside here we don't want to close the row
                event.preventDefault();
                event.stopPropagation();
            }}
            unmountOnExit
        >
            <Box
                sx={{
                    background: paperBackground[theme.palette.mode],
                    borderBottomWidth: 1,
                    px: 3,
                    py: 2,
                    opacity: heightChanging ? 0 : undefined,
                }}
            >
                <Typography
                    sx={{ fontFamily: 'Monospace', whiteSpace: 'break-spaces' }}
                >
                    {message}
                </Typography>

                <Divider sx={{ my: 2 }} />

                {fields ? (
                    <Box
                        sx={{
                            '& .react-json-view': {
                                backgroundColor: 'transparent !important',
                            },
                        }}
                    >
                        <ReactJson
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
                ) : null}
            </Box>
        </Collapse>
    );
}

export default FieldsExpandedCell;
