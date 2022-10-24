import Box from '@mui/material/Box';
import {
    DEFAULT_HEIGHT,
    DEFAULT_TOOLBAR_HEIGHT,
} from 'components/editor/MonacoEditor';
import { ReactNode } from 'react';
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex';

export interface Props {
    list: ReactNode;
    details: ReactNode;
    height?: number;
    backgroundColor?: string;
}

const MIN_RESIZE_WIDTH = 25;
const INITIAL_SELECTOR_WIDTH = 350;

function ListAndDetails({ backgroundColor, list, details, height }: Props) {
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
                    <div className="pane-content" style={{ height: heightVal }}>
                        {list}
                    </div>
                </ReflexElement>

                <ReflexSplitter
                    style={{
                        width: 4,
                    }}
                />

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
