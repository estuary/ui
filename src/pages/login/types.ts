import { BaseComponentProps } from 'types';

export interface LoginWrapperProps extends BaseComponentProps {
    isRegister: boolean;
    tabIndex: number;
    handleChange?: (event: any, val: any) => void;
    headerMessageId?: string;
    showBack?: boolean;
}

export type HeaderMessageProps = Pick<
    LoginWrapperProps,
    'isRegister' | 'headerMessageId'
>;
