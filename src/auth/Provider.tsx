import React from 'react';
import { useNavigate } from 'react-router';
import { useLocalStorage } from 'react-use';
import { setAuthHeader } from '../services/axios';
import AuthContext from './Context';
import { authToken, fakeAuthProvider } from './fakeAuth';

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser, removeUser] = useLocalStorage<string | null>(
        authToken,
        null
    );

    const navigate = useNavigate();

    const signin = (newUser: string, callback: VoidFunction) => {
        return fakeAuthProvider.signin(() => {
            setUser(newUser);
            setAuthHeader(newUser);
            callback();
        });
    };

    const signout = (callback?: VoidFunction) => {
        return fakeAuthProvider.signout(() => {
            removeUser();
            setAuthHeader();
            navigate('/login', { replace: true });
            callback?.();
        });
    };

    const value = { signin, signout, user };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};

export default AuthProvider;
