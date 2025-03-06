import React, {useContext, useRef, useEffect, useCallback} from 'react';
import {View, TextInput as RNTextInput} from 'react-native';
import {Button} from 'react-native-paper';
import {observer} from 'mobx-react-lite';
import {useForm, FormProvider, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';

import {Sheet} from '../Sheet/Sheet';
import {useTheme} from '../../hooks';
import {createStyles} from './styles';
import {L10nContext} from '../../utils';
import {palStore} from '../../store';
import {FormField} from './FormField';
import {SystemPromptSection} from './SystemPromptSection';
import {ColorSection} from './ColorSection';
import {ModelSelector} from './ModelSelector';
import {SectionDivider} from './SectionDivider';
import {roleplayFormSchema, PalType, type RoleplayFormData} from './types';
import {generateRoleplayPrompt} from './utils';

interface RoleplayPalSheetProps {
  isVisible: boolean;
  onClose: () => void;
  editPal?: RoleplayFormData & {id: string};
}

const INITIAL_STATE: Omit<RoleplayFormData, 'palType'> = {
  name: '',
  defaultModel: undefined,
  world: '',
  location: '',
  aiRole: '',
  userRole: '',
  situation: '',
  toneStyle: '',
  useAIPrompt: false,
  systemPrompt: '',
  isSystemPromptChanged: false,
  color: undefined,
  promptGenerationModel: undefined,
  generatingPrompt: '',
};

export const RoleplayPalSheet: React.FC<RoleplayPalSheetProps> = observer(
  ({isVisible, onClose, editPal}) => {
    const theme = useTheme();
    const styles = createStyles(theme);
    const l10n = useContext(L10nContext);

    const inputRefs = useRef<{[key: string]: RNTextInput | null}>({});

    const methods = useForm<RoleplayFormData>({
      resolver: zodResolver(roleplayFormSchema),
      defaultValues: {...INITIAL_STATE, palType: PalType.ROLEPLAY},
    });

    const resetForm = useCallback(() => {
      if (editPal) {
        methods.reset(editPal);
      } else {
        methods.reset({...INITIAL_STATE, palType: PalType.ROLEPLAY});
      }
    }, [editPal, methods]);

    useEffect(() => {
      resetForm();
    }, [resetForm]);

    const handleClose = () => {
      resetForm();
      onClose();
    };

    const validateRoleplayFields = async () => {
      let result = await methods.trigger([
        'world',
        'location',
        'aiRole',
        'userRole',
        'situation',
        'toneStyle',
      ]);

      const formState = methods.getValues();
      if (formState.useAIPrompt) {
        if (!formState.promptGenerationModel) {
          methods.setError('promptGenerationModel', {
            message: 'Prompt generation model is required',
          });
          result = false;
        }
      }
      return result;
    };

    const onSubmit = (data: RoleplayFormData) => {
      if (editPal) {
        palStore.updatePal(editPal.id, data);
      } else {
        palStore.addPal(data);
      }
      handleClose();
    };

    const updateSystemPromptOnFormChange = () => {
      // Use this custom template if use AI to generate checkbox is off
      if (!methods.getValues().useAIPrompt) {
        const systemPrompt = generateRoleplayPrompt(methods.getValues());
        methods.setValue('systemPrompt', systemPrompt);
        methods.setValue('originalSystemPrompt', systemPrompt);
      }
    };

    return (
      <Sheet
        title={`${editPal ? 'Edit' : 'Create'} Roleplay Pal`}
        isVisible={isVisible}
        displayFullHeight
        onClose={handleClose}>
        <FormProvider {...methods}>
          <Sheet.ScrollView
            bottomOffset={16}
            contentContainerStyle={styles.scrollviewContainer}>
            <View style={styles.form}>
              <View
                style={styles.innerForm}
                // @ts-ignore
                onBlur={updateSystemPromptOnFormChange}>
                <FormField
                  ref={ref => (inputRefs.current.name = ref)}
                  name="name"
                  label="Pal Name"
                  placeholder="Name"
                  required
                  onSubmitEditing={() =>
                    inputRefs.current.defaultModel?.focus()
                  }
                />

                <Controller
                  name="defaultModel"
                  control={methods.control}
                  render={({field: {onChange, value}, fieldState: {error}}) => (
                    <ModelSelector
                      value={value}
                      onChange={onChange}
                      label="Default Model"
                      placeholder="Select model"
                      error={!!error}
                      helperText={error?.message}
                      inputRef={ref => (inputRefs.current.defaultModel = ref)}
                      onSubmitEditing={() => inputRefs.current.world?.focus()}
                    />
                  )}
                />

                <SectionDivider label="Description" />

                <FormField
                  ref={ref => (inputRefs.current.world = ref)}
                  name="world"
                  label="World"
                  placeholder="Fantasy"
                  required
                  onSubmitEditing={() => inputRefs.current.location?.focus()}
                />

                <FormField
                  ref={ref => (inputRefs.current.location = ref)}
                  name="location"
                  label="Location"
                  placeholder="Enchanted Forest"
                  sublabel="Where does the story take place?"
                  required
                  onSubmitEditing={() => inputRefs.current.aiRole?.focus()}
                />

                <FormField
                  ref={ref => (inputRefs.current.aiRole = ref)}
                  name="aiRole"
                  label="AI's Role"
                  placeholder="Eldara, a mischievous forest sprite"
                  sublabel="Set the role for character"
                  required
                  onSubmitEditing={() => inputRefs.current.userRole?.focus()}
                />

                <FormField
                  ref={ref => (inputRefs.current.userRole = ref)}
                  name="userRole"
                  label="User Role"
                  placeholder="Sir Elandor, a brave knight"
                  sublabel="Who are you?"
                  required
                  onSubmitEditing={() => inputRefs.current.situation?.focus()}
                />

                <FormField
                  ref={ref => (inputRefs.current.situation = ref)}
                  name="situation"
                  label="Situation"
                  placeholder="Rescue mission, solving a mystery"
                  required
                  onSubmitEditing={() => inputRefs.current.toneStyle?.focus()}
                />

                <FormField
                  ref={ref => (inputRefs.current.toneStyle = ref)}
                  name="toneStyle"
                  label="Tone/Style"
                  placeholder="Serious"
                  required
                />
              </View>

              <SystemPromptSection
                hideGeneratingPrompt
                validateFields={validateRoleplayFields}
                closeSheet={handleClose}
              />
              <ColorSection />
            </View>
          </Sheet.ScrollView>

          <Sheet.Actions>
            <View style={styles.actions}>
              <Button
                style={styles.actionBtn}
                mode="text"
                onPress={handleClose}>
                {l10n.cancel}
              </Button>
              <Button
                style={styles.actionBtn}
                mode="contained"
                onPress={methods.handleSubmit(onSubmit)}>
                {editPal ? l10n.save : 'Create'}
              </Button>
            </View>
          </Sheet.Actions>
        </FormProvider>
      </Sheet>
    );
  },
);
