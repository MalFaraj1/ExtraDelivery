import { View, Text, Alert, TouchableOpacity, Image, TextInput, TouchableWithoutFeedback, KeyboardAvoidingView, ScrollView, Keyboard, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from "expo-image-picker";
import { updateUser, uploadImage } from '@/services/users';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import RNPickerSelect from 'react-native-picker-select';


const editProfile = () => {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [vehicle, setVehicle] = useState("");
  const router = useRouter();

  useEffect(() => {
    const loadUserData = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setName(parsedUser.name);
        setEmail(parsedUser.email);
        setPhone(parsedUser.phone);
        setRole(parsedUser.role);
        setLocation(parsedUser.location);
        setBio(parsedUser.bio);
        setVehicle(parsedUser.vehicle);
        if (parsedUser.profileImage) {
          setProfileImage(`http://192.168.0.100:5000${parsedUser.profileImage}`);
        }
      }
    };
    loadUserData();
  }, []);


  // Pick Image from Gallery
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
  
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      // Upload image to backend
      const response = await uploadImage(uri);
      setProfileImage(`http://192.168.0.100:5000${response.imageUrl}`);
      const token = await AsyncStorage.getItem("token");
      const update = await updateUser(name, role, response.imageUrl, token);
      if (response.user) {
        await AsyncStorage.setItem("user", JSON.stringify(update.user));
      }
    }
  };
 
  // Save Changes (Update API)
  const handleSaveChanges = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await updateUser(name, email, phone, location, bio, vehicle, token);
  
      if (response.user) {
        await AsyncStorage.setItem("user", JSON.stringify(response.user));
      }
  
      Alert.alert("Success", "Profile updated successfully!");
      router.replace("/(tabs)/profile");
    } catch (error) {
      Alert.alert("Error", "Failed to update profile.");
      console.error(error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
        <View className="flex-row block items-center p-5 bg-white border-b border-gray-300">
            <TouchableOpacity onPress={() => router.replace("/(tabs)/profile")}>
                <Ionicons name="arrow-back" size={24} color="#2563eb" />
            </TouchableOpacity>
            <Text className="text-3xl font-pbold flex-1 text-center">Account Info</Text>
            <TouchableOpacity onPress={handleSaveChanges}>
                <Ionicons name="checkmark" size={24} color="#2563eb" />
            </TouchableOpacity>
        </View>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"} 
          className="flex-1"
        >
          <ScrollView 
            className="flex-1"
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 50 }}
          >
  
            {/* Profile Image */}
            <View className="items-center mt-4">
              <Image
                source={profileImage ? { uri: profileImage } : require("../../assets/images/avatar.png")}
                className="w-40 h-40 rounded-full"
              />
              <TouchableOpacity onPress={() => pickImage()} className="absolute bottom-0 left-64 bg-white p-2 rounded-full">
                <Ionicons name="camera" size={20} color="black" />
              </TouchableOpacity>
            </View>
  
            {/* Form Fields */}
            <View className="mt-6 p-4">
              <Text className="font-bold mb-1">Email</Text>
              <View className="flex-row justify-between items-center bg-white border border-gray-300 p-2 rounded-lg mb-2">
                <TextInput value={email} className="flex-1" onChangeText={setEmail} />
              </View>
  
              <Text className="mt-2 mb-1">Phone Number</Text>
              <View className="flex-row justify-between items-center bg-white border border-gray-300 p-2 rounded-lg mb-7">
                <TextInput value={phone} className="flex-1" onChangeText={setPhone}/>
              </View>
  
              <Text className="mb-1 mt-2">Name</Text>
              <TextInput value={name} onChangeText={setName} className="bg-white border border-gray-300 p-4 rounded-lg mb-2" />
  
              <Text className="mb-1 mt-2">Location</Text>
              <View className="w-full bg-white border border-gray-300 rounded-xl mb-4 text-lg">
                <RNPickerSelect
                  onValueChange={(value) => setLocation(value)}
                  items={[
                    { label: "Tripoli", value: "Tripoli" },
                    { label: "Beirut", value: "Beirut" },
                    { label: "Sayda", value: "Sayda" },
                    { label: "Tyre", value: "Tyre" },
                    { label: "Byblos", value: "Byblos" },
                    { label: "Junyeh", value: "Junyeh" },
                    { label: "Baalbak", value: "Baalbak" },
                    { label: "Bikaa", value: "Bikaa" },
                    { label: "Akkar", value: "Akkar" },
                    { label: "Zahle", value: "Zahle" },
                    { label: "Hermel", value: "Hermel" },
                  ]}
                  placeholder={{ label: "Select your city" }}
                  value={location}
                />
              </View>
  
              <Text className="mb-1 mt-2">Bio</Text>
              <TextInput
                value={bio}
                placeholder="Set Your Bio..."
                onChangeText={setBio}
                className="bg-white border border-gray-300 mb-2 p-2 rounded-lg h-28 align-top"
                multiline={true}
                numberOfLines={6}
              />
  
              {role === "driver" ? (
                <View>
                  <Text className="mb-1 mt-2">Your Vehicle</Text>
                  <View className="flex-row justify-between">
                    <TouchableOpacity
                      className={`flex mr-2 py-2 px-4 rounded-xl items-center border-solid border-2 border-gray-400 ${
                        vehicle === "sedan" ? "bg-blue-600" : "bg-white"
                      }`}
                      onPress={() => setVehicle("sedan")}
                    >
                      <Image source={require("../../assets/icons/car.png")} className="w-14 h-14" />
                      <Text className="text-black text-center text-lg font-bold">Sedan</Text>
                    </TouchableOpacity>
  
                    <TouchableOpacity
                      className={`flex mr-2 py-2 px-4 rounded-xl items-center border-solid border-2 border-gray-400 ${
                        vehicle === "van" ? "bg-yellow-300" : "bg-white"
                      }`}
                      onPress={() => setVehicle("van")}
                    >
                      <Image source={require("../../assets/icons/van.png")} className="w-14 h-14" />
                      <Text className="text-black text-center text-lg font-bold">Van</Text>
                    </TouchableOpacity>
  
                    <TouchableOpacity
                      className={`flex mr-2 py-2 px-4 rounded-xl items-center border-solid border-2 border-gray-400 ${
                        vehicle === "truck" ? "bg-green-600" : "bg-white"
                      }`}
                      onPress={() => setVehicle("truck")}
                    >
                      <Image source={require("../../assets/icons/delivery-truck.png")} className="w-14 h-14" />
                      <Text className="text-black text-center text-lg font-bold">Truck</Text>
                    </TouchableOpacity>
  
                    <TouchableOpacity
                      className={`flex mr-2 py-2 px-4 rounded-xl items-center border-solid border-2 border-gray-400 ${
                        vehicle === "motorcycle" ? "bg-red-600" : "bg-white"
                      }`}
                      onPress={() => setVehicle("motorcycle")}
                    >
                      <Image source={require("../../assets/icons/motorcycle.png")} className="w-14 h-14" />
                      <Text className="text-black text-center text-lg font-bold">Motorcycle</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <></>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

export default editProfile