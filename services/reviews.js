import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

export const getReviewsByDriverId = async (driverId) => {
  try {
    const response = await api.get(`/api/review/driver/${driverId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    throw error;
  }
};

export const submitReview = async (driverId, rating, comment) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await api.post(
      "/api/review/",
      { driver_id: driverId, rating, comment },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to submit review:", error);
    throw error;
  }
};

export const getGivenReviews = async () => {
  const token = await AsyncStorage.getItem("token");
  const { data } = await api.get("/api/review/given", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const getReceivedReviews = async () => {
  const token = await AsyncStorage.getItem("token");
  const { data } = await api.get("/api/review/received", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
