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
}

export type HeaderMessageProps = Pick<
    LoginWrapperProps,
    'isRegister' | 'headerMessageId'
>;
