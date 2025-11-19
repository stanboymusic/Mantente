import PocketBase from "pocketbase";

const pocketbaseUrl = import.meta.env.VITE_POCKETBASE_URL || "http://localhost:8090";

export const pb = new PocketBase(pocketbaseUrl);

export const getUser = async () => {
  return pb.authStore.model;
};

export const signOut = async () => {
  pb.authStore.clear();
};

export const isAuthenticated = () => {
  return pb.authStore.isValid;
};
