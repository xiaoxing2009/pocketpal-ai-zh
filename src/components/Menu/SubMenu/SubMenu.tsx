import React from 'react';

import {Menu as PaperMenu} from 'react-native-paper';

import {useTheme} from '../../../hooks';

import {createStyles} from './styles';

interface SubMenuProps {
  visible: boolean;
  onDismiss: () => void;
  children: React.ReactNode;
  anchorPosition?: {x: number; y: number};
}

export const SubMenu: React.FC<SubMenuProps> = ({
  visible,
  onDismiss,
  children,
  anchorPosition,
}) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <PaperMenu
      visible={visible}
      onDismiss={onDismiss}
      anchor={anchorPosition}
      style={styles.menu}
      contentStyle={styles.content}>
      {children}
    </PaperMenu>
  );
};

/**
 * SubMenu component for nested menu items.
 *
 * Usage example:
 * ```tsx
 * <Menu.Item
 *   label="Advanced"
 *   submenu={[
 *     <Menu.Item
 *       key="1"
 *       label="Option 1"
 *     />,
 *     // Nested submenu
 *     <Menu.Item
 *       label="More Options"
 *       submenu={[
 *         <Menu.Item key="2.1" label="Sub Option 1" />,
 *         <Menu.Item key="2.2" label="Sub Option 2" />,
 *       ]}
 *     />,
 *     <Menu.Item
 *       key="3"
 *       label="Option 3"
 *     />,
 *   ]}
 * />
 * ```
 *
 * Features:
 * - Supports infinite nesting of submenus
 * - Parent menu dims when submenu is open
 * - Maintains consistent styling with parent menu
 */
