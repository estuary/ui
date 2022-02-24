import React from 'react';

interface AuthContextType {
    user: string | null | undefined;
    signin: (user: string, callback: VoidFunction) => void;
    signout: (callback?: VoidFunction) => void;
}

const AuthContext = React.createContext<AuthContextType>({
    signin: () => {},
    signout: () => {},
    user: null,
});

export default AuthContext;

const useAuth = () => {
    return React.useContext(AuthContext);
};

export { useAuth };
