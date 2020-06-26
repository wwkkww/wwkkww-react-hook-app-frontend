import React, { useEffect, useContext } from 'react';
import { useImmer } from 'use-immer';
import { Link } from 'react-router-dom';
import Axios from 'axios';
import DispatchContext from '../DispatchContext';
import Post from './Post';

function Search() {
  const appDispatch = useContext(DispatchContext);
  const [state, setState] = useImmer({
    searchTerm: '',
    results: [],
    show: 'neither', // ['result', 'searching', 'neither']
    requestCount: 0,
  });

  // componentDidMount, add keyboard listener
  useEffect(() => {
    document.addEventListener('keyup', searchKeyPress);
    // componentWillUnmount remove keyboard listener
    return () => document.removeEventListener('keyup', searchKeyPress);
  }, []);

  useEffect(() => {
    if (state.searchTerm.trim()) {
      setState(draft => {
        draft.show = 'searching';
      });
      const delay = setTimeout(() => {
        console.log(state.searchTerm);
        // send search request here after user stop typing
        setState(draft => {
          draft.requestCount++;
        });
      }, 1000);

      // clarTimeout will run everytime this useEffect is called
      // in this case of typing, every previous setTimeout will be remove and
      // triggered again when searchterm is changed
      return () => clearTimeout(delay);
    } else {
      setState(draft => {
        draft.show = 'neither';
      });
    }
  }, [state.searchTerm]);

  useEffect(() => {
    if (state.requestCount) {
      // send axios request here
      const ourRequest = Axios.CancelToken.source();
      async function fetchResult() {
        try {
          const response = await Axios.post(
            '/search',
            { searchTerm: state.searchTerm },
            { cancelToken: ourRequest.token }
          );

          console.log(response.data);
          setState(draft => {
            draft.results = response.data;
            draft.show = 'results';
          });
        } catch (error) {
          console.log('error fetch result', error);
        }
      }

      fetchResult();

      return () => ourRequest.cancel();
    }
  }, [state.requestCount]);

  function searchKeyPress(e) {
    console.log('key pressed', e.keyCode);

    if (e.keyCode === 27) {
      appDispatch({ type: 'closeSearch' });
    }
  }

  function handleInput(e) {
    const value = e.target.value;
    setState(draft => {
      draft.searchTerm = value;
    });
  }

  return (
    <>
      {/* <div className="search-overlay"> */}
      <div className="search-overlay-top shadow-sm">
        <div className="container container--narrow">
          <label htmlFor="live-search-field" className="search-overlay-icon">
            <i className="fas fa-search"></i>
          </label>
          <input
            onChange={handleInput}
            autoFocus
            type="text"
            autoComplete="off"
            id="live-search-field"
            className="live-search-field"
            placeholder="What are you interested in?"
          />
          <span className="close-live-search" onClick={() => appDispatch({ type: 'closeSearch' })}>
            <i className="fas fa-times-circle"></i>
          </span>
        </div>
      </div>

      <div className="search-overlay-bottom">
        <div className="container container--narrow py-3">
          <div
            className={
              'circle-loader ' + (state.show === 'searching' ? 'circle-loader--visible' : '')
            }
          ></div>
          <div
            className={
              'live-search-results ' +
              (state.show === 'results' ? 'live-search-results--visible' : '')
            }
          >
            {Boolean(state.results.length) && (
              <div className="list-group shadow-sm">
                <div className="list-group-item active">
                  <strong>Search Results</strong> ({state.results.length}{' '}
                  {state.results.length > 1 ? 'items' : 'item'} found)
                </div>
                {state.results.map(post => {
                  return (
                    <Post
                      key={post._id}
                      post={post}
                      onClick={() => appDispatch({ type: 'closeSearch' })}
                    />
                  );
                })}
              </div>
            )}
            {!Boolean(state.results.length) && (
              <p className="alert alert-danger text-center shadow-sm">No results found</p>
            )}
          </div>
        </div>
      </div>
      {/* </div> */}
    </>
  );
}

export default Search;
