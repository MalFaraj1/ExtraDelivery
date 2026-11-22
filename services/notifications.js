import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

export const getNotifications = async () => {
  const token = await AsyncStorage.getItem('token');
  const { data } = await api.get('/api/notifications', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

export const markNotificationRead = async (id) => {
  const token = await AsyncStorage.getItem('token');
  await api.patch(
    `/api/notifications/${id}/read`,
    {},
    { headers: { Authorization: `Bearer ${token}` }}
  );
};