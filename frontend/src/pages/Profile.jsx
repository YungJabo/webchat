import { useEffect, useState } from "react";
import { getUser } from "../../api/user";
import { ProfileContent } from "../components/ProfileContent/ProfileContent";

export const Profile = () => {
  const [user, setUser] = useState(null);
  const handleGetUser = async () => {
    const user = await getUser();
    setUser(user);
  };

  useEffect(() => {
    handleGetUser();
  }, []);
  return (
    <>
      <ProfileContent user={user} getUser={handleGetUser} />
    </>
  );
};
