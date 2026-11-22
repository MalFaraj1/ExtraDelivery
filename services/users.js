import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./api";


export const getUserById = async (id) => {
  try {
    const response = await api.get(`/api/user/${id}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch user by ID:", error);
    throw error;
  }
};

export const getUsers = async (token) => {
  try {
    const response = await api.get("/api/user/users", {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await api.post("/api/user/register", userData);
    return response.data;
  } catch (error) {
    console.error("Error adding data:", error);
    throw error;
  }
};

export const signInUser = async (email, password) => {
  try {
    const response = await api.post("/api/user/login", { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Login failed" };
  }
};

export const updateUser = async (name, email, phone, location, bio, vehicle, token) => {
  try {
    const response = await api.put(
      "/api/user/update-profile",
      { name, email, phone, location, bio, vehicle},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data;
  }
};

export const uploadImage = async (imageUri) => {
  try {
    let formData = new FormData();
    formData.append("profileImage", {
      uri: imageUri,
      name: "profile.jpg",
      type: "image/jpeg",
    });

    const token = await AsyncStorage.getItem("token");

    const response = await api.post("/api/user/upload-profile-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const updatePassword = async (password, token) => {
  try {
    const response = await api.post("/api/user/update-password", {password}, { headers: { Authorization: `Bearer ${token}` } } );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export default api; 
