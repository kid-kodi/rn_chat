import DocumentPicker from 'react-native-document-picker';

import { fileUploadURL, serviceConfig } from '../../ServiceConfig';
import { config_key } from '../../Constants';
import getPath from '@flyerhq/react-native-android-uri-path';
import { Platform } from 'react-native';
import { FileJobStatus } from '../../core/helpers/Types';

const RNFS = require('react-native-fs');

export class FileService {
  constructor() { }

  getDefaultDownloadPath() {
    return RNFS.DownloadDirectoryPath;
  }

  getBundlePath() {
    if (Platform.OS == 'android') {
      return RNFS.DocumentDirectoryPath;
    } else if (Platform.OS == 'ios') {
      return RNFS.MainBundlePath;
    } else {
      return null;
    }
  }

  getPathByURI(uri) {
    let realPath = null;
    if (Platform.OS == 'android') {
      realPath = getPath(uri);
    } else if (Platform.OS == 'ios') {
      const split = uri.split('/');
      const name = split.pop();
      const inbox = split.pop();
      realPath = `${RNFS.TemporaryDirectoryPath}${inbox}/${name}`;
    } else {
      console.error(
        '[Error]  Fail to convert URI to realPath: Platform not supported',
      );
      throw Error('Fail to convert URI to realPath: Platform not supported');
    }
    console.log(`[Log]  File path converted: ${realPath}`);
    return realPath;
  }

  /**
   * Checks if a file exists at the given path
   * @param {string} filePath - The full path to the file
   * @returns {Promise<boolean>} - Returns true if file exists, false otherwise
   */
  async fileExists(filePath) {
    if (!filePath || typeof filePath !== 'string') {
      console.warn('[fileExists] Invalid file path provided:', filePath);
      return false;
    }

    try {
      // First check if path exists
      const pathExists = await RNFS.exists(filePath);
      if (!pathExists) {
        console.debug(`[fileExists] Path does not exist: ${filePath}`);
        return false;
      }

      // Verify it's a file and not a directory
      const stats = await RNFS.stat(filePath);
      const isFile = stats.isFile();

      console.log('[fileExists]', {
        path: filePath,
        exists: true,
        isFile: isFile,
        size: stats.size,
        lastModified: new Date(stats.mtime).toISOString()
      });

      console.log("###isFile")
      console.log(isFile)

      return isFile;

    } catch (error) {
      console.error('[fileExists] Error checking file:', {
        path: filePath,
        error: {
          message: error.message,
          code: error.code,
          stack: error.stack
        }
      });
      return false;
    }
  }

  async pickFile() {
    const [picked] = await DocumentPicker.pick({
      type: [DocumentPicker.types.allFiles],
    });

    console.log(
      `[Log]  File picked: URI: ${picked.uri}, Type: ${picked.type}, Name: ${picked.name}, Size: ${picked.size}`,
    );

    let path = null;

    try {
      path = this.getPathByURI(picked.uri);
    } catch (err) {
      return Promise.reject('Fail to convert URI to realPath');
    }

    return {
      name: picked.name,
      path: path,
      size: picked.size,
      type: picked.type,
      uri: picked.uri,
    };
  }

  async uploadFile(file, _onUploadProgress) {
    try {
      const uploadFileItem = {
        name: 'file',
        filename: file.name,
        filepath: file.path,
        filetype: 'multipart/form-data',
      };

      const uploadFileOptions = {
        toUrl: fileUploadURL(config_key.token),
        files: [uploadFileItem],
        headers: {
          // 'Content-Type': 'multipart/form-data',
        },
        method: 'POST',
        progress: res => {
          _onUploadProgress(res.totalBytesSent, res.totalBytesExpectedToSend);
          console.log(
            '[Log]  File uploading ... ' +
            (((res.totalBytesSent / res.totalBytesExpectedToSend) * 100) |
              0) +
            '%',
          );
        },
      };

      const { jobId, promise } = RNFS.uploadFiles(uploadFileOptions);
      const result = await promise;
      const response = JSON.parse(result.body);

      if (response.success) {
        console.log(`[Log]  File updated to path = ${response.data}`);
        return `${serviceConfig.serverURL}/file/${response.data.data.filename}`;
      } else {
        console.error('[Error]  Fail to upload file');
        return Promise.reject('Fail to upload file');
      }
    } catch (err) {
      if (err.description == 'cancelled') {
        console.warn('[File]  User cancelled the upload');
      } else {
        console.error('[Error]  Fail to upload file', JSON.stringify(err));
        return Promise.reject('Fail to upload file');
      }
    }
  }

  async download(fromURL, savePath, _onDownloadProgress, setFileJobStatus) {
    console.log("#####fromURL")
    console.log(fromURL)
    console.log(savePath)
    try {
      const downloadOpts = {
        fromUrl: fromURL,
        toFile: savePath,
        progressInterval: 800,
        begin: res => {
          _onDownloadProgress(0, res.contentLength);
          setFileJobStatus(
            res.statusCode == 200
              ? FileJobStatus.progressing
              : FileJobStatus.failed,
          );
          console.log('[Log]  File download begins, jobId = ' + res.jobId);
        },
        progress: res => {
          _onDownloadProgress(res.bytesWritten, res.contentLength);
          console.log(
            '[Log]  File downloading ... ' +
            (((res.bytesWritten / res.contentLength) * 100) | 0) +
            '%',
          );
        },
      };
      const { jobId, promise } = RNFS.downloadFile(downloadOpts);
      const result = await promise;

      if (result.statusCode == 200) {
        setFileJobStatus(FileJobStatus.completed);
        console.log('[Log]  File downloaded to path = ' + savePath);
      } else {
        setFileJobStatus(FileJobStatus.failed);
        console.error('[Error]  Fail to download file');
        return Promise.reject('Fail to download file');
      }
    } catch (err) {
      if (err.description == 'cancelled') {
        console.warn('[File]  User cancelled the download');
      } else {
        console.error('[Error]  Fail to download file', JSON.stringify(err));
        return Promise.reject('Fail to download file');
      }
    }
  }
}
