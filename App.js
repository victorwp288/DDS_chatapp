import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, View,TextInput,Alert,TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "./globals.css";
import React, {useState} from 'react';
import {sum,sub,mult} from './crypto.js';



export default function App() {
  const [text, setText] = useState('');
  const [text2, setText2] = useState('');
  const [number, setNumber] = useState('');
  const [selectedValue, setSelectedValue] = useState(0); 
  const OPTIONS = [
    { label: '+', value: 1 },
    { label: '-', value: 2 },
    { label: 'x', value: 3 },
  ];
 
  // Use a single state object to hold values for all inputs
  const [inputValues, setInputValues] = useState({
    field1: '',
    field2: '',
    field3: '', // Use meaningful names for your fields
  });
  
  const handleIntegerChange = (inputText, fieldName) => {
    const filteredText = inputText.replace(/\D/g, ''); // Remove non-digits

    // Update the specific field in the state object
    setInputValues(prevValues => ({
      ...prevValues,         // Keep previous values for other fields
      [fieldName]: filteredText, // Update the target field dynamically
    }));
  };
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 22,
    },
    item: {
      paddingHorizontal: 10,
      fontSize: 18,
      height: 44,
    },
    inputBox:{
      height: 40, 
      padding: 5,
      width:150,
      margin:5,
      backgroundColor:'white',
      borderWidth: 1,
    },
    input: {
      height: 45,
      borderColor: 'gray',
      borderWidth: 1,
      borderRadius: 5,
      paddingHorizontal: 10,
      fontSize: 16,
      marginBottom: 15,
      backgroundColor:'white',
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 15,
    },
    optionContainer: {
      flexDirection: 'row', // Align circle and text horizontally
      alignItems: 'center', // Center items vertically
      marginBottom: 15,
    },
    radioCircle: {
      height: 22,
      width: 22,
      borderRadius: 11, // Make it a circle
      borderWidth: 2,
      borderColor: 'white', // Example blue color
      alignItems: 'center', // Center the inner dot
      justifyContent: 'center',
      marginRight: 10,
    },
    selectedRadioCircle: {
      borderColor: 'white', // Keep border color or change if needed
      // You might add other styles for selected state if desired
    },
    innerSelectedCircle: {
      height: 12,
      width: 12,
      borderRadius: 6,
      backgroundColor: 'white', // Fill color when selected
    },
    optionLabel: {
      fontSize: 16,
    },
  });
  const shoot = () => {
    var outV=0;
    if(inputValues.field1==''||inputValues.field2==''||selectedValue==0)
      Alert.alert('Simple Button pressed');
    else
      if(selectedValue==1)
        outV=sum(inputValues.field1,inputValues.field2);
      else if(selectedValue==2)
        outV=sub(inputValues.field1,inputValues.field2);
      else if(selectedValue==3)
        outV=mult(inputValues.field1,inputValues.field2);
      setInputValues(prevValues => ({
        ...prevValues,         // Keep previous values for other fields
        field3: outV, // Update the target field dynamically
      }));

  }
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-blue-500">
      <Text className="text-red-600 text-2xl font-bold">Hello DDS group!</Text>
      <StatusBar style="auto" />

        <Text className="border-lime-800 border-2">lol</Text>
      <View
      style={styles.container}>
      <TextInput
          style={styles.input}
          onChangeText={(text) => handleIntegerChange(text, 'field1')}
          value={inputValues.field1} // Get value from the state object
          placeholder="e.g., 12345"
          keyboardType="number-pad"      // Show number pad (recommended for integers)
          // keyboardType="numeric"      // Also works, might show decimal/minus on some devices/OS versions
        />
      <Text style={styles.title}>Select an Option:</Text>
      {OPTIONS.map((option) => {
        const isSelected = selectedValue === option.value; // Check if this option is selected

        return (
          <TouchableOpacity
            key={option.value} // Important for list rendering
            style={styles.optionContainer}
            onPress={() => setSelectedValue(option.value)} // Update state on press
            activeOpacity={0.7} // Visual feedback on press
          >
            {/* The visual radio button */}
            <View style={[styles.radioCircle, isSelected && styles.selectedRadioCircle]}>
              {/* Inner selected dot */}
              {isSelected && <View style={styles.innerSelectedCircle} />}
            </View>

            {/* The label */}
            <Text style={styles.optionLabel}>{option.label}</Text>
          </TouchableOpacity>
        );
      })}

      <TextInput
          style={styles.input}
          onChangeText={(text) => handleIntegerChange(text, 'field2')}
          value={inputValues.field2} // Get value from the state object
          placeholder="e.g., 12345"
          keyboardType="number-pad"      // Show number pad (recommended for integers)
          // keyboardType="numeric"      // Also works, might show decimal/minus on some devices/OS versions
        />
      <Button
          title="Press me"
          onPress={shoot}
        />
      <Text style={styles.inputBox}>
        {inputValues.field3}
      </Text>
      </View>
    </SafeAreaView>
  );
}
