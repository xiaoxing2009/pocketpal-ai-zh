import axios from 'axios';
import {urls} from '../config';
import {getAppCheckToken, initializeAppCheck} from '../utils/fb';
import {BenchmarkResult, DeviceInfo} from '../utils/types';

type SubmissionData = {
  deviceInfo: DeviceInfo;
  benchmarkResult: BenchmarkResult;
};

export async function submitBenchmark(
  deviceInfo: DeviceInfo,
  benchmarkResult: BenchmarkResult,
): Promise<{message: string; id: number}> {
  try {
    initializeAppCheck();
    const appCheckToken = await getAppCheckToken();

    if (!appCheckToken) {
      throw new Error('Failed to obtain App Check token');
    }

    const data: SubmissionData = {
      deviceInfo,
      benchmarkResult,
    };

    const response = await axios.post(urls.benchmarkSubmit(), data, {
      headers: {
        'X-Firebase-AppCheck': appCheckToken,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting benchmark:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    throw error;
  }
}
