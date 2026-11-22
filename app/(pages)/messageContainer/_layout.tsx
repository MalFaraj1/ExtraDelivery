import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { View, Text } from 'react-native'


const MessageContainerLayout = () => {
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

      <StatusBar backgroundColor='#161622' style='light' />
    </>
  )
}

export default MessageContainerLayout;