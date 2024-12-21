import axios from 'axios';
import {submitBenchmark} from '../benchmark';
import * as fb from '../../utils/fb';
import {urls} from '../../config';
import {DeviceInfo, BenchmarkResult} from '../../utils/types';

jest.mock('axios');
jest.mock('../../utils/fb');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedFb = fb as jest.Mocked<typeof fb>;

describe('submitBenchmark', () => {
  const mockDeviceInfo: DeviceInfo = {
    model: 'Test Phone',
    systemName: 'iOS',
    systemVersion: '16.0',
    brand: 'Apple',
    cpuArch: ['arm64'],
    isEmulator: false,
    version: '16.0',
    buildNumber: '20A362',
    device: 'iPhone14,2',
    deviceId: 'test-device-id',
    totalMemory: 6144,
    chipset: 'Apple A15',
    cpu: 'hexa-core',
    cpuDetails: {
      cores: 6,
      processors: [
        {
          processor: '0',
          'model name': 'Apple A15',
          'cpu MHz': '3200',
          vendor_id: 'Apple',
        },
      ],
      socModel: 'Apple A15',
      features: ['fp16', 'neon'],
      hasFp16: true,
      hasDotProd: true,
      hasSve: false,
      hasI8mm: true,
    },
  };

  const mockBenchmarkResult: BenchmarkResult = {
    config: {
      pp: 1,
      tg: 1,
      pl: 512,
      nr: 3,
      label: 'Test Config',
    },
    modelDesc: 'Test Model',
    modelSize: 1000000,
    modelNParams: 7000000000,
    ppAvg: 20.5,
    ppStd: 1.2,
    tgAvg: 30.5,
    tgStd: 2.1,
    timestamp: new Date().toISOString(),
    modelId: 'test-model-id',
    modelName: 'Test Model',
    filename: 'test-model.gguf',
    uuid: 'test-uuid',
  };

  const mockAppCheckToken = 'mock-app-check-token';
  const mockResponse = {
    data: {
      message: 'Success',
      id: 123,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockedFb.getAppCheckToken.mockResolvedValue(mockAppCheckToken);
    mockedAxios.post.mockResolvedValue(mockResponse);
  });

  it('should successfully submit benchmark data', async () => {
    const result = await submitBenchmark(mockDeviceInfo, mockBenchmarkResult);

    // Verify AppCheck initialization and token retrieval
    expect(mockedFb.initializeAppCheck).toHaveBeenCalled();
    expect(mockedFb.getAppCheckToken).toHaveBeenCalled();

    // Verify API call
    expect(mockedAxios.post).toHaveBeenCalledWith(
      urls.benchmarkSubmit(),
      {
        deviceInfo: mockDeviceInfo,
        benchmarkResult: mockBenchmarkResult,
      },
      {
        headers: {
          'X-Firebase-AppCheck': mockAppCheckToken,
          'Content-Type': 'application/json',
        },
      },
    );

    // Verify response
    expect(result).toEqual({
      message: 'Success',
      id: 123,
    });
  });

  it('should throw error when AppCheck token is not available', async () => {
    mockedFb.getAppCheckToken.mockResolvedValue('');

    await expect(
      submitBenchmark(mockDeviceInfo, mockBenchmarkResult),
    ).rejects.toThrow('Failed to obtain App Check token');

    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  it('should handle API errors', async () => {
    const error = new Error('Network error');
    mockedAxios.post.mockRejectedValue(error);

    await expect(
      submitBenchmark(mockDeviceInfo, mockBenchmarkResult),
    ).rejects.toThrow('Network error');
  });
});
