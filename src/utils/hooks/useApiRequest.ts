import { useState, useCallback, useRef } from 'react';
import axios, { AxiosRequestConfig, CancelTokenSource } from 'axios';
import { isEqual } from 'lodash';

type State<T> = {
    data: T | null;
    error: string | null;
    loading: boolean;
}

// return type of the useApiRequest hook, includes the state and a refetch .
type UseApiRequestReturnType<T> = State<T> & {
    refetch: (config?: AxiosRequestConfig) => void;
};

function useApiRequest<T = any>(initialConfig: AxiosRequestConfig): UseApiRequestReturnType<T> {
    const [state, setState] = useState<State<T>>({
        data: null,
        error: null,
        loading: false,
    });
    const lastConfigRef = useRef<AxiosRequestConfig | null>(null);
    const cancelTokenSourceRef = useRef<CancelTokenSource | null>(null);

    const fetchData = useCallback(async (config: AxiosRequestConfig) => {
        // cancel the previous request only if the config is the same
        if (isEqual(lastConfigRef.current, config) && cancelTokenSourceRef.current) {
            cancelTokenSourceRef.current.cancel('');
        }

        lastConfigRef.current = config;

        // new cancel token
        const newCancelTokenSource = axios.CancelToken.source();
        cancelTokenSourceRef.current = newCancelTokenSource;
        setState({ data: null, error: null, loading: true });

        // set headers to prevent caching
        const noCacheHeaders = {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        };

        try {
            const response = await axios({
                ...config,
                cancelToken: newCancelTokenSource.token,
                headers: { ...config.headers, ...noCacheHeaders }
            });
            setState({ data: response.data, error: null, loading: false });
        } catch (err: any) {
            if (!axios.isCancel(err)) {
                setState({ data: null, error: err.message || 'An error occurred', loading: false });
            }
        }
    }, []);

    // function for trigger refetch
    const refetch = useCallback((config: AxiosRequestConfig = initialConfig) => {
        fetchData(config);
    }, [fetchData, initialConfig]);

    return { ...state, refetch };
}

export default useApiRequest;