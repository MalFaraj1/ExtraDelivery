import React, { useEffect, useState, useRef } from 'react';
import { SafeAreaView, FlatList, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getConversation, sendMessage } from '@/services/messages';
import { getUserById } from '@/services/users';

export default function MessageContainer() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [userData, setUserData] = useState(null);
  const flatRef = useRef();

  const load = async () => {
    try {
      const convo = await getConversation(id);
      const user = await getUserById(id);
      setMessages(convo);
      setUserData(user);
    } catch (err) {
      console.error("Chat load error:", err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSend = async () => {
    if (!text.trim()) return;
    try {
      await sendMessage(id, text.trim());
      setText("");
      load();
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  if (!userData) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-2 text-gray-500">Loading chat…</Text>
      </SafeAreaView>
    );
  }

  const avatarUrl = userData.profile_image
    ? `http://192.168.0.100:5000${userData.profile_image}`
    : null;

  return (
    <SafeAreaView className="flex-1 bg-gray-100 mt-9">
      {/* Header */}
      <View className="bg-white p-4 mb-2 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#2563eb" />
        </TouchableOpacity>
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={{ width: 36, height: 36, borderRadius: 18 }}
          />
        ) : (
          <Image
            source={require("../../../assets/images/avatar.png")}
            style={{ width: 36, height: 36, borderRadius: 18 }}
          />
        )}
        <Text className="ml-3 text-lg font-pbold">{userData.name}</Text>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 12 }}
        onContentSizeChange={() =>
          flatRef.current?.scrollToEnd({ animated: true })
        }
        renderItem={({ item }) => {
          const isMe = item.sender_id !== Number(id);
          return (
            <View
              className={`mb-2 flex-row ${
                isMe ? 'justify-end' : 'justify-start'
              } px-2`}
            >
              <View
                className={`p-3 rounded-lg max-w-3/4 ${
                  isMe ? 'bg-blue-500' : 'bg-white'
                }`}
              >
                <Text
                  className={`${isMe ? 'text-white' : 'text-black'}`}
                >
                  {item.content}
                </Text>
              </View>
            </View>
          );
        }}
      />

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="border-t border-gray-300 bg-white p-2"
      >
        <View className="flex-row items-center">
          <TextInput
            className="flex-1 bg-gray-200 rounded-full p-3 mr-2"
            placeholder="Type a message…"
            value={text}
            onChangeText={setText}
          />
          <TouchableOpacity
            onPress={onSend}
            className="bg-blue-600 p-3 rounded-full"
          >
            <Text className="text-white font-bold">Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
