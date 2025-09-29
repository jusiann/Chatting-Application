import useConservationStore from "../store/conservation";

export const messageWithUser = (userId, navigate) => {
    const { fetchMessages, setMessagingUser} = useConservationStore.getState();
    setMessagingUser({ id: userId, type: "individual" });
    fetchMessages({ id: userId }); 
    navigate("/home");
}