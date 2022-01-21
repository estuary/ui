import { BrowserRouter } from 'react-router-dom';

const AppRouter: React.FC = ({ children }) => {
    return <BrowserRouter>{children}</BrowserRouter>;
};

export default AppRouter;
