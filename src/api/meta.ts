import { client } from 'src/services/client';

// These are generated in vite.config.ts 'writeVersionToFile'
interface LatestVersionDetails {
    commitId: string;
    commitDate: string;
}

export const getLatestVersionDetails = () => {
    return client<LatestVersionDetails>(`${window.origin}/meta.json`);
};
