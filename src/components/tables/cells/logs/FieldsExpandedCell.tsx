import { Box, Collapse, Divider, Typography, useTheme } from '@mui/material';
import ReactJson from '@microlink/react-json-view';
import { jsonViewTheme } from 'context/Theme';

interface Props {
    fields: any;
    message: string;
    open: boolean;
    opening: boolean;
    toggleRowHeight: (event: HTMLElement) => void;
    uuid: string;
}

function FieldsExpandedCell({
    fields,
    open,
    opening,
    message,
    toggleRowHeight,
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
            onEntered={toggleRowHeight}
            onExited={toggleRowHeight}
            unmountOnExit
        >
            <Box
                sx={{
                    px: 3,
                    py: 2,
                    opacity: opening ? 0 : undefined,
                }}
            >
                <Typography sx={{ fontFamily: 'Monospace' }}>
                    {message}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Box>
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
                </Box>
            </Box>
        </Collapse>
    );
}

export default FieldsExpandedCell;
