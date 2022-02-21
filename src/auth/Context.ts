import React from 'react';

interface AuthContextType {
    user: string | null;
    signin: (user: string, callback: VoidFunction) => void;
    signout: (callback: VoidFunction) => void;
}

const AuthContext = React.createContext<AuthContextType>({
    user: null,
    signin: () => {},
    signout: () => {},
});

export default AuthContext;

const useAuth = () => {
    return React.useContext(AuthContext);
};

export { useAuth };
