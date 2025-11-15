import axios from "./Axios";

export const createGroup = async (formData) => {
  const res = await axios.post("/groups/create", formData);
  return res.data;
};

export const getGroups = async () => {
  const res = await axios.get("/groups/user-groups");
  return res;
};

export const getGroupMessages = async (groupId) => {
  const res = await axios.get(`/groups/${groupId}/messages`);
  return res.data;
};
