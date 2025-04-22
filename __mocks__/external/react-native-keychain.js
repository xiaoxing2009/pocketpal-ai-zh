export default {
  setGenericPassword: jest.fn(() => Promise.resolve('mockPass')),
  getGenericPassword: jest.fn(() => Promise.resolve('mockPass')),
  resetGenericPassword: jest.fn(() => Promise.resolve(null)),
};
