import ClickToAccept from 'directives/ClickToAccept';
import { BaseComponentProps } from 'types';
import DirectiveGuard from './DirectiveGuard';

function LegalGuard({ children }: BaseComponentProps) {
    return (
        <DirectiveGuard
            form={<ClickToAccept />}
            selectedDirective="clickToAccept"
        >
            {children}
        </DirectiveGuard>
    );
}

export default LegalGuard;
