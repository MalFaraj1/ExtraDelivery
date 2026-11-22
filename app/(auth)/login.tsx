import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { signInUser } from "../../services/users"; 
import { StatusBar } from "expo-status-bar";
import { router, SplashScreen } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFonts } from "expo-font";
import { useUserContext } from "@/context/UserContext";

const LoginScreen = () => {
  const { setUser } = useUserContext();
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password.");
      return;
    }
  
    try {
      const data = await signInUser(email, password);
      console.log("Login Response:", data);
  
      if (!data.token || !data.user) {
        throw new Error("Invalid response from server");
      }
  
      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      router.replace("/(tabs)/home");
    }  catch (err) {
      // If the server sent { error: "Your account is banned ..." } this shows it
      const msg = err.response?.data?.error ?? "Invalid email or password.";
      Alert.alert("Error", msg);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-gray-100 px-6">
      <StatusBar style="dark" />
      
      {/* Logo */}
      <Text className="text-4xl font-pbold text-blue-600 mb-8">ExtraDelivery</Text>

      {/* Email Input */}
      <TextInput
        className="w-full p-4 bg-white border border-gray-300 rounded-xl mb-4 text-lg"
        placeholder="Enter Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      {/* Password Input */}
      <TextInput
        className="w-full p-4 bg-white border border-gray-300 rounded-xl mb-4 text-lg"
        placeholder="Enter Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Login Button */}
      <TouchableOpacity
        className="w-full bg-blue-600 py-4 rounded-xl"
        onPress={handleLogin}
      >
        <Text className="text-white text-center text-lg font-semibold">Login</Text>
      </TouchableOpacity>

      {/* Sign Up Link */}
      <TouchableOpacity className="mt-4" onPress={() => navigation.navigate("signup")}>
        <Text className="text-blue-600 text-lg">Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;
