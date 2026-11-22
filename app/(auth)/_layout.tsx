import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { View, Text } from 'react-native'


const AuthLayout = () => {
  return (
    <>
      <Stack>
        <Stack.Screen
          name="login"
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen
          name="signup"
          options={{
            headerShown: false
          }}
        />
      </Stack>

      <StatusBar backgroundColor='' style='dark' />
    </>
  )
}

export default AuthLayout;