import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 10,
  },
  listContainer: {
    paddingBottom: 150,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 4,
    gap: 1,
    justifyContent: 'flex-end',
  },
  filterIcon: {
    borderRadius: 8,
    marginHorizontal: 2,
  },
});
