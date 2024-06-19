export const inbucketURL = `http://localhost:5434`;

export const generateEmail = (username: string | number) => {
    return [username, `${username}@example.com`];
};
