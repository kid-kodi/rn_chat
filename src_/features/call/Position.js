import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

const SquareSize = 100; // Adjust the size of the square as needed
const SquareInterval = 10000; // Interval to add a new square (in milliseconds)

const Position = () => {
  const [squares, setSquares] = useState([]);
  const screenWidth = Dimensions.get('window').width;

  // Function to calculate the number of columns based on screen width
  const calculateColumns = () => {
    const availableWidth = screenWidth - 20; // Subtracting padding/margins
    return availableWidth >= SquareSize * 3 ? 3 : 2; // Adjust based on your requirement
  };

  // Function to add a new square
  const addSquare = () => {
    const newSquare = <View key={squares.length} style={styles.square} />;
    setSquares(prevSquares => [...prevSquares, newSquare]);
  };

  useEffect(() => {
    const timer = setInterval(addSquare, SquareInterval);
    return () => clearInterval(timer);
  }, [squares]);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {squares.map((square, index) => (
          <React.Fragment key={index}>
            {square}
            {(index + 1) % calculateColumns() === 0 && <View style={{ width: '100%', height: 0 }} />}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  square: {
    width: SquareSize,
    height: SquareSize,
    backgroundColor: 'blue', // Adjust the color as needed
    marginVertical: 5,
    borderRadius: 5,
  },
});

export default Position;
