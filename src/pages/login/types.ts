import type { ReactNode } from 'react';
import type { BaseComponentProps } from 'src/types';

export interface LoginWrapperProps extends BaseComponentProps {
    isRegister: boolean;
    tabIndex: number;
    handleChange?: (event: any, val: any) => void;
    headerMessageId?: string;
    showBack?: boolean;
}

export interface RegisterPerkProps {
    messageID: string;
    disableNoWrap?: boolean;
    disableEmphasisColor?: boolean;
    customChild?: ReactNode;
}

export type HeaderMessageProps = Pick<
    LoginWrapperProps,
    'isRegister' | 'headerMessageId'
>;
