import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Image, Button, Alert, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";


export default function Profile() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [location, setLocation] = useState("");
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
        if (parsedUser.profileImage) {
          setProfileImage(`http://192.168.0.100:5000${parsedUser.profileImage}`);
        }
      }
    };
    loadUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");

      Alert.alert("Success", "You have been logged out.");

      // Navigate to login screen
      router.replace("/(auth)/login");
    } catch (error) {
      Alert.alert("Error", "Failed to logout.");
      console.error(error);
    }
  };


  return (
    <SafeAreaView className="flex-1 bg-gray-100 p-4">
      <View className="w-full bg-white p-4 flex items-center rounded-lg">
        
        <Image
           source={profileImage ? { uri: profileImage } : require("../../assets/images/avatar.png")}
           className="w-40 h-40 rounded-full mb-4 border-solid 1px shadow-xl"
        />
       

       <Text className="text-4xl font-extrabold">{name}</Text>
       <Text className=" text-gray-500">
        <Ionicons name="location" size={13} color="gray"/>
          Lebanon, {location}
        </Text>
     </View>
   
     {/* Profile Image */}
      <View className="items-center flex mt-4 p-1 bg-white h-4/6 rounded-lg">
      {[
          { title: "Profile & Address", icon: "person-outline", page: "/(settings)/editProfile" },
          { title: "Friends", icon: "person-add-outline", page: "/(settings)/friends" },
          { title: "History", icon: "time-outline", page: "/(settings)/history" },
          { title: "Reviews", icon: "star-outline", page: "/(settings)/reviews" },
          { title: "Change Password", icon: "key-outline", page: "/(settings)/password" },
        ].map((item, index) => (
          <TouchableOpacity key={index} onPress={() => router.push(item.page)} className="flex-row items-center p-4 border-b border-gray-200">
            <Ionicons name={item.icon} size={20} color="gray" className="mr-2" />
            <Text className="text-lg flex-1">{item.title}</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="gray" />
          </TouchableOpacity>
        ))}

        {role === 'admin' &&(
          <View className="items-center flex p-1 bg-white rounded-lg">
            <TouchableOpacity onPress={() => router.push("/(settings)/reports")} className="flex-row items-center p-4 border-b border-gray-200">
            <Ionicons name="information-circle" size={20} color="gray" className="mr-2" />
            <Text className="text-lg flex-1">Reports</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="gray" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/(settings)/bans")} className="flex-row items-center p-4 border-b border-gray-200">
            <Ionicons name="ban-outline" size={20} color="gray" className="mr-2" />
            <Text className="text-lg flex-1">Bans</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="gray" />
          </TouchableOpacity>
          </View>  
        )}

      <TouchableOpacity onPress={handleLogout} className="p-4 bg-red-400 rounded-lg mx-5 mb-2 mt-auto flex-row justify-between w-full">
        <Text className="text-white text-lg">Logout</Text>
        <Ionicons name="log-out-outline" size={20} color="white" className="ml-2" />
      </TouchableOpacity>
     </View>
   </SafeAreaView>

  );
}
