import useConservationStore from "../store/conservation";

export const messageWithUser = (userId, navigate) => {
    const { fetchMessages, setMessagingUser, setMessagingType } = useConservationStore.getState();
    setMessagingType("individual");
    setMessagingUser({ id: userId });
    fetchMessages({ id: userId }); 
    navigate("/home");
}