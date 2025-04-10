import React, {useState, useContext} from 'react';
import {View, ScrollView, TouchableOpacity, Alert, Linking} from 'react-native';

import DeviceInfo from 'react-native-device-info';
import Clipboard from '@react-native-clipboard/clipboard';
import {Text, Button, SegmentedButtons} from 'react-native-paper';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';

import {submitFeedback} from '../../api/feedback';

import {
  CopyIcon,
  GithubIcon,
  ChevronRightIcon,
  HeartIcon,
} from '../../assets/icons';

import {Sheet, TextInput} from '../../components';
import {useTheme} from '../../hooks';
import {createStyles} from './styles';
import {L10nContext} from '../../utils';

export const AboutScreen: React.FC = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets);
  const l10n = useContext(L10nContext);
  const [showFeedback, setShowFeedback] = useState(false);

  const [appInfo, setAppInfo] = React.useState({
    version: '',
    build: '',
  });

  const [useCase, setUseCase] = useState('');
  const [featureRequests, setFeatureRequests] = useState('');
  const [generalFeedback, setGeneralFeedback] = useState('');
  const [email, setEmail] = useState('');
  const [usageFrequency, setUsageFrequency] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    const version = DeviceInfo.getVersion();
    const buildNumber = DeviceInfo.getBuildNumber();
    setAppInfo({
      version,
      build: buildNumber,
    });
  }, []);

  const copyVersionToClipboard = () => {
    const versionString = `Version ${appInfo.version} (${appInfo.build})`;
    Clipboard.setString(versionString);
    Alert.alert(
      'Version copied',
      'Version information has been copied to clipboard',
    );
  };

  const handleSubmit = async () => {
    if (!useCase && !featureRequests && !generalFeedback) {
      Alert.alert(l10n.feedback.validation.required);
      return;
    }

    setIsSubmitting(true);
    try {
      await submitFeedback({
        useCase,
        featureRequests,
        generalFeedback,
        usageFrequency,
        email: email || undefined,
      });
      Alert.alert('Success', l10n.feedback.success);
      setShowFeedback(false);
      // Clear form
      setUseCase('');
      setFeatureRequests('');
      setGeneralFeedback('');
      setEmail('');
      setUsageFrequency('');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : l10n.feedback.error.general;
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text variant="titleLarge" style={styles.title}>
                PocketPal AI
              </Text>
              <Text variant="bodyMedium" style={styles.description}>
                An app that brings language models directly to your phone. Sits
                on the shoulders of llama.cpp and llama.rn.
              </Text>
              <View style={styles.versionContainer}>
                <TouchableOpacity
                  style={styles.versionButton}
                  onPress={copyVersionToClipboard}>
                  <Text style={styles.versionText}>
                    v{appInfo.version} ({appInfo.build})
                  </Text>
                  <CopyIcon
                    width={16}
                    height={16}
                    stroke={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support the Project</Text>
            <Text variant="bodyMedium" style={styles.description}>
              If you enjoy using PocketPal AI, please consider supporting the
              project by:
            </Text>
            <Button
              mode="outlined"
              onPress={() =>
                Linking.openURL('https://github.com/a-ghorbani/pocketpal-ai')
              }
              style={styles.actionButton}
              icon={() => <GithubIcon stroke={theme.colors.primary} />}>
              Star on GitHub
            </Button>
            <Text style={styles.orText}>or</Text>
            <TouchableOpacity
              style={styles.supportButton}
              onPress={() =>
                Linking.openURL('https://www.buymeacoffee.com/aghorbani')
              }>
              <HeartIcon stroke={theme.colors.onPrimary} />
              <Text style={styles.supportButtonText}>Become a Sponsor</Text>
            </TouchableOpacity>
            <Text style={styles.orText}>or by</Text>
            <Button
              mode="outlined"
              style={styles.actionButton}
              contentStyle={{flexDirection: 'row-reverse'}}
              icon={() => <ChevronRightIcon stroke={theme.colors.primary} />}
              onPress={() => setShowFeedback(true)}>
              <Text style={styles.feedbackButtonText}>
                Sharing your thoughts
              </Text>
            </Button>
          </View>
        </View>
      </ScrollView>

      <Sheet
        title="Share your feedback"
        isVisible={showFeedback}
        onClose={() => setShowFeedback(false)}>
        <Sheet.ScrollView>
          <View style={styles.feedbackForm}>
            <View style={styles.field}>
              <Text style={styles.label}>How do you use PocketPal AI?</Text>
              <TextInput
                value={useCase}
                onChangeText={setUseCase}
                placeholder="Tell us about your use case"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Feature Requests</Text>
              <TextInput
                value={featureRequests}
                onChangeText={setFeatureRequests}
                placeholder="What features would you like to see?"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>General Feedback</Text>
              <TextInput
                value={generalFeedback}
                onChangeText={setGeneralFeedback}
                placeholder="Share your thoughts and suggestions"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>
                How often do you use PocketPal AI?
              </Text>
              <SegmentedButtons
                value={usageFrequency}
                onValueChange={setUsageFrequency}
                buttons={[
                  {value: 'daily', label: 'Daily'},
                  {value: 'weekly', label: 'Weekly'},
                  {value: 'monthly', label: 'Monthly'},
                  {value: 'rarely', label: 'Rarely'},
                ]}
                style={styles.segmentedButtons}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email (optional)</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Your email address"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={isSubmitting}
              disabled={isSubmitting}
              style={styles.submitButton}>
              Submit Feedback
            </Button>
          </View>
        </Sheet.ScrollView>
      </Sheet>
    </SafeAreaView>
  );
};
