import Box from '@mui/material/Box';
import {
    DEFAULT_HEIGHT,
    DEFAULT_TOOLBAR_HEIGHT,
} from 'components/editor/MonacoEditor';
import { slateOutline } from 'context/Theme';
import { ReactNode } from 'react';
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex';

export interface Props {
    list: ReactNode;
    details: ReactNode;
    height?: number;
    backgroundColor?: string;
    displayBorder?: boolean;
    loading?: boolean;
    leftPaneSkeleton?: ReactNode;
    rightPaneSkeleton?: ReactNode;
}

const MIN_RESIZE_WIDTH = 25;
const INITIAL_SELECTOR_WIDTH = 450;

function ListAndDetails({
    backgroundColor,
    list,
    details,
    height,
    displayBorder,
    loading,
    leftPaneSkeleton,
    rightPaneSkeleton,
}: Props) {
    const heightVal = (height ?? DEFAULT_HEIGHT) + DEFAULT_TOOLBAR_HEIGHT;

    return (
        <Box
            sx={{
                bgcolor: backgroundColor ?? 'background.paper',
                height: `${heightVal}px`,
                overflow: 'hidden',
                mb: 2,
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
                            height: heightVal,
                            border: displayBorder ? slateOutline[200] : '',
                        }}
                    >
                        {leftPaneSkeleton && loading ? leftPaneSkeleton : list}
                    </div>
                </ReflexElement>

                <ReflexSplitter style={{ width: 10 }} />

                <ReflexElement
                    className="right-pane"
                    minSize={MIN_RESIZE_WIDTH}
                    style={{
                        overflow: 'auto',
                        border: displayBorder ? slateOutline[200] : '',
                    }}
                >
                    <div className="pane-content">
                        {rightPaneSkeleton && loading
                            ? rightPaneSkeleton
                            : details}
                    </div>
                </ReflexElement>
            </ReflexContainer>
        </Box>
    );
}

export default ListAndDetails;
