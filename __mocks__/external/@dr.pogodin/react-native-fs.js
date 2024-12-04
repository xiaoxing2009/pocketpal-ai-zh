export const mkdir = jest.fn();
export const unlink = jest.fn();
export const exists = jest.fn();
export const stopDownload = jest.fn();
export const readFile = jest.fn(path => {
  if (path.includes('session-metadata.json')) {
    // Return valid session metadata JSON
    return Promise.resolve(
      JSON.stringify([
        {
          id: '1',
          title: 'Test Session',
          date: '2024-01-01T00:00:00Z',
          messages: [],
        },
      ]),
    );
  }

  // Handle other required file.
  return Promise.resolve('Some default content');
});
export const writeFile = jest.fn((path, data) => {
  return Promise.resolve();
});
export const downloadFile = jest.fn();
export const DocumentDirectoryPath = '/path/to/documents';
export const copyFile = jest.fn().mockResolvedValue(true);

// Add namespace export for compatibility
const RNFS = {
  mkdir,
  unlink,
  exists,
  stopDownload,
  readFile,
  writeFile,
  downloadFile,
  DocumentDirectoryPath,
  copyFile,
};

export {RNFS};
