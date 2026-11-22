import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { View, Text } from 'react-native'


const creditCardCheckoutLayout = () => {
  return (
    <>
      <Stack>
        <Stack.Screen
          name="[id]"
          options={{
            headerShown: false
          }}
        />
      </Stack>

      <StatusBar backgroundColor='white' style='dark' />
    </>
  )
}

export default creditCardCheckoutLayout;