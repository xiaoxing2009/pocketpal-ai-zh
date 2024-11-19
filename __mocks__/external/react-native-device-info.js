import {deviceInfo} from '../../jest/fixtures/device-info';

export default {
  getUniqueId: jest.fn(() => 'unique-id'),
  getManufacturer: jest.fn(() => 'Apple'),
  getModel: jest.fn(() => 'iPhone 12'),
  getSystemVersion: jest.fn(() => '14.5'),
  getFreeDiskStorage: jest.fn(() => deviceInfo.freeDiskStorage),
  getTotalMemory: jest.fn(() => deviceInfo.totalMemory),
  getUsedMemory: jest.fn(() => deviceInfo.usedMemory),
  getVersion: jest.fn(() => deviceInfo.version),
  getBuildNumber: jest.fn(() => deviceInfo.buildNumber),
  // Not all methods are mocked, add any other methods from react-native-device-info that you use in your code
};
