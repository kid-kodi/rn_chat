import { useMemo } from 'react';

/**
 * Hook: Get objects from data matching selected IDs
 * @param {Array} data - Full dataset (array of objects with id)
 * @param {Array} selectedIds - Array of selected IDs
 * @returns {Array} Array of selected objects
 */
const useSelectedObjects = (data, selectedIds) => {
  return useMemo(() => {
    if (!data || !selectedIds) return [];

    const idSet = new Set(selectedIds);
    return data.filter((item) => idSet.has(item._id));
  }, [data, selectedIds]);
};

export default useSelectedObjects;


// import React, { useState } from 'react';
// import { View, Text, Button, FlatList } from 'react-native';
// import useSelectedObjects from './useSelectedObjects';

// const data = [
//   { id: 1, name: 'Apple' },
//   { id: 2, name: 'Banana' },
//   { id: 3, name: 'Cherry' },
//   { id: 4, name: 'Date' },
//   { id: 5, name: 'Elderberry' },
//   { id: 6, name: 'Fig' },
// ];

// export default function App() {
//   const [selectedIds, setSelectedIds] = useState([2, 4]);

//   const selectedObjects = useSelectedObjects(data, selectedIds);

//   return (
//     <View style={{ flex: 1, padding: 20 }}>
//       <Text style={{ fontSize: 18 }}>Selected Objects:</Text>
//       <FlatList
//         data={selectedObjects}
//         keyExtractor={(item) => item.id.toString()}
//         renderItem={({ item }) => (
//           <Text style={{ fontSize: 16 }}>{item.name}</Text>
//         )}
//       />

//       <Button
//         title="Toggle ID 3"
//         onPress={() => {
//           setSelectedIds((prev) =>
//             prev.includes(3) ? prev.filter((id) => id !== 3) : [...prev, 3]
//           );
//         }}
//       />
//     </View>
//   );
// }
