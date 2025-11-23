// navigationRef.js
import { NavigationContainerRef } from '@react-navigation/native';
import React from 'react';

// Create a navigation reference
export const navigationRef = React.createRef();

// Navigate to a route using the navigation ref
export function navigate(name, params) {
  navigationRef.current?.navigate(name, params);
}
