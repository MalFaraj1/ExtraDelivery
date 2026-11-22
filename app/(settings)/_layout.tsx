import { TouchableOpacity } from "react-native";
import React from "react";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

const settingsLayout = () => {
  const router = useRouter();

  return (
    <>
      <Stack>
        <Stack.Screen
          name="editProfile"
          options={{
            headerShown: false,
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
                <Ionicons name="arrow-back" size={24} color="black" />
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen
          name="friends"
          options={{
            headerShown: false,
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
                <Ionicons name="arrow-back" size={24} color="blue" />
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen
          name="history"
          options={{
            headerShown: false,
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
                <Ionicons name="arrow-back" size={24} color="black" />
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen
          name="reviews"
          options={{
            headerShown: false,
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
                <Ionicons name="arrow-back" size={24} color="black" />
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen
          name="password"
          options={{
            headerShown: false,
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
                <Ionicons name="arrow-back" size={24} color="black" />
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen
          name="reports"
          options={{
            headerShown: false,
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
                <Ionicons name="arrow-back" size={24} color="black" />
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen
          name="bans"
          options={{
            headerShown: false,
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
                <Ionicons name="arrow-back" size={24} color="black" />
              </TouchableOpacity>
            ),
          }}
        />
      </Stack>

      <StatusBar backgroundColor="white" style="dark" />
    </>
  );
};

export default settingsLayout;
