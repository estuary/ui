const fakeAuthProvider = {
    signin(callback: VoidFunction) {
        setTimeout(callback, 100); // fake async
    },
    signout(callback: VoidFunction) {
        setTimeout(callback, 100);
    },
};

const authToken = 'auth-token';

export { authToken, fakeAuthProvider };
