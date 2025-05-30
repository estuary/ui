import type { ChipProps } from '@mui/material';
import type { RefObject } from 'react';

interface CollapsableList {
    hiddenCount: number;
    listScroller: RefObject<HTMLDivElement>;
    showEntireList: () => void;
}

export interface CollapsableListResponse<S> extends CollapsableList {
    list: S[];
}

export type ExpandListChipProps = Pick<
    CollapsableList,
    'hiddenCount' | 'showEntireList'
> &
    ChipProps;
