import { IConfirmationModalContext } from 'context/Confirmation/types';

export interface BindingReviewProps {
    selected: string[];
    setContinuedAllowed: IConfirmationModalContext['setContinueAllowed'];
}
