import {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import {togglUrl} from './config';

export const togglRequest = (
    apiKey: string | undefined,
    url: string,
    method = 'GET',
    data: object | undefined = undefined
) => {
    if (!apiKey) {
        return Promise.resolve(undefined);
    }
    return new Promise((resolve, reject) => {
        fetch(`${togglUrl}${url}`, {
            method,
            headers: {
                Authorization: 'Basic ' + btoa(`${apiKey}:api_token`),
                ...(data ? {'Content-Type': 'application/json'} : {}),
            },
            ...(data
                ? {
                      body: JSON.stringify(data),
                  }
                : {}),
        })
            .then((response) => {
                if (!response.ok)
                    throw new Error('Network response was not ok');
                return response.json();
            })
            .then((data) => {
                resolve(data);
            })
            .catch((error) => {
                console.error('Fetch error:', error);
                reject(undefined);
            });
    });
};

export const useTogglRequest = () => {
    const {apiKey, workspaceId} = useTogglContext();
    return (
        url: string,
        method = 'GET',
        data: object | undefined = undefined
    ) => togglRequest(apiKey, `workspaces/${workspaceId}/${url}`, method, data);
};

type TogglContextType = {
    apiKey: string | undefined;
    workspaceId: string | undefined;
    setApiKey: (key: string | undefined) => void;
    isTogglApiEnabled: boolean;
    setIsTogglApiEnabled: (enabled: boolean) => void;
};

const TogglContext = createContext<TogglContextType>({
    apiKey: undefined,
    workspaceId: undefined,
    setApiKey: () => {},
    isTogglApiEnabled: false,
    setIsTogglApiEnabled: () => {},
});

export const useTogglContext = () => useContext(TogglContext);

export const TogglProvider = ({children}: {children: ReactNode}) => {
    const [apiKey, setApiKeyState] = useState<string | undefined>(undefined);
    const [workspaceId, setWorkspaceId] = useState<string | undefined>(
        undefined
    );
    const [isTogglApiEnabled, setIsTogglApiEnabledState] = useState<boolean>(false);

    useEffect(() => {
        const storedKey = localStorage.getItem('togglApiKey');
        if (storedKey) {
            setApiKeyState(storedKey);
        }
        const storedWorkspace = localStorage.getItem('togglWorkspaceId');
        if (storedWorkspace) {
            setWorkspaceId(storedWorkspace);
        }
        const storedEnabled = localStorage.getItem('togglApiEnabled');
        if (storedEnabled !== null) {
            setIsTogglApiEnabledState(storedEnabled === 'true');
        }
    }, []);

    useEffect(() => {
        if (workspaceId || !apiKey) {
            return;
        }
        togglRequest(apiKey, 'workspaces').then((data: any) => {
            const workspaceId = data[0].id;
            setWorkspaceId(workspaceId);
            localStorage.setItem('togglWorkspaceId', workspaceId);
        });
    }, [apiKey, workspaceId]);

    const setApiKey = (key: string | undefined) => {
        setApiKeyState(key);
        if (key) {
            localStorage.setItem('togglApiKey', key);
        } else {
            localStorage.removeItem('togglApiKey');
        }
    };

    const setIsTogglApiEnabled = (enabled: boolean) => {
        setIsTogglApiEnabledState(enabled);
        localStorage.setItem('togglApiEnabled', enabled.toString());
    };

    return (
        <TogglContext.Provider value={{apiKey, setApiKey, workspaceId, isTogglApiEnabled, setIsTogglApiEnabled}}>
            {children}
        </TogglContext.Provider>
    );
};
