import React from "react";

interface AuthContextType {
    user: any;
    signin: (user: string, callback: VoidFunction) => void;
    signout: (callback: VoidFunction) => void;
}

let AuthContext = React.createContext<AuthContextType>(null!);

export default AuthContext;

const useAuth = () => {
    return React.useContext(AuthContext);
}

export {
    useAuth
};
