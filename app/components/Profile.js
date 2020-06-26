import React, { useEffect, useContext, useState } from 'react';
import { useParams, NavLink, Switch, Route } from 'react-router-dom';
import Axios from 'axios';
import { useImmer } from 'use-immer';
import Page from './Page';
import StateContext from '../StateContext';
import ProfilePost from './ProfilePost';
// import ProfileFollowers from './ProfileFollowers';
// import ProfileFollowing from './ProfileFollowing';
import ProfileFollow from './ProfileFollow';
import NotFound from './NotFound';

function Profile() {
  const { username } = useParams();
  const appState = useContext(StateContext);
  // const [profileData, setProfileData] = useState({
  //   profileUsername: '...',
  //   profileAvatar: 'https://gravatar.com/avatar/placeholder?s=128',
  //   isFollowing: false,
  //   counts: {
  //     followerCount: 0,
  //     followingCount: 0,
  //     postCount: 0,
  //   },
  // });
  const [state, setState] = useImmer({
    followActionLoading: false,
    startFollowingRequestCount: 0,
    stopFollowingRequestCount: 0,
    profileData: {
      profileUsername: '...',
      profileAvatar: 'https://gravatar.com/avatar/placeholder?s=128',
      isFollowing: false,
      counts: {
        followerCount: 0,
        followingCount: 0,
        postCount: 0,
      },
    },
  });

  useEffect(() => {
    const fetchRequest = Axios.CancelToken.source();
    async function fetchData() {
      try {
        const response = await Axios.post(
          `/profile/${username}`,
          { token: appState.user.token },
          { cancelToken: fetchRequest.token }
        );
        console.log(response.data);
        // setProfileData(response.data);
        setState(draft => {
          draft.profileData = response.data;
        });
      } catch (error) {
        console.log('error', error);
      }
    }
    fetchData();
    return () => {
      fetchRequest.cancel();
    };
  }, [username]);

  useEffect(() => {
    if (state.startFollowingRequestCount) {
      const fetchRequest = Axios.CancelToken.source();
      setState(draft => {
        draft.followActionLoading = true;
      });
      async function fetchData() {
        try {
          const response = await Axios.post(
            `/addFollow/${state.profileData.profileUsername}`,
            { token: appState.user.token },
            { cancelToken: fetchRequest.token }
          );

          // setProfileData(response.data);
          setState(draft => {
            draft.profileData.isFollowing = true;
            draft.profileData.counts.followerCount++;
            draft.followActionLoading = false;
          });
        } catch (error) {
          console.log('error', error);
        }
      }
      fetchData();
      return () => fetchRequest.cancel();
    }
  }, [state.startFollowingRequestCount]);

  useEffect(() => {
    if (state.stopFollowingRequestCount) {
      const fetchRequest = Axios.CancelToken.source();
      setState(draft => {
        draft.followActionLoading = true;
      });
      async function fetchData() {
        try {
          const response = await Axios.post(
            `/removeFollow/${state.profileData.profileUsername}`,
            { token: appState.user.token },
            { cancelToken: fetchRequest.token }
          );

          // setProfileData(response.data);
          setState(draft => {
            draft.profileData.isFollowing = false;
            draft.profileData.counts.followerCount--;
            draft.followActionLoading = false;
          });
        } catch (error) {
          console.log('error', error);
        }
      }
      fetchData();
      return () => fetchRequest.cancel();
    }
  }, [state.stopFollowingRequestCount]);

  function startFollowing() {
    setState(draft => {
      draft.startFollowingRequestCount++;
    });
  }

  function stopFollowing() {
    setState(draft => {
      draft.stopFollowingRequestCount++;
    });
  }

  if (!state.profileData) return <NotFound />;

  return (
    <Page title="Profile screen">
      <h2>
        <img className="avatar-small" src={state.profileData.profileAvatar} />
        {state.profileData.profileUsername}

        {appState.loggedIn &&
          !state.profileData.isFollowing &&
          appState.user.username !== state.profileData.profileUsername &&
          state.profileData.profileUsername !== '...' && (
            <button
              onClick={startFollowing}
              disabled={state.followActionLoading}
              className="btn btn-primary btn-sm ml-2"
            >
              Follow <i className="fas fa-user-plus"></i>
            </button>
          )}

        {appState.loggedIn &&
          state.profileData.isFollowing &&
          appState.user.username !== state.profileData.profileUsername &&
          state.profileData.profileUsername !== '...' && (
            <button
              onClick={stopFollowing}
              disabled={state.followActionLoading}
              className="btn btn-danger btn-sm ml-2"
            >
              Stop Following <i className="fas fa-user-times"></i>
            </button>
          )}
      </h2>

      <div className="profile-nav nav nav-tabs pt-2 mb-4">
        <NavLink
          exact
          to={`/profile/${state.profileData.profileUsername}`}
          className="nav-item nav-link"
        >
          Posts: {state.profileData.counts.postCount}
        </NavLink>
        <NavLink
          to={`/profile/${state.profileData.profileUsername}/followers`}
          className="nav-item nav-link"
        >
          Followers: {state.profileData.counts.followerCount}
        </NavLink>
        <NavLink
          to={`/profile/${state.profileData.profileUsername}/following`}
          className="nav-item nav-link"
        >
          Following: {state.profileData.counts.followingCount}
        </NavLink>
      </div>

      <Switch>
        <Route path="/profile/:username" exact>
          <ProfilePost />
        </Route>
        <Route path="/profile/:username/followers">
          {/* <ProfileFollowers /> */}
          {state.profileData.counts.followerCount > 0 ? (
            <ProfileFollow type="followers" />
          ) : (
            <div>
              <p>
                {state.profileData.profileUsername !== appState.user.username
                  ? 'This user '
                  : 'You '}{' '}
                do not have any followers yet
              </p>
            </div>
          )}
        </Route>
        <Route path="/profile/:username/following">
          {/* <ProfileFollowing /> */}
          {state.profileData.counts.followingCount > 0 ? (
            <ProfileFollow type="following" />
          ) : (
            <div>
              <p>
                {state.profileData.profileUsername !== appState.user.username
                  ? 'This user is '
                  : 'You are '}{' '}
                not following anyone yet
              </p>
            </div>
          )}
        </Route>
      </Switch>
    </Page>
  );
}

export default Profile;
