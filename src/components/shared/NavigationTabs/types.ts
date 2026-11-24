import type { TabsProps } from '@mui/material';
import type { ComponentType, Ref } from 'react';

export interface NavigationTabProps<T = any> {
    ref?: Ref<HTMLAnchorElement>;
    labelMessageId: string;
    path: string;
    Wrapper?: ComponentType<React.PropsWithChildren<T>>;
    wrapperProps?: T;
}

export interface NavigationTabsProps {
    keyPrefix: string;
    tabs: NavigationTabProps[];
    getPath?: (path: string) => string;
    TabsProps?: Partial<TabsProps>;
}
