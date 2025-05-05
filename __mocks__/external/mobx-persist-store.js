// Mock the named export
export const makePersistable = jest.fn().mockImplementation(() => {
  return Promise.resolve();
});
