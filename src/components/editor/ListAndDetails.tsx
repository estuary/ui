import Box from '@mui/material/Box';
import {
    DEFAULT_HEIGHT,
    DEFAULT_TOOLBAR_HEIGHT,
} from 'components/editor/MonacoEditor';
import { slate } from 'context/Theme';
import { ReactNode } from 'react';
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex';

export interface Props {
    list: ReactNode;
    details: ReactNode;
    height?: number;
    backgroundColor?: string;
    displayRightPaneBoarder?: boolean;
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
    displayRightPaneBoarder,
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
                    {leftPaneSkeleton && loading ? (
                        leftPaneSkeleton
                    ) : (
                        <div
                            className="pane-content"
                            style={{ height: heightVal }}
                        >
                            {list}
                        </div>
                    )}
                </ReflexElement>

                <ReflexSplitter style={{ width: 10 }} />

                <ReflexElement
                    className="right-pane"
                    minSize={MIN_RESIZE_WIDTH}
                    style={{
                        overflow: 'auto',
                        border: displayRightPaneBoarder
                            ? `1px solid ${slate[200]}`
                            : '',
                    }}
                >
                    {rightPaneSkeleton && loading ? (
                        rightPaneSkeleton
                    ) : (
                        <div className="pane-content">{details}</div>
                    )}
                </ReflexElement>
            </ReflexContainer>
        </Box>
    );
}

export default ListAndDetails;
