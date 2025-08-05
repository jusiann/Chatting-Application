import useConservationStore from "../store/conservation";

export const messageWithUser = (userId, navigate) => {
    const { fetchMessages, setMessagingUser } = useConservationStore.getState();
    setMessagingUser({ id: userId });
    fetchMessages({ id: userId });
    navigate("/home");
}