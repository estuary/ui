import NoGrants from 'pages/NoGrants';
import { Route, Routes } from 'react-router';

const NoGrantsFound = () => {
    return (
        <Routes>
            <Route path="*" element={<NoGrants />} />
        </Routes>
    );
};

export default NoGrantsFound;
