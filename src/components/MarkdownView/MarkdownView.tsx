import {View, Text} from 'react-native';
import React, {useMemo} from 'react';

import {marked} from 'marked';
import RenderHtml, {
  defaultSystemFonts,
  HTMLContentModel,
  HTMLElementModel,
} from 'react-native-render-html';

import {useTheme} from '../../hooks';

import {createTagsStyles, createStyles} from './styles';

marked.use({
  langPrefix: 'language-',
  mangle: false,
  headerIds: false,
});

interface MarkdownViewProps {
  markdownText: string;
  maxMessageWidth: number;
  //isComplete: boolean; // indicating if message is complete
  selectable?: boolean;
}

const ThinkRenderer = ({TDefaultRenderer, ...props}, styles) => (
  <View style={styles.thinkContainer}>
    <View style={styles.thinkTextContainer}>
      <Text style={styles.thinkText}>💭 Thinking...</Text>
    </View>
    <TDefaultRenderer {...props} />
  </View>
);

export const MarkdownView: React.FC<MarkdownViewProps> = React.memo(
  ({markdownText, maxMessageWidth, selectable = false}) => {
    const _maxWidth = maxMessageWidth;

    const theme = useTheme();
    const tagsStyles = useMemo(() => createTagsStyles(theme), [theme]);
    const styles = createStyles(theme);

    const customHTMLElementModels = useMemo(
      () => ({
        think: HTMLElementModel.fromCustomModel({
          tagName: 'think',
          contentModel: HTMLContentModel.block,
        }),
      }),
      [],
    );

    const renderers = useMemo(
      () => ({
        think: props => ThinkRenderer(props, styles),
      }),
      [styles],
    );

    const defaultTextProps = useMemo(
      () => ({
        selectable,
        userSelect: selectable ? 'text' : 'none',
      }),
      [selectable],
    );
    const systemFonts = useMemo(() => defaultSystemFonts, []);

    const contentWidth = useMemo(() => _maxWidth, [_maxWidth]);

    const htmlContent = useMemo(() => marked(markdownText), [markdownText]);
    const source = useMemo(() => ({html: htmlContent}), [htmlContent]);

    return (
      <View testID="chatMarkdownScrollView" style={{maxWidth: _maxWidth}}>
        <RenderHtml
          contentWidth={contentWidth}
          source={source}
          tagsStyles={tagsStyles}
          defaultTextProps={defaultTextProps}
          systemFonts={systemFonts}
          customHTMLElementModels={customHTMLElementModels}
          renderers={renderers}
        />
      </View>
    );
  },
  (prevProps, nextProps) =>
    prevProps.markdownText === nextProps.markdownText &&
    //prevProps.isComplete === nextProps.isComplete &&
    prevProps.maxMessageWidth === nextProps.maxMessageWidth &&
    prevProps.selectable === nextProps.selectable,
);
