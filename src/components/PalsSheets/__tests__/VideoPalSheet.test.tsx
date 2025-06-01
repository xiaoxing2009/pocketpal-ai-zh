import React from 'react';
import {fireEvent, waitFor} from '@testing-library/react-native';

import {render} from '../../../../jest/test-utils';
import {VideoPalSheet} from '../VideoPalSheet';
import {PalType} from '../types';
import {createModel} from '../../../../jest/fixtures/models';
import {palStore} from '../../../store';
// Mock the Sheet component following the established pattern
jest.mock('../../Sheet', () => {
  const {View, Button} = require('react-native');
  const MockSheet = ({children, isVisible, onClose, title}: any) => {
    if (!isVisible) {
      return null;
    }
    return (
      <View testID="sheet">
        <View testID="sheet-title">{title}</View>
        <Button title="Close" onPress={onClose} testID="sheet-close-button" />
        {children}
      </View>
    );
  };
  MockSheet.ScrollView = ({children}: any) => (
    <View testID="sheet-scroll-view">{children}</View>
  );
  MockSheet.Actions = ({children}: any) => (
    <View testID="sheet-actions">{children}</View>
  );
  return {Sheet: MockSheet};
});

describe('VideoPalSheet', () => {
  const defaultProps = {
    isVisible: true,
    onClose: jest.fn(),
  };

  const mockMultimodalModel = createModel({
    id: 'ggml-org/SmolVLM-500M-Instruct-GGUF/SmolVLM-500M-Instruct-Q8_0.gguf',
    name: 'SmolVLM-500M-Instruct',
    supportsMultimodal: true,
    isDownloaded: true,
  });

  const mockEditPal = {
    id: 'test-pal-id',
    name: 'Test Video Pal',
    defaultModel: mockMultimodalModel,
    useAIPrompt: false,
    systemPrompt: 'Test system prompt',
    originalSystemPrompt: '',
    isSystemPromptChanged: false,
    color: ['#FF0000', '#00FF00'] as [string, string],
    captureInterval: 2000,
    palType: PalType.VIDEO as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the store state
    palStore.pals = [];
  });

  describe('Visibility and Basic Rendering', () => {
    it('does not render when not visible', () => {
      const {queryByTestId} = render(
        <VideoPalSheet {...defaultProps} isVisible={false} />,
      );

      expect(queryByTestId('sheet')).toBeNull();
    });

    it('renders correctly when visible in create mode', () => {
      const {getByTestId, getByText} = render(
        <VideoPalSheet {...defaultProps} />,
        {withNavigation: true},
      );

      expect(getByTestId('sheet')).toBeTruthy();
      expect(getByTestId('sheet-title')).toBeTruthy();
      expect(getByText('Create')).toBeTruthy(); // Should show create button
    });

    it('renders correctly when visible in edit mode', () => {
      const {getByTestId, getByText} = render(
        <VideoPalSheet {...defaultProps} editPal={mockEditPal} />,
        {withNavigation: true},
      );

      expect(getByTestId('sheet')).toBeTruthy();
      expect(getByTestId('sheet-title')).toBeTruthy();
      expect(getByText('Save')).toBeTruthy(); // Should show save button in edit mode
    });
  });

  describe('Form Interactions', () => {
    it('calls onClose when close button is pressed', () => {
      const {getByTestId} = render(<VideoPalSheet {...defaultProps} />, {
        withNavigation: true,
      });

      const closeButton = getByTestId('sheet-close-button');
      fireEvent.press(closeButton);

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when cancel button is pressed', () => {
      const {getByText} = render(<VideoPalSheet {...defaultProps} />, {
        withNavigation: true,
      });

      const cancelButton = getByText('Cancel');
      fireEvent.press(cancelButton);

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Form Submission', () => {
    it('creates a new pal when form is submitted in create mode', async () => {
      const {getByText} = render(<VideoPalSheet {...defaultProps} />, {
        withNavigation: true,
      });

      const createButton = getByText('Create');
      fireEvent.press(createButton);

      await waitFor(() => {
        // Check if a pal was added by checking the store state
        expect(palStore.getPals().length).toBeGreaterThan(0);
      });

      // Verify the pal has the correct properties
      const addedPal = palStore.getPals()[0];
      expect(addedPal).toEqual(
        expect.objectContaining({
          palType: PalType.VIDEO,
          name: 'Lookie',
          captureInterval: 3000,
        }),
      );
    });

    it('updates an existing pal when form is submitted in edit mode', async () => {
      // Set up initial pal in store
      palStore.pals = [mockEditPal];

      const {getByText} = render(
        <VideoPalSheet {...defaultProps} editPal={mockEditPal} />,
        {withNavigation: true},
      );

      const saveButton = getByText('Save');
      fireEvent.press(saveButton);

      await waitFor(() => {
        // Check that the pal still exists (was updated, not deleted)
        expect(palStore.getPals().length).toBe(1);
      });

      // Verify the pal was updated
      const updatedPal = palStore
        .getPals()
        .find(pal => pal.id === mockEditPal.id);
      expect(updatedPal).toBeDefined();
      expect(updatedPal?.palType).toBe(PalType.VIDEO);
    });

    it('closes sheet after successful submission', async () => {
      const {getByText} = render(<VideoPalSheet {...defaultProps} />, {
        withNavigation: true,
      });

      const createButton = getByText('Create');
      fireEvent.press(createButton);

      await waitFor(() => {
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Basic Form Elements', () => {
    it('renders sheet structure correctly', () => {
      const {getByTestId} = render(<VideoPalSheet {...defaultProps} />, {
        withNavigation: true,
      });

      expect(getByTestId('sheet')).toBeTruthy();
      expect(getByTestId('sheet-scroll-view')).toBeTruthy();
      expect(getByTestId('sheet-actions')).toBeTruthy();
    });
  });
});
