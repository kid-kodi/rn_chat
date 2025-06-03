import { StyleSheet } from 'react-native'
import Colors from '../../constants/Colors';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    flex: 1,
  },
  noResultsIcon: {
    marginBottom: 20,
  },
  noResultsText: {
    color: Colors.textColor,
    fontFamily: 'regular',
    letterSpacing: 0.3,
  },
  newGroupText: {
    color: Colors.primaryGreen,
    fontSize: 17,
    marginBottom: 5,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 50,
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: Colors.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 20,
      justifyContent: "space-between",
      marginBottom: 5,
      gap: 5
    },
    searchInputContainer: {
      backgroundColor: Colors.extraLightGrey,
      borderRadius: 15,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 15,
      height: 44,
      flex: 1
    },
    headerIcons: {
      flexDirection: 'row',
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: Colors.extraLightGrey,
      height: 44,
      width: 44,
      borderRadius: 15,
    },
    searchIcon: {
      marginRight: 10,
    },
    searchInput: {
      flex: 1,
      color: Colors.textColor,
      fontSize: 16,
    },
});