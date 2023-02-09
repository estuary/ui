import { IconoirProvider as IconProvider } from 'iconoir-react';
import { ReactElement } from 'react';

interface Props {
    children: ReactElement;
}

const IconoirProvider = ({ children }: Props) => {
    return (
        <IconProvider iconProps={{ fontSize: '14px' }}>{children}</IconProvider>
    );
};

export default IconoirProvider;
