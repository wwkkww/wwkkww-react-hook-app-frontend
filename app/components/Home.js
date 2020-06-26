import React, { useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useImmer } from 'use-immer';
import Axios from 'axios';
import Page from './Page';
import StateContext from '../StateContext';
import DispatchContext from '../DispatchContext';
import LoadingDotsIcon from './LoadingDotsIcon';
import Post from './Post';

function Home() {
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);
  const [state, setState] = useImmer({
    isLoading: true,
    feeds: [], // no need specified the feed object. just set api results to feed
  });

  useEffect(() => {
    const fetchRequest = Axios.CancelToken.source();

    async function fetchData() {
      try {
        setState(draft => {
          draft.isLoading = true;
        });

        const response = await Axios.post(
          '/getHomeFeed',
          { token: appState.user.token },
          { cancelToken: fetchRequest.token }
        );
        console.log(response.data);
        // setProfileData(response.data);
        setState(draft => {
          draft.isLoading = false;
          draft.feeds = response.data;
        });
      } catch (error) {
        console.log('error', error);
      }
    }
    fetchData();
    return () => fetchRequest.cancel();
  }, []);

  if (state.isLoading) return <LoadingDotsIcon />;

  return (
    <Page title="Your Feed">
      {state.feeds.length == 0 && (
        <>
          <h2 className="text-center">
            Hello <strong>{appState.user.username} </strong>, your feed is empty.
          </h2>
          <p className="lead text-muted text-center">
            Your feed displays the latest posts from the people you follow. If you don&rsquo;t have
            any friends to follow that&rsquo;s okay; you can use the &ldquo;Search&rdquo; feature in
            the top menu bar to find content written by people with similar interests and then
            follow them.
          </p>
        </>
      )}
      {state.feeds.length > 0 && (
        <>
          <h2 className="text-center mb-4">The Latest From Those You Follow</h2>
          <div className="list-group">
            {state.feeds.map(post => {
              return <Post key={post._id} post={post} />;
            })}
          </div>
        </>
      )}
    </Page>
  );
}

export default Home;
