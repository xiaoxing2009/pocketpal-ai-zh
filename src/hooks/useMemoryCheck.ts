import React, {useEffect, useState} from 'react';
import DeviceInfo from 'react-native-device-info';
import {Model} from '../utils/types';
import {formatBytes, L10nContext} from '../utils';

export const useMemoryCheck = (model: Model) => {
  const l10n = React.useContext(L10nContext);
  const [memoryWarning, setMemoryWarning] = useState('');
  const [shortMemoryWarning, setShortMemoryWarning] = useState('');

  useEffect(() => {
    const checkMemory = async () => {
      try {
        const totalMemory = await DeviceInfo.getTotalMemory();

        if (model.size >= 0.7 * totalMemory) {
          setShortMemoryWarning(l10n.shortMemoryWarning);
          setMemoryWarning(
            l10n.memoryWarning.replace(
              '{{totalMemory}}',
              formatBytes(totalMemory),
            ),
          );
        }
      } catch (error) {
        // TODO: Handle error appropriately
        console.error('Memory check failed:', error);
      }
    };

    checkMemory();
  }, [model.size, l10n]);

  return {memoryWarning, shortMemoryWarning};
};
