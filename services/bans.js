import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

export const banUser = async (bannedUser) => {
  const token = await AsyncStorage.getItem('token');
  const { data } = await api.post(
    `/api/ban`,
    { bannedUser },
    { headers:{ Authorization:`Bearer ${token}` } }
  );
  return data;
};

export async function getBans() {
  const token = await AsyncStorage.getItem('token');
  const { data } = await api.get(
    '/api/ban/bans',
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data; // array of bans
}
