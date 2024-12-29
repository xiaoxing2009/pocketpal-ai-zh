import React, {useEffect, useState} from 'react';
import {View, TouchableOpacity} from 'react-native';
import {Platform, NativeModules} from 'react-native';

import {Card, Text, Icon} from 'react-native-paper';
import RNDeviceInfo from 'react-native-device-info';

import {Divider} from '../../../components';

import {useTheme} from '../../../hooks';

import {createStyles} from './styles';

import {DeviceInfo} from '../../../utils/types';

const {DeviceInfoModule} = NativeModules;

const getChipsetInfo = async () => {
  if (Platform.OS !== 'android' || !DeviceInfoModule) {
    return '';
  }
  try {
    return await DeviceInfoModule.getChipset();
  } catch (e) {
    console.warn('Failed to get chipset info:', e);
    return '';
  }
};

const getCPUInfo = async () => {
  if (!DeviceInfoModule) {
    console.warn('DeviceInfoModule not available');
    return {
      cores: 0,
      processors: [],
      features: [],
      socModel: '',
      hasFp16: false,
      hasDotProd: false,
      hasSve: false,
      hasI8mm: false,
    };
  }
  try {
    const info = await DeviceInfoModule.getCPUInfo();
    if (!info) {
      return null;
    }

    return Platform.OS === 'ios'
      ? {
          cores: info.cores || 0,
          processors: [],
          features: [],
          socModel: '',
          hasFp16: false,
          hasDotProd: false,
          hasSve: false,
          hasI8mm: false,
        }
      : info;
  } catch (e) {
    console.warn('Failed to get CPU info:', e);
    return null;
  }
};

type Props = {
  onDeviceInfo?: (info: DeviceInfo) => void;
  testId?: string;
};

