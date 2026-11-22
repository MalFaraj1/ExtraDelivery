import { useEffect } from "react";
import { View, Text, Image } from "react-native";
import { useRouter } from "expo-router";
import { SplashScreen } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      router.replace("/(auth)/login"); 
    }, 3000);
  }, []);

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <StatusBar style="dark" />
      <Image source={require("../assets/icons/logo.png")} className="w-40 h-40 justify-center items-center color-blue-600" />
      <Text className="text-2xl font-pbold mt-4 text-blue-600 justify-center items-center">ExtraDelivery</Text>
    </View>
  );
}
