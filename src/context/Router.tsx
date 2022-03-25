import { BrowserRouter } from 'react-router-dom';
import { BaseComponentProps } from 'types';

const AppRouter = ({ children }: BaseComponentProps) => {
    return <BrowserRouter>{children}</BrowserRouter>;
};

export default AppRouter;
