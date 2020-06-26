import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import LoadingDotsIcon from './LoadingDotsIcon';

function ProfileFollow(props) {
  const { username } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchRequest = Axios.CancelToken.source();

    async function fetchData() {
      try {
        const response = await Axios.get(`/profile/${username}/${props.type}`, {
          cancelToken: fetchRequest.token,
        });
        console.log(response.data);

        setUsers(response.data);
        setIsLoading(false);
      } catch (error) {
        console.log('error', error);
      }
    }
    fetchData();

    return () => fetchRequest.cancel();
  }, [props.type]);

  if (isLoading) return <LoadingDotsIcon />;
  return (
    <div className="list-group">
      {users &&
        users.map((user, index) => {
          return (
            <Link
              key={index}
              to={`/profile/${user.username}`}
              className="list-group-item list-group-item-action"
            >
              <img className="avatar-tiny" src={user.avatar} /> <strong> {user.username} </strong>
            </Link>
          );
        })}
    </div>
  );
}

export default ProfileFollow;
