import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

export const reportUser = async (userId, reason, description) => {
  const token = await AsyncStorage.getItem('token');
  const { data } = await api.post(
    `/api/report/${userId}`,
    { reason, description },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};

export const getReports = async () => {
  const token = await AsyncStorage.getItem('token');
  const { data } = await api.get(
    '/api/report/reports',
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
}
