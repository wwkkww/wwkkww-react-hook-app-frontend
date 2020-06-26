import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import LoadingDotsIcon from './LoadingDotsIcon';

function ProfileFollowers() {
  const { username } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [followers, setFollowers] = useState([]);

  useEffect(() => {
    const fetchRequest = Axios.CancelToken.source();

    async function fetchData() {
      try {
        const response = await Axios.get(`/profile/${username}/followers`, {
          cancelToken: fetchRequest.token,
        });
        // console.log(response.data);

        setFollowers(response.data);
        setIsLoading(false);
      } catch (error) {
        console.log('error', error);
      }
    }
    fetchData();

    return () => {
      fetchRequest.cancel();
    };
  }, [username]);

  if (isLoading) return <LoadingDotsIcon />;
  return (
    <div className="list-group">
      {followers &&
        followers.map((follower, index) => {
          return (
            <Link
              key={index}
              to={`/profile/${follower.username}`}
              className="list-group-item list-group-item-action"
            >
              <img className="avatar-tiny" src={follower.avatar} />{' '}
              <strong> {follower.username} </strong>
            </Link>
          );
        })}
    </div>
  );
}

export default ProfileFollowers;
