import type { TabsProps } from '@mui/material';
import type { ComponentType } from 'react';

export interface NavigationTabProps {
    labelMessageId: string;
    path: string;
    Wrapper?: ComponentType<any>;
    wrapperProps?: any;
}

export interface NavigationTabsProps {
    keyPrefix: string;
    tabs: NavigationTabProps[];
    getPath?: (path: string) => string;
    TabsProps?: Partial<TabsProps>;
}
