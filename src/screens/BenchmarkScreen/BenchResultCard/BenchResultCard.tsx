import React, {useState} from 'react';
import {View, Linking} from 'react-native';

import {Card, Text, Button, Tooltip} from 'react-native-paper';

import {useTheme} from '../../../hooks';

import {createStyles} from './styles';

import {BenchmarkResult} from '../../../utils/types';
import {formatBytes, formatNumber} from '../../../utils';
import {NetworkError, AppCheckError, ServerError} from '../../../utils/errors';

type Props = {
  result: BenchmarkResult;
  onDelete: (timestamp: string) => void;
  onShare: (result: BenchmarkResult) => Promise<void>;
};

type ErrorType = 'network' | 'appCheck' | 'server' | 'generic' | null;

export const BenchResultCard = ({result, onDelete, onShare}: Props) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<ErrorType>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    setErrorType(null);

    try {
      await onShare(result);
    } catch (error) {
      if (error instanceof NetworkError) {
        setErrorType('network');
        setSubmitError(error.message);
      } else if (error instanceof AppCheckError) {
        setErrorType('appCheck');
        setSubmitError(error.message);
      } else if (error instanceof ServerError) {
        setErrorType('server');
        setSubmitError(error.message);
      } else {
        setErrorType('generic');
        setSubmitError(
          error instanceof Error ? error.message : 'Failed to submit benchmark',
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) {
      return `${ms}ms`;
    }
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  };

  const openLeaderboard = () => {
    Linking.openURL(
      'https://huggingface.co/spaces/a-ghorbani/ai-phone-leaderboard',
    );
  };

  const getErrorIcon = () => {
    switch (errorType) {
      case 'network':
        return '📶'; // wifi icon
      case 'appCheck':
        return '🔒'; // lock icon
      case 'server':
        return '🖥️'; // server icon
      default:
        return '❌'; // generic error icon
    }
  };

  const getRetryText = () => {
    switch (errorType) {
      case 'network':
        return 'Check connection & retry';
      case 'appCheck':
        return 'Retry submission';
      case 'server':
        return 'Try again later';
      default:
        return 'Retry';
    }
  };

  const getErrorStyle = () => {
    if (!errorType) {
      return styles.errorGeneric;
    }

    const capitalized = errorType.charAt(0).toUpperCase() + errorType.slice(1);

    return styles[`error${capitalized}`] || styles.errorGeneric;
  };

  return (
    <Card elevation={0} style={styles.resultCard}>
      <Card.Content>
        <View style={styles.resultHeader}>
          <View style={styles.headerLeft}>
            <Text variant="titleSmall" style={styles.modelName}>
              {result.modelName}
            </Text>
            <Text style={styles.modelMeta}>
              {formatBytes(result.modelSize)} •{' '}
              {formatNumber(result.modelNParams, 2, true, false)} params
            </Text>
          </View>
          <Button
            testID="delete-result-button"
            mode="text"
            onPress={() => onDelete(result.timestamp)}
            icon="delete"
            compact
            style={styles.deleteButton}>
            {''}
          </Button>
        </View>

        <View style={styles.configContainer}>
          <View style={styles.configBar}>
            <Text variant="labelSmall">Benchmark Config</Text>
            <Text style={styles.configText}>
              PP: {result.config.pp} • TG: {result.config.tg} • PL:{' '}
              {result.config.pl} • Rep: {result.config.nr}
            </Text>
          </View>

          {result.initSettings && (
            <View style={styles.configBar}>
              <Text variant="labelSmall">Model Settings</Text>
              <View style={styles.configTextContainer}>
                <Text style={styles.configText}>
                  Context: {result.initSettings.n_context} • Batch:{' '}
                  {result.initSettings.n_batch} • UBatch:{' '}
                  {result.initSettings.n_ubatch}
                </Text>
                <Text style={styles.configText}>
                  CPU Threads: {result.initSettings.n_threads} • GPU Layers:{' '}
                  {result.initSettings.n_gpu_layers}
                </Text>
                {result.initSettings.flash_attn ? (
                  <Text style={styles.configText}>
                    Flash Attention Enabled • Cache Types:{' '}
                    {result.initSettings.cache_type_k}/
                    {result.initSettings.cache_type_v}
                  </Text>
                ) : (
                  <Text style={styles.configText}>
                    Flash Attention Disabled
                  </Text>
                )}
              </View>
            </View>
          )}
        </View>

        <View style={styles.resultsContainer}>
          <View style={styles.resultRow}>
            <View style={styles.resultItem}>
              <Text style={styles.resultValue}>
                {result.ppAvg.toFixed(2)}
                <Text style={styles.resultUnit}> t/s</Text>
              </Text>
              <Text style={styles.resultLabel}>Prompt Processing</Text>
              <Text style={styles.resultStd}>±{result.ppStd.toFixed(2)}</Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultValue}>
                {result.tgAvg.toFixed(2)}
                <Text style={styles.resultUnit}> t/s</Text>
              </Text>
              <Text style={styles.resultLabel}>Token Generation</Text>
              <Text style={styles.resultStd}>±{result.tgStd.toFixed(2)}</Text>
            </View>
          </View>

          {(result.wallTimeMs || result.peakMemoryUsage) && (
            <View style={styles.resultRow}>
              {result.wallTimeMs && (
                <View style={styles.resultItem}>
                  <Text style={styles.resultValue}>
                    {formatDuration(result.wallTimeMs)}
                  </Text>
                  <Text style={styles.resultLabel}>Total Time</Text>
                </View>
              )}
              {result.peakMemoryUsage && (
                <View style={styles.resultItem}>
                  <Text style={styles.resultValue}>
                    {result.peakMemoryUsage.percentage.toFixed(1)}%
                  </Text>
                  <Text style={styles.resultLabel}>Peak Memory</Text>
                  <Text style={styles.resultStd}>
                    {formatBytes(result.peakMemoryUsage.used, 0)} /{' '}
                    {formatBytes(result.peakMemoryUsage.total, 0)}
                  </Text>
                </View>
              )}
            </View>
          )}
          <Text style={styles.timestamp}>
            {new Date(result.timestamp).toLocaleString()}
          </Text>
        </View>

        <View style={styles.footer}>
          {result.submitted ? (
            <View style={styles.shareContainer}>
              <Text variant="bodySmall" style={styles.submittedText}>
                ✓ Shared to{' '}
                <Text onPress={openLeaderboard} style={styles.leaderboardLink}>
                  AI Phone Leaderboard ↗
                </Text>
              </Text>
            </View>
          ) : !result.oid ? (
            <Tooltip title="Local model results cannot be shared">
              <View style={styles.tooltipContainer}>
                <Text variant="bodySmall" style={styles.disabledText}>
                  Cannot share
                </Text>
                <Text style={styles.infoIcon}>ⓘ</Text>
              </View>
            </Tooltip>
          ) : (
            <View style={styles.actionContainer}>
              <Button
                testID="submit-benchmark-button"
                mode="outlined"
                onPress={handleSubmit}
                loading={isSubmitting}
                disabled={isSubmitting}
                icon="share"
                compact
                style={styles.submitButton}>
                Submit to Leaderboard
              </Button>
              <Text
                variant="bodySmall"
                onPress={openLeaderboard}
                style={styles.leaderboardLink}>
                View leaderboard ↗
              </Text>
            </View>
          )}
        </View>

        {submitError && (
          <View style={[styles.errorContainer, getErrorStyle()]}>
            <Text style={styles.errorText}>
              {getErrorIcon()} {submitError}
            </Text>
            {errorType && (
              <Button
                mode="text"
                onPress={handleSubmit}
                disabled={isSubmitting || errorType === 'server'}
                compact
                style={styles.retryButton}>
                {getRetryText()}
              </Button>
            )}
          </View>
        )}
      </Card.Content>
    </Card>
  );
};
