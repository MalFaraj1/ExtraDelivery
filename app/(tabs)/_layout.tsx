import { View, Text, Image } from 'react-native'
import { Tabs, Redirect } from 'expo-router';
import  icons  from '../../constants/icons';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';


const TabsLayout = () => {
  return (
    <>
      <StatusBar backgroundColor='white' style='dark'/>
      <Tabs
        screenOptions={{
          tabBarItemStyle: {padding:15},
          tabBarShowLabel: false,
          tabBarActiveTintColor: '#2563eb',
          tabBarInactiveTintColor: 'grey',
          tabBarStyle: {
            backgroundColor: 'white',
            borderTopWidth: 1,
            borderTopColor: '#232533',
            height: 65,
          }
        }}
      >
        <Tabs.Screen name='home' options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center justify-center gap-2">
              <Ionicons name="home" color={color} size={24}/>
              <Text className={`${focused ? 'font-psemibold' : 'font-pregular'} text-xs text-center w-14 `} style={{ color: color }} >
                Home
              </Text>
            </View>
          )
        }}/>
        <Tabs.Screen name='deliveries' options={{
          title: 'deliveries',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center justify-center gap-2">
              <Image source={icons.truck} className='w-7 h-7' tintColor={color}/>
              <Text className={`${focused ? 'font-psemibold' : 'font-pregular'} text-xs text-center w-14 `} style={{ color: color }} >
                Shipment
              </Text>
            </View>
          )
        }}/>
        <Tabs.Screen name='chat' options={{
          title: 'chat',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center justify-center gap-2">
              <Ionicons name="chatbox-ellipses-outline" color={color} size={24}/>
              <Text className={`${focused ? 'font-psemibold' : 'font-pregular'} text-xs text-center w-14 `} style={{ color: color }} >
                Chat
              </Text>
            </View>
          )
        }}/>
        <Tabs.Screen name='profile' options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center justify-center gap-2">
              <Ionicons name="person" color={color} size={24}/>
              <Text className={`${focused ? 'font-psemibold' : 'font-pregular'} text-xs text-center w-14 `} style={{ color: color }} >
                Profile
              </Text>
            </View>
          )
        }}/>
      </Tabs>
    </>
  )
}

export default TabsLayout