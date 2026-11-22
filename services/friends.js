import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

// Get friend suggestions
export const getFriendSuggestions = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await api.get('/api/friend/suggestions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch friend suggestions:', error);
      throw error;
    }
  };
  
  // Send a friend request
  export const sendFriendRequest = async (friendId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await api.post(
        '/api/friend/request',
        { friend_id: friendId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to send friend request:', error);
      throw error;
    }
  };
  
  // Get pending friend requests
  export const getPendingRequests = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await api.get('/api/friend/pending', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch pending requests:', error);
      throw error;
    }
  };
  
  // Respond to a friend request (accept or decline)
  export const respondToFriendRequest = async (requestId, action) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await api.post(
        '/api/friend/respond',
        { request_id: requestId, action },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to respond to friend request:', error);
      throw error;
    }
  };

  // Get the friendship status between logged-in user and another user
export const getFriendStatus = async (otherId) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const { data } = await api.get(`/api/friend/status/${otherId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data.status; // 'none' | 'pending' | 'friends'
  } catch (err) {
    console.error("Failed to get friend status:", err);
    throw err;
  }
};

// Remove a friend or cancel a pending request
export const removeFriend = async (friendId) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const { data } = await api.post(
      "/api/friend/remove",
      { friend_id: friendId },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return data;
  } catch (err) {
    console.error("Failed to remove friend:", err);
    throw err;
  }
};

// Get list of accepted friends
export const getFriendsList = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    const { data } = await api.get("/api/friend/list", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (err) {
    console.error("Failed to fetch friends list:", err);
    throw err;
  }
};