import { globalSearchParams } from 'app/Authenticated';
import { useSearchParams } from 'react-router-dom';

function useGlobalSearchParams(
    key: globalSearchParams | Array<globalSearchParams>
) {
    const [searchParams] = useSearchParams();
    const response = [];

    if (Array.isArray(key)) {
        key.forEach((keyVal: string) => {
            console.log(keyVal, searchParams.get(keyVal));
            response.push(searchParams.get(keyVal));
        });
    } else {
        response.push(searchParams.get(key as string));
    }

    return response;
}

export default useGlobalSearchParams;
