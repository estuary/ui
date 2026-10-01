import type { TabsProps } from '@mui/material';
import type { ComponentType } from 'react';

interface NavigationTabBaseProps<T> {
    path: string;
    Wrapper?: ComponentType<React.PropsWithChildren<T>>;
    wrapperProps?: T;
}

// `label` is plain copy; `labelMessageId` is legacy react-intl.
export type NavigationTabProps<T = any> = NavigationTabBaseProps<T> &
    (
        | { label: string; labelMessageId?: never }
        | { labelMessageId: string; label?: never }
    );

export interface NavigationTabsProps {
    keyPrefix: string;
    tabs: NavigationTabProps[];
    getPath?: (path: string) => string;
    TabsProps?: Partial<TabsProps>;
}
