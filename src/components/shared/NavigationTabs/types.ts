import type { TabsProps } from '@mui/material';
import type { ComponentType, Ref } from 'react';

export interface NavigationTabProps<T = any> {
    labelMessageId?: string;
    label?: string;
    tabRef?: Ref<HTMLAnchorElement>;
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
