import React, { useEffect, useState } from 'react';
import { FlatList, View, Text, Image, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { getFriendsList, removeFriend } from '@/services/friends';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Friends() {
  const [friends, setFriends] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadFriends = async () => {
    try {
      const data = await getFriendsList();
      setFriends(data);
    } catch (err) {
      Alert.alert('Error', 'Could not load friends list.');
    }
  };

  useEffect(() => { loadFriends(); }, []);

  const handleRemove = async (friendId) => {
    try {
      await removeFriend(friendId);
      loadFriends();
    } catch {
      Alert.alert('Error', 'Could not remove friend.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFriends();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className='flex-row bg-white p-4 border-b border-gray-300 items-center'>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name='arrow-back' size={20} color="#2563eb"/>
        </TouchableOpacity>
        <Text className='mx-4 font-pbold text-2xl'>Friends</Text>
      </View>
      {friends.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500">You have no friends yet.</Text>
        </View>
      ) : (
        <FlatList
          data={friends}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({item}) => (
            <View className="flex-row justify-between items-center bg-white mx-4 my-2 p-4 rounded-lg shadow">
              <View className="flex-row items-center">
                <Image
                  source={item.friend_image ? { uri: `http://192.168.0.100:5000${item.friend_image}` } : require('../../assets/images/avatar.png')}
                  style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }}
                />
                <Text className="text-lg font-medium">{item.friend_name}</Text>
              </View>
              <TouchableOpacity onPress={() => handleRemove(item.friend_id)}>
                <Text className="text-red-500 font-semibold">Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}