import React, {useState, useContext} from 'react';
import {
  View,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from 'react-native';

import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  Text,
  Card,
  Snackbar,
  Button,
  SegmentedButtons,
} from 'react-native-paper';

import {TextInput} from '../../components/TextInput';
import {useTheme} from '../../hooks';
import {createStyles} from './styles';
import {L10nContext} from '../../utils';
import {submitFeedback} from '../../api/feedback';

export const FeedbackScreen: React.FC = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets);
  const l10n = useContext(L10nContext);

  const [useCase, setUseCase] = useState('');
  const [featureRequests, setFeatureRequests] = useState('');
  const [generalFeedback, setGeneralFeedback] = useState('');
  const [email, setEmail] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [usageFrequency, setUsageFrequency] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setSnackbarMessage(l10n.feedback.success);
      setSnackbarVisible(true);
      // Clear form
      setUseCase('');
      setFeatureRequests('');
      setGeneralFeedback('');
      setEmail('');
      setUsageFrequency('');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : l10n.feedback.error.general;
      setSnackbarMessage(errorMessage);
      setSnackbarVisible(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <TouchableWithoutFeedback onPress={handleDismissKeyboard}>
        <ScrollView contentContainerStyle={styles.container}>
          <Card elevation={0} style={styles.card}>
            <Card.Content>
              <Text style={[styles.description, theme.fonts.bodyMedium]}>
                {l10n.feedback.description}
              </Text>

              <View style={styles.field}>
                <Text style={styles.label}>{l10n.feedback.useCase.label}</Text>
                <TextInput
                  value={useCase}
                  onChangeText={setUseCase}
                  placeholder={l10n.feedback.useCase.placeholder}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>
                  {l10n.feedback.featureRequests.label}
                </Text>
                <TextInput
                  value={featureRequests}
                  onChangeText={setFeatureRequests}
                  placeholder={l10n.feedback.featureRequests.placeholder}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>
                  {l10n.feedback.generalFeedback.label}
                </Text>
                <TextInput
                  value={generalFeedback}
                  onChangeText={setGeneralFeedback}
                  placeholder={l10n.feedback.generalFeedback.placeholder}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>
                  {l10n.feedback.usageFrequency.label}
                </Text>
                <SegmentedButtons
                  value={usageFrequency}
                  onValueChange={setUsageFrequency}
                  buttons={Object.entries(
                    l10n.feedback.usageFrequency.options,
                  ).map(([key, label]) => ({
                    value: key,
                    label,
                  }))}
                  density="medium"
                  style={styles.segmentedButtons}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>{l10n.feedback.email.label}</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder={l10n.feedback.email.placeholder}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <Button
                mode="contained"
                onPress={handleSubmit}
                style={styles.submitButton}
                loading={isSubmitting}
                disabled={isSubmitting}>
                {l10n.feedback.submit}
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
      </TouchableWithoutFeedback>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}>
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
};
