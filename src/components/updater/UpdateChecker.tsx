import { useEffect, useState } from 'react';
import { check } from '@tauri-apps/plugin-updater';

interface UpdateDialogProps {
  version: string;
  onUpdate: () => void;
  onCancel: () => void;
}

function UpdateDialog({ version, onUpdate, onCancel }: UpdateDialogProps) {
  return (
    <div
      className="confirm-dialog-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="update-dialog-title"
      aria-describedby="update-dialog-message"
    >
      <div className="confirm-dialog">
        <h2 id="update-dialog-title" className="confirm-dialog-title">
          Actualización disponible
        </h2>
        <p id="update-dialog-message" className="confirm-dialog-message">
          La versión {version} está disponible. ¿Deseas descargar e instalar la actualización ahora?
        </p>
        <div className="confirm-dialog-actions">
          <button onClick={onCancel} className="confirm-dialog-btn confirm-dialog-btn--cancel">
            Más tarde
          </button>
          <button onClick={onUpdate} className="confirm-dialog-btn confirm-dialog-btn--save">
            Actualizar ahora
          </button>
        </div>
      </div>
    </div>
  );
}

interface ProgressDialogProps {
  progress: number;
}

function ProgressDialog({ progress }: ProgressDialogProps) {
  return (
    <div
      className="confirm-dialog-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="progress-dialog-title"
    >
      <div className="confirm-dialog">
        <h2 id="progress-dialog-title" className="confirm-dialog-title">
          Descargando actualización
        </h2>
        <p className="confirm-dialog-message">
          Progreso: {progress.toFixed(0)}%
        </p>
        <div style={{ width: '100%', height: '20px', backgroundColor: '#333', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', backgroundColor: '#4CAF50', transition: 'width 0.3s ease' }} />
        </div>
      </div>
    </div>
  );
}

export function UpdateChecker() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [newVersion, setNewVersion] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    async function checkForUpdates() {
      try {
        const update = await check();

        if (update?.available) {
          setUpdateAvailable(true);
          setNewVersion(update.version);
        }
      } catch (error) {
        console.error('Failed to check for updates:', error);
      }
    }

    checkForUpdates();
  }, []);

  const handleUpdate = async () => {
    try {
      setIsDownloading(true);
      setUpdateAvailable(false);

      const update = await check();

      if (update?.available) {
        await update.downloadAndInstall((event) => {
          switch (event.event) {
            case 'Started':
              setDownloadProgress(0);
              break;
            case 'Progress':
              if (event.data.chunkLength) {
                const currentProgress = downloadProgress + (event.data.chunkLength / 1024 / 1024);
                setDownloadProgress(Math.min(currentProgress, 99));
              }
              break;
            case 'Finished':
              setDownloadProgress(100);
              break;
          }
        });

        console.log('Update installed successfully. The application will restart.');
      }
    } catch (error) {
      console.error('Failed to install update:', error);
      setIsDownloading(false);
    }
  };

  const handleCancel = () => {
    setUpdateAvailable(false);
  };

  if (isDownloading) {
    return <ProgressDialog progress={downloadProgress} />;
  }

  if (updateAvailable) {
    return <UpdateDialog version={newVersion} onUpdate={handleUpdate} onCancel={handleCancel} />;
  }

  return null;
}
