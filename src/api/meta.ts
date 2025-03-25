import { client } from 'services/client';

// These are generated in vite.config.ts 'writeVersionToFile'
interface LatestVersionDetails {
    commitId: string;
    builtAt: string;
}

export const getLatestVersionDetails = () => {
    return client<LatestVersionDetails>(`${window.origin}/meta.json`);
};
