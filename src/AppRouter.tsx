import { BrowserRouter } from 'react-router-dom';

import App from './App';

// TODO - maybe move all the routes to a JSON Object?

export default function AppRouter() {
    return (
        <BrowserRouter>
            <App />
        </BrowserRouter>
    );
}
