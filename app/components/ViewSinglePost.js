import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link, withRouter } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import ReactTooltip from 'react-tooltip';
import Axios from 'axios';
import Page from './Page';
import LoadingDotsIcon from './LoadingDotsIcon';
import NotFound from './NotFound';
import StateContext from '../StateContext';
import DispatchContext from '../DispatchContext';

function ViewSinglePost(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [post, setPost] = useState();
  const { id } = useParams();
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);

  useEffect(() => {
    const fetchRequest = Axios.CancelToken.source();

    async function fetchPost() {
      try {
        const response = await Axios.get(`/post/${id}`, {
          cancelToken: fetchRequest.token,
        });
        console.log(response);

        setPost(response.data);
        setIsLoading(false);
      } catch (error) {
        console.log('error', error);
      }
    }
    fetchPost();

    // clean up before unmounted
    return () => {
      fetchRequest.cancel();
    };
  }, [id]);

  if (!isLoading && !post) return <NotFound />;

  if (isLoading)
    return (
      <Page title="loading...">
        <LoadingDotsIcon />
      </Page>
    );

  const date = new Date(post.createdDate);
  const dateFormatted = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

  function isOwner() {
    if (appState.loggedIn) {
      return appState.user.username === post.author.username;
    }
    return false;
  }

  async function handleDelete() {
    const confirm = window.confirm('Do you really want to delete this post?');
    if (confirm) {
      try {
        const response = await Axios.delete(`/post/${id}`, {
          data: { token: appState.user.token },
        });

        if (response.data === 'Success') {
          // display success flash msg
          appDispatch({
            type: 'flashMessage',
            value: 'Post was successfully deleted',
            status: 'success',
          });
          // redirect to post page
          props.history.push(`/profile/${appState.user.username}`);
        }
      } catch (error) {
        console.log('There was a problem', error);
      }
    }
  }
  return (
    <Page title={post.title}>
      <div className="d-flex justify-content-between">
        <h2>{post.title}</h2>
        {isOwner() && (
          <span className="pt-2">
            <Link
              to={`/post/${post._id}/edit`}
              data-tip="Edit"
              data-for="edit"
              className="text-primary mr-2"
            >
              <i className="fas fa-edit"></i>
            </Link>
            <ReactTooltip id="edit" className="custom-tooltip" />{' '}
            <a
              className="delete-post-button text-danger"
              data-tip="Delete"
              data-for="delete"
              onClick={handleDelete}
            >
              <i className="fas fa-trash"></i>
            </a>
            <ReactTooltip id="delete" className="custom-tooltip" />
          </span>
        )}
      </div>

      <p className="text-muted small mb-4">
        <Link to={`/profile/${post.author.username}`}>
          <img className="avatar-tiny" src={post.author.avatar} />
        </Link>
        Posted by <Link to={`/profile/${post.author.username}`}>{post.author.username}</Link> on{' '}
        {dateFormatted}
      </p>

      <div className="body-content">
        <ReactMarkdown
          source={post.body}
          allowedTypes={['paragraph', 'strong', 'emphasis', 'text', 'heading', 'list', 'listItem']}
        />
      </div>
    </Page>
  );
}

export default withRouter(ViewSinglePost);
