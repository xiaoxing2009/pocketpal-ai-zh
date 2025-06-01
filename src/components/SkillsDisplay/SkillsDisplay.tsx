import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import {Text, IconButton} from 'react-native-paper';

import {useTheme} from '../../hooks';
import {getModelSkills, SkillItem} from '../../utils';
import {L10nContext} from '../../utils';

import {createStyles} from './styles';

interface SkillsDisplayProps {
  model: {
    capabilities?: string[];
    supportsMultimodal?: boolean;
  };
  onVisionPress?: () => void;
  showLabel?: boolean;
  compact?: boolean;
}

export const SkillsDisplay: React.FC<SkillsDisplayProps> = ({
  model,
  onVisionPress,
  showLabel = true,
  compact = false,
}) => {
  const l10n = React.useContext(L10nContext);
  const theme = useTheme();
  const styles = createStyles(theme, compact);

  const skills = getModelSkills(model);

  if (!skills.length) {
    return null;
  }

  const renderSkillItem = (skill: SkillItem) => {
    const isVision = skill.key === 'vision';
    const isClickable = isVision && onVisionPress;
    const color = theme.colors[skill.color || 'primary'];

    // Get localized label
    const label =
      l10n.models.modelCapabilities[
        skill.labelKey as keyof typeof l10n.models.modelCapabilities
      ] || skill.labelKey;

    const skillContent = (
      <View style={[styles.skillItem, skill.isSpecial && styles.specialSkill]}>
        {skill.icon && (
          <IconButton
            icon={skill.icon}
            size={compact ? 10 : 12}
            iconColor={color}
            style={styles.skillIcon}
          />
        )}
        <Text
          style={[
            styles.skillText,
            skill.isSpecial && styles.specialSkillText,
            {color},
          ]}>
          {label}
        </Text>
      </View>
    );

    if (isClickable) {
      return (
        <TouchableOpacity
          testID="vision-skill-touchable"
          key={skill.key}
          onPress={onVisionPress}
          activeOpacity={0.7}>
          {skillContent}
        </TouchableOpacity>
      );
    }

    return <View key={skill.key}>{skillContent}</View>;
  };

  const renderSkillsText = () => {
    const textSkills = skills.filter(skill => !skill.isSpecial);
    if (!textSkills.length) {
      return null;
    }

    const hasSpecialSkills = skills.some(skill => skill.isSpecial);
    const prefix = hasSpecialSkills ? '• ' : '';

    return (
      <Text style={styles.skillsText}>
        {prefix}
        {textSkills
          .map(skill => {
            const label =
              l10n.models.modelCapabilities[
                skill.labelKey as keyof typeof l10n.models.modelCapabilities
              ] || skill.labelKey;
            return label;
          })
          .join(', ')}
      </Text>
    );
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={model.supportsMultimodal ? onVisionPress : undefined}
      activeOpacity={model.supportsMultimodal ? 0.7 : 1}>
      <View style={styles.skillsRow}>
        {showLabel && (
          <Text style={styles.skillsLabel}>
            {l10n.models.modelCard.labels.skills}
          </Text>
        )}

        {/* Render special skills (like vision) with icons */}
        {skills
          .filter(skill => skill.isSpecial)
          .map(skill => renderSkillItem(skill))}

        {/* Render regular skills as text */}
        {renderSkillsText()}
      </View>
    </TouchableOpacity>
  );
};
