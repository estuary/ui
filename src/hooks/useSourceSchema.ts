import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';

type SourceSchemaService = {
    isFetching: boolean;
    sourceSchema: any;
    error: any;
    image: any;
    fetchSchema: any;
};

const useSourceSchema = (key: string): SourceSchemaService => {
    const [sourceSchema, setSourceSchema] = useState<object | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [image, setImage] = useState<string | null>(null);
    const [isFetching, setIsFetching] = useState<boolean>(false);

    const fetchSchema = useCallback(async () => {
        setIsFetching(true);
        setError(null);
        axios
            .get(`http://localhost:3001/source/path/${encodeURIComponent(key)}`)
            .then(
                async (response: any) => {
                    setIsFetching(false);

                    try {
                        const derefSchema = {};
                        setSourceSchema(derefSchema);
                        setImage(response.data.details.image);

                        // const dereferencedSchema = await $RefParser.dereference(
                        //     `http://localhost:3001/source/path/${encodeURIComponent(
                        //         key
                        //     )}`,
                        //     {
                        //         continueOnError: false,
                        //         dereference: {
                        //             circular: false,
                        //         },
                        //     }
                        // );
                        // setSourceSchema(dereferencedSchema);
                        // setImage(response.data.details.image);
                    } catch (error: any) {
                        console.log(error);
                        setSourceSchema(null);
                        setIsFetching(false);
                        setError(error.message);
                    }
                },
                (error: any) => {
                    setIsFetching(false);
                    setError(
                        error.response
                            ? error.response.data.message
                            : error.message
                    );
                }
            );
    }, [key]);

    useEffect(() => {
        (async () => {
            if (key) {
                await fetchSchema();
            }
        })();
    }, [fetchSchema, key]);

    return { isFetching, sourceSchema, image, error, fetchSchema };
};

export default useSourceSchema;
