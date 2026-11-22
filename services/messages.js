import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';


export const getChatUsers = async () => {
  const token = await AsyncStorage.getItem("token");
  const { data } = await api.get("/api/message/users", { headers: { Authorization: `Bearer ${token}` }});
  return data;
};
  
export const getConversation = async (otherId) => {
  const token = await AsyncStorage.getItem("token");
  const { data } = await api.get(`/api/message/${otherId}`, { headers: { Authorization: `Bearer ${token}` }});
  return data;
};

export const sendMessage = async (receiverId, content) => {
  const token = await AsyncStorage.getItem("token");
  const { data } = await api.post(
    "/api/message/",
    { receiver_id: receiverId, content },
    { headers: { Authorization: `Bearer ${token}` }}
  );
  return data;
};