export const DeviceInfoCard = ({onDeviceInfo, testId}: Props) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [deviceInfo, setDeviceInfo] = useState({
    model: RNDeviceInfo.getModel(),
    systemName: Platform.OS === 'ios' ? 'iOS' : 'Android',
    systemVersion: String(Platform.Version || ''),
    brand: RNDeviceInfo.getBrand(),
    cpuArch: [] as string[],
    isEmulator: false,
    version: RNDeviceInfo.getVersion(),
    buildNumber: RNDeviceInfo.getBuildNumber(),
    device: '',
    deviceId: '',
    totalMemory: 0,
    chipset: '',
    cpu: '',
    cpuDetails: {
      cores: 0,
      processors: [] as Array<{
        processor: string;
        'model name': string;
        'cpu MHz': string;
        vendor_id: string;
      }>,
      socModel: '',
      features: [] as string[],
      hasFp16: false,
      hasDotProd: false,
      hasSve: false,
      hasI8mm: false,
    },
  });
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    Promise.all([
      RNDeviceInfo.supportedAbis(),
      RNDeviceInfo.isEmulator(),
      RNDeviceInfo.getDevice(),
      RNDeviceInfo.getDeviceId(),
      RNDeviceInfo.getTotalMemory(),
      getChipsetInfo(),
      getCPUInfo(),
    ]).then(
      ([abis, emulator, device, deviceId, totalMem, chipset, cpuInfo]) => {
        const newDeviceInfo = {
          model: RNDeviceInfo.getModel(),
          systemName: Platform.OS === 'ios' ? 'iOS' : 'Android',
          systemVersion: String(Platform.Version || ''),
          brand: RNDeviceInfo.getBrand(),
          version: RNDeviceInfo.getVersion(),
          buildNumber: RNDeviceInfo.getBuildNumber(),
          cpuArch: abis,
          isEmulator: emulator,
          device,
          deviceId,
          totalMemory: totalMem,
          chipset,
          cpu: '',
          cpuDetails:
            typeof cpuInfo === 'object'
              ? cpuInfo
              : {
                  cores: 0,
                  processors: [],
                  socModel: '',
                  features: [],
                  hasFp16: false,
                  hasDotProd: false,
                  hasSve: false,
                  hasI8mm: false,
                },
        };

        setDeviceInfo(newDeviceInfo);
        onDeviceInfo?.(newDeviceInfo);
      },
    );
  }, [onDeviceInfo]);

  const formatBytes = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} GB`;
  };

  return (
    <Card
      testID={testId ?? 'device-info-card'}
      elevation={0}
      style={styles.deviceInfoCard}>
      <TouchableOpacity onPress={() => setExpanded(!expanded)}>
        <View style={styles.headerRow}>
          <View style={styles.headerContent}>
            <Text variant="titleSmall">Device Information</Text>
            <Text variant="bodySmall" style={styles.headerSummary}>
              {deviceInfo.brand} {deviceInfo.model} • {deviceInfo.systemName}{' '}
              {deviceInfo.systemVersion}
            </Text>
            <Text variant="bodySmall" style={styles.headerSummary}>
              {deviceInfo.cpuDetails.cores} cores •{' '}
              {formatBytes(deviceInfo.totalMemory)}
            </Text>
          </View>
          <Icon
            source={expanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color={theme.colors.onSurface}
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <>
          <Divider />
          <Card.Content>
            <View style={styles.section}>
              <Text variant="labelSmall" style={styles.sectionTitle}>
                Basic Info
              </Text>
              <View style={styles.deviceInfoRow}>
                <Text variant="labelSmall" style={styles.deviceInfoLabel}>
                  Architecture
                </Text>
                <Text variant="bodySmall" style={styles.deviceInfoValue}>
                  {Array.isArray(deviceInfo.cpuArch)
                    ? deviceInfo.cpuArch.join(', ')
                    : deviceInfo.cpuArch}
                </Text>
              </View>
              <View style={styles.deviceInfoRow}>
                <Text variant="labelSmall" style={styles.deviceInfoLabel}>
                  Total Memory
                </Text>
                <Text variant="bodySmall" style={styles.deviceInfoValue}>
                  {formatBytes(deviceInfo.totalMemory)}
                </Text>
              </View>
              <View style={styles.deviceInfoRow}>
                <Text variant="labelSmall" style={styles.deviceInfoLabel}>
                  Device ID
                </Text>
                <Text variant="bodySmall" style={styles.deviceInfoValue}>
                  {Platform.OS === 'ios'
                    ? deviceInfo.deviceId
                    : `${deviceInfo.device} (${deviceInfo.deviceId})`}
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text variant="labelSmall" style={styles.sectionTitle}>
                CPU Details
              </Text>
              <View style={styles.deviceInfoRow}>
                <Text variant="labelSmall" style={styles.deviceInfoLabel}>
                  CPU Cores
                </Text>
                <Text variant="bodySmall" style={styles.deviceInfoValue}>
                  {deviceInfo.cpuDetails.cores}
                </Text>
              </View>
              {deviceInfo.cpuDetails.processors[0]?.['model name'] && (
                <View style={styles.deviceInfoRow}>
                  <Text variant="labelSmall" style={styles.deviceInfoLabel}>
                    CPU Model
                  </Text>
                  <Text variant="bodySmall" style={styles.deviceInfoValue}>
                    {deviceInfo.cpuDetails.processors[0]['model name']}
                  </Text>
                </View>
              )}
              {Platform.OS === 'android' && deviceInfo.chipset && (
                <View style={styles.deviceInfoRow}>
                  <Text variant="labelSmall" style={styles.deviceInfoLabel}>
                    Chipset
                  </Text>
                  <Text variant="bodySmall" style={styles.deviceInfoValue}>
                    {deviceInfo.chipset}
                  </Text>
                </View>
              )}
              {Platform.OS === 'android' && (
                <View style={styles.deviceInfoRow}>
                  <Text variant="labelSmall" style={styles.deviceInfoLabel}>
                    Instructions
                  </Text>
                  <Text variant="bodySmall" style={styles.deviceInfoValue}>
                    FP16: {deviceInfo.cpuDetails.hasFp16 ? '✓' : '✗'}, DotProd:{' '}
                    {deviceInfo.cpuDetails.hasDotProd ? '✓' : '✗'}, SVE:{' '}
                    {deviceInfo.cpuDetails.hasSve ? '✓' : '✗'}, I8MM:{' '}
                    {deviceInfo.cpuDetails.hasI8mm ? '✓' : '✗'}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.section}>
              <Text variant="labelSmall" style={styles.sectionTitle}>
                App Info
              </Text>
              <View style={styles.deviceInfoRow}>
                <Text variant="labelSmall" style={styles.deviceInfoLabel}>
                  Version
                </Text>
                <Text variant="bodySmall" style={styles.deviceInfoValue}>
                  {deviceInfo.version} ({deviceInfo.buildNumber})
                </Text>
              </View>
            </View>
          </Card.Content>
        </>
      )}
    </Card>
  );
};
