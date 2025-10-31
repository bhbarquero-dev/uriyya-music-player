import { useState, useEffect } from 'react';
import '../styles/window-controls.css';

export const WindowControls = () => {
    const [isMaximized, setIsMaximized] = useState(false);
    const [platform, setPlatform] = useState<'win32' | 'darwin' | 'linux'>('win32');

    useEffect(() => {
        const currentWindow = require('@electron/remote').getCurrentWindow();
        const nodePlatform = require('@electron/remote').process.platform;

        setPlatform(nodePlatform);
        setIsMaximized(currentWindow.isMaximized());

        const handleMaximizeChange = () => {
            setIsMaximized(currentWindow.isMaximized());
        };

        currentWindow.on('maximize', handleMaximizeChange);
        currentWindow.on('unmaximize', handleMaximizeChange);

        return () => {
            currentWindow.removeListener('maximize', handleMaximizeChange);
            currentWindow.removeListener('unmaximize', handleMaximizeChange);
        };
    }, []);

    const handleWindowControls = (action: 'minimize' | 'maximize' | 'close') => {
        const currentWindow = require('@electron/remote').getCurrentWindow();
        
        switch (action) {
            case 'minimize':
                currentWindow.minimize();
                break;
            case 'maximize':
                if (currentWindow.isMaximized()) {
                    currentWindow.unmaximize();
                } else {
                    currentWindow.maximize();
                }
                break;
            case 'close':
                currentWindow.close();
                break;
        }
    };

    if (platform === 'darwin') {
        return (
            <div className="window-controls macos">
                <button 
                    className="window-control-button close"
                    onClick={() => handleWindowControls('close')}
                    title="Cerrar"
                >
                    <span></span>
                </button>
                <button 
                    className="window-control-button minimize"
                    onClick={() => handleWindowControls('minimize')}
                    title="Minimizar"
                >
                    <span></span>
                </button>
                <button 
                    className="window-control-button maximize"
                    onClick={() => handleWindowControls('maximize')}
                    title={isMaximized ? "Restaurar" : "Maximizar"}
                >
                    <span></span>
                </button>
            </div>
        );
    }

    return (
        <div className="window-controls windows">
            <button 
                className="window-control-button"
                onClick={() => handleWindowControls('minimize')}
                title="Minimizar"
            >
                <svg width="11" height="1" viewBox="0 0 11 1">
                    <path d="M11,0.5 C11,0.776142375 10.7761424,1 10.5,1 L0.5,1 C0.223857625,1 0,0.776142375 0,0.5 C0,0.223857625 0.223857625,0 0.5,0 L10.5,0 C10.7761424,0 11,0.223857625 11,0.5 Z" fill="currentColor" />
                </svg>
            </button>
            <button 
                className="window-control-button"
                onClick={() => handleWindowControls('maximize')}
                title={isMaximized ? "Restaurar" : "Maximizar"}
            >
                {isMaximized ? (
                    <svg width="11" height="11" viewBox="0 0 11 11">
                        <path d="M11,8.5 L11,0.5 C11,0.223857625 10.7761424,0 10.5,0 L2.5,0 C2.22385763,0 2,0.223857625 2,0.5 L2,2 L0.5,2 C0.223857625,2 0,2.22385763 0,2.5 L0,10.5 C0,10.7761424 0.223857625,11 0.5,11 L8.5,11 C8.77614237,11 9,10.7761424 9,10.5 L9,9 L10.5,9 C10.7761424,9 11,8.77614237 11,8.5 Z M8,10 L1,10 L1,3 L8,3 L8,10 Z M10,8 L9,8 L9,2.5 C9,2.22385763 8.77614237,2 8.5,2 L3,2 L3,1 L10,1 L10,8 Z" fill="currentColor" />
                    </svg>
                ) : (
                    <svg width="11" height="11" viewBox="0 0 11 11">
                        <path d="M11,0.5 L11,10.5 C11,10.7761424 10.7761424,11 10.5,11 L0.5,11 C0.223857625,11 0,10.7761424 0,10.5 L0,0.5 C0,0.223857625 0.223857625,0 0.5,0 L10.5,0 C10.7761424,0 11,0.223857625 11,0.5 Z M10,1 L1,1 L1,10 L10,10 L10,1 Z" fill="currentColor" />
                    </svg>
                )}
            </button>
            <button 
                className="window-control-button close"
                onClick={() => handleWindowControls('close')}
                title="Cerrar"
            >
                <svg width="11" height="11" viewBox="0 0 11 11">
                    <path d="M6.279 5.5L11 10.221l-.779.779L5.5 6.279.779 11 0 10.221 4.721 5.5 0 .779.779 0 5.5 4.721 10.221 0 11 .779 6.279 5.5z" fill="currentColor" />
                </svg>
            </button>
        </div>
    );
};