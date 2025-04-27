// RootNavigation.js
import { createRef } from 'react';

/**
 * Navigation reference that can be used outside of React components
 */
export const navigationRef = createRef();

/**
 * Navigate to a route in the application
 * @param {string} name - The name of the route to navigate to
 * @param {object} params - Parameters to pass to the route
 */
export function navigate(name, params) {
  if (navigationRef.current) {
    navigationRef.current.navigate(name, params);
  } else {
    // For debugging purposes
    console.warn('Navigation attempted before navigationRef was set');
  }
}

/**
 * Reset the navigation state with a new route
 * @param {object} state - The new navigation state
 */
export function reset(state) {
  if (navigationRef.current) {
    navigationRef.current.reset(state);
  }
}

/**
 * Go back to the previous screen
 */
export function goBack() {
  if (navigationRef.current) {
    navigationRef.current.goBack();
  }
}

/**
 * Navigate to a nested route
 * @param {...string} routeNames - The names of the routes to navigate to
 */
export function navigateNested(...routeNames) {
  if (navigationRef.current) {
    let navigation = navigationRef.current;
    routeNames.forEach(routeName => {
      navigation = navigation.navigate(routeName);
    });
  }
}

/**
 * Get the current route name
 * @returns {string|null} - The current route name or null if not available
 */
export function getCurrentRoute() {
  if (navigationRef.current) {
    return navigationRef.current.getCurrentRoute().name;
  }
  return null;
}

/**
 * Check if navigation can go back
 * @returns {boolean} - Whether navigation can go back
 */
export function canGoBack() {
  if (navigationRef.current) {
    return navigationRef.current.canGoBack();
  }
  return false;
}

/**
 * Replace the current screen
 * @param {string} name - The name of the route to replace with
 * @param {object} params - Parameters to pass to the route
 */
export function replace(name, params) {
  if (navigationRef.current) {
    navigationRef.current.dispatch({
      ...CommonActions.replace(name, params),
    });
  }
}