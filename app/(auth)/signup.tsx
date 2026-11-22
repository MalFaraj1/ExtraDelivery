import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { registerUser } from "../../services/users"; // API call function
import { StatusBar } from "expo-status-bar";
import RNPickerSelect from 'react-native-picker-select';

export default function RegisterScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    location: "",
    role: "customer", // Default role
  });

  const handleChange = (key, value) => {
    setUserData({ ...userData, [key]: value });
  };

  const handleRegister = async () => {
    const { name, email, phone, password, location, role } = userData;
  
    if (!name || !email || !phone || !password || !role || !location) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
  
    // Email validation (basic format check)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
  
    // Lebanese phone validation (with country code)
    const phoneRegex = /^\+961(3|70|71|76|78|79|81|1|4|5|6|7|8|9)\d{6}$/;
    if (!phoneRegex.test(phone)) {
      Alert.alert("Invalid Phone", "Enter a valid Lebanese phone number (e.g. +96171234567).");
      return;
    }

  
    // Password strength check
    const isStrong = password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password);
    if (!isStrong) {
      Alert.alert("Weak Password", "Password must be at least 8 characters, include a number and an uppercase letter.");
      return;
    }
  
    try {
      const response = await registerUser(userData);
      router.replace("/(auth)/login");
    } catch (error) {
      Alert.alert("Error", error.message || "Registration failed.");
    }
  };
  
  

  return (
    <View className="flex-1 justify-center items-center bg-gray-100 px-6">
      <StatusBar style="dark" />

      {/* Title */}
      <Text className="text-4xl font-pbold text-blue-600 mb-8">ExtraDelivery</Text>
      <Text className="text-xl font-semibold text-gray-700 mb-6">Create Your Account</Text>

      {/* Name Input */}
      <TextInput
        className="w-full p-4 bg-white border border-gray-300 rounded-xl mb-4 text-lg"
        placeholder="Full Name"
        value={userData.name}
        onChangeText={(text) => handleChange("name", text)}
      />

      {/* Email Input */}
      <TextInput
        className="w-full p-4 bg-white border border-gray-300 rounded-xl mb-4 text-lg"
        placeholder="Email Address"
        keyboardType="email-address"
        value={userData.email}
        onChangeText={(text) => handleChange("email", text)}
      />

      {/* Phone Number Input */}
      <TextInput
        className="w-full p-4 bg-white border border-gray-300 rounded-xl mb-4 text-lg"
        placeholder="Phone Number"
        keyboardType="phone-pad"
        value={userData.phone}
        onChangeText={(text) => {
          let formatted = text.replace(/\s+/g, ""); // Remove spaces
        
          // If starts with 0, replace with +961
          if (/^0\d{7}$/.test(formatted)) {
            formatted = "+961" + formatted.slice(1);
          }
        
          // If user types +961 already, keep it
          if (!formatted.startsWith("+961")) {
            formatted = "+961" + formatted;
          }
        
          handleChange("phone", formatted);
        }}
        
      />

      {/* Password Input */}
      <TextInput
        className="w-full p-4 bg-white border border-gray-300 rounded-xl mb-4 text-lg"
        placeholder="Password"
        secureTextEntry
        value={userData.password}
        onChangeText={(text) => handleChange("password", text)}
      />
      <View className="w-full bg-white border border-gray-300 rounded-xl mb-4 text-lg">
      <RNPickerSelect
        onValueChange={(value) => handleChange("location", value)}
        items={[
          {label: "Tripoli", value: "Tripoli"},
          {label: "Beirut", value: "Beirut"},
          {label: "Sayda", value: "Sayda"},
          {label: "Tyre", value: "Tyre"},
          {label: "Byblos", value: "Byblos"},
          {label: "Junyeh", value: "Junyeh"},
          {label: "Baalbak", value: "Baalbak"},
          {label: "Bikaa", value: "Bikaa"},
          {label: "Akkar", value: "Akkar"},
          {label: "Zahle", value: "Zahle"},
          {label: "Hermel", value: "Hermel"},
        ]}
        placeholder={{ label: "Select your city...", value: null}}
      />
      </View>
      {/* Role Selection (Customer or Driver) */}
      <View className="flex-row justify-between w-full">
        <TouchableOpacity
          className={`flex-1 mr-2 py-4 rounded-xl text-center ${
            userData.role === "customer" ? "bg-blue-600" : "bg-gray-300"
          }`}
          onPress={() => handleChange("role", "customer")}
        >
          <Text className="text-white text-center text-lg font-semibold">Customer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 ml-2 py-4 rounded-xl text-center ${
            userData.role === "driver" ? "bg-blue-600" : "bg-gray-300"
          }`}
          onPress={() => handleChange("role", "driver")}
        >
          <Text className="text-white text-center text-lg font-semibold">Driver</Text>
        </TouchableOpacity>
      </View>

      {/* Register Button */}
      <TouchableOpacity
        className="w-full bg-blue-600 py-4 rounded-xl mt-4"
        onPress={handleRegister}
      >
        <Text className="text-white text-center text-lg font-semibold">Sign Up</Text>
      </TouchableOpacity>

      {/* Already have an account? */}
      <TouchableOpacity className="mt-4" onPress={() => router.replace("/(auth)/login")}>
        <Text className="text-blue-600 text-lg">Already have an account? Log in</Text>
      </TouchableOpacity>
    </View>
  );
}
