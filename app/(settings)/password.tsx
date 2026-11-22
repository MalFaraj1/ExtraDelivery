import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { updatePassword } from '@/services/users'

const ChangePassword = () => {
  const [password, setPassword] = useState("");
  const router = useRouter();
  const handleSaveChanges = async () => {
    try {
    const token = await AsyncStorage.getItem("token");
    const response = await updatePassword(password, token);

    Alert.alert("Success","Password Updated");
    router.replace("/(tabs)/profile");
    } catch (error) {
      Alert.alert("Error", "Failed to Update Password");
    }
  };

  return (
    <SafeAreaView>
      <View className="flex-row block items-center p-5 bg-white border-b border-gray-300">
          <TouchableOpacity onPress={() => router.replace("/(tabs)/profile")}>
            <Ionicons name="arrow-back" size={24} color="#2563eb" />
          </TouchableOpacity>
          <Text className="text-3xl font-pbold flex-1 text-center">Change Password</Text>
          <TouchableOpacity onPress={handleSaveChanges}>
            <Ionicons name="checkmark" size={24} color="#2563eb" />
          </TouchableOpacity>
      </View>
      <Text className='mx-4 p-2 font-bold text-lg'>Change Password</Text>
      <View className='mx-4 px-2 py-1 bg-white border border-gray-300 rounded-lg'>
        <TextInput placeholder='Enter A New Password' onChangeText={setPassword} />
      </View>
    </SafeAreaView>
  )
}

export default ChangePassword