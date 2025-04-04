import type { ReactNode } from 'react';

import { useTheme } from '@mui/material';
import Box from '@mui/material/Box';

import { MoreVert } from 'iconoir-react';
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex';

import { defaultOutline, reflexSplitterBackground } from 'src/context/Theme';
import { getEditorTotalHeight } from 'src/utils/editor-utils';

export interface Props {
    list: ReactNode;
    details: ReactNode;
    height?: number;
    backgroundColor?: string;
    displayBorder?: boolean;
    removeMargin?: boolean;
}

const MIN_RESIZE_WIDTH = 25;
const INITIAL_SELECTOR_WIDTH = 450;

function ListAndDetails({
    backgroundColor,
    list,
    details,
    height,
    displayBorder,
    removeMargin,
}: Props) {
    const theme = useTheme();

    const heightVal = getEditorTotalHeight(height);

    return (
        <Box
            sx={{
                border: displayBorder
                    ? defaultOutline[theme.palette.mode]
                    : undefined,
                bgcolor: backgroundColor ?? 'background.paper',
                height: `${heightVal}px`,
                overflow: 'hidden',
                mb: removeMargin ? undefined : 2,
            }}
        >
            <ReflexContainer orientation="vertical">
                <ReflexElement
                    className="left-pane"
                    size={INITIAL_SELECTOR_WIDTH}
                    minSize={MIN_RESIZE_WIDTH}
                >
                    <div
                        className="pane-content"
                        style={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        {list}
                    </div>
                </ReflexElement>

                <ReflexSplitter
                    style={{
                        width: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: defaultOutline[theme.palette.mode],
                        backgroundColor:
                            reflexSplitterBackground[theme.palette.mode],
                    }}
                >
                    <MoreVert style={{ color: theme.palette.text.primary }} />
                </ReflexSplitter>

                <ReflexElement
                    className="right-pane"
                    minSize={MIN_RESIZE_WIDTH}
                    style={{
                        overflow: 'auto',
                    }}
                >
                    <div className="pane-content">{details}</div>
                </ReflexElement>
            </ReflexContainer>
        </Box>
    );
}

export default ListAndDetails;
