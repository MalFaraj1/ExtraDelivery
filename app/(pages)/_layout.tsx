import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { View, Text } from 'react-native'


const PagesLayout = () => {
  return (
    <>
      <Stack>
        <Stack.Screen
          name="deliveryDetails"
          options={{
            headerShown: false
          }}
        />

        <Stack.Screen
          name="userProfile"
          options={{
            headerShown: false
          }}
        />

        <Stack.Screen
          name="addFriend"
          options={{
            headerShown: false
          }}
        />

        <Stack.Screen
          name="deliveryRequest"
          options={{
            headerShown: false
          }}
        />

        <Stack.Screen
          name="messageContainer"
          options={{
            headerShown: false
          }}
        />

        <Stack.Screen
          name="notifications"
          options={{
            headerShown: false
          }}
        />

        <Stack.Screen
          name="creditCardCheckout"
          options={{
            headerShown: false
          }}
        />
      </Stack>

      <StatusBar backgroundColor='white' style='dark' />
    </>
  )
}

export default PagesLayout;