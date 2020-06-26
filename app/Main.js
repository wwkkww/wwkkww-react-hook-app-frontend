import React, { useState, useReducer, useEffect, Suspense } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { useImmerReducer } from 'use-immer';
import { CSSTransition } from 'react-transition-group';
import StateContext from './StateContext';
import DispatchContext from './DispatchContext';
import Axios from 'axios';
Axios.defaults.baseURL = process.env.BACKENDURL || 'https://reactcomplexappbackend.herokuapp.com';

// Component
import Header from './components/Header';
import HomeGuest from './components/HomeGuest';
import Footer from './components/Footer';
import About from './components/About';
import Terms from './components/Terms';
import Home from './components/Home';
const CreatePost = React.lazy(() => import('./components/CreatePost'));
// import CreatePost from './components/CreatePost';
const ViewSinglePost = React.lazy(() => import('./components/ViewSinglePost'));
// import ViewSinglePost from './components/ViewSinglePost';
import FlashMessages from './components/FlashMessages';
import Profile from './components/Profile';
// import ExampleContext from './ExampleContext';
import EditPost from './components/EditPost';
import NotFound from './components/NotFound';
const Search = React.lazy(() => import('./components/Search'));
// import Search from './components/Search';
const Chat = React.lazy(() => import('./components/Chat'));
// import Chat from './components/Chat';
import LoadingDotsIcon from './components/LoadingDotsIcon';

function Main() {
  /**
   * ! #1. REACT useReducer
   * -  useReducer accept the original state as args. Never directly mutate the state
   * -  CONS: need to reconstruct the whole state object entirely (if thousands of state object)
   */
  // const [state, dispatch] = useReducer(ourReducer, initialState);
  // function ourReducer(state, action) {
  //   switch (action.type) {
  //     case 'login':
  //       return { loggedIn: true, flashMessages: state.flashMessages };
  //     case 'logout':
  //       return { loggedIn: false, flashMessages: state.flashMessages };
  //     case 'flashMessage':
  //       return { loggedIn: state.loggedIn, flashMessages: state.flashMessages.concat(action.value) };
  //   }
  // }

  const initialState = {
    loggedIn: Boolean(localStorage.getItem('complexappToken')),
    flashMessages: [],
    flashMessageStatus: '',
    user: {
      token: localStorage.getItem('complexappToken'),
      username: localStorage.getItem('complexappUsername'),
      avatar: localStorage.getItem('complexappAvatar'),
    },
    isSearchOpen: false,
    isChatOpen: false,
    unreadChatCount: 0,
  };

  /**
   * ! #2. IMMER userImmerReducer
   * -  PROS: immer use "draft" as a clone copy of state. We are free to modify it
   */
  const [state, dispatch] = useImmerReducer(ourReducer, initialState);
  function ourReducer(draft, action) {
    switch (action.type) {
      case 'login':
        draft.loggedIn = true;
        draft.user = action.data;
        return;
      case 'logout':
        draft.loggedIn = false;
        return;
      case 'flashMessage':
        draft.flashMessages.push(action.value); // we can modify the array now
        draft.flashMessageStatus = action.status;
        return;
      case 'openSearch':
        draft.isSearchOpen = true;
        return;
      case 'closeSearch':
        draft.isSearchOpen = false;
        return;
      case 'toggleChat':
        draft.isChatOpen = !draft.isChatOpen;
        return;
      case 'closeChat':
        draft.isChatOpen = false;
        return;
      case 'incrementUnreadChat':
        draft.unreadChatCount++;
        return;
      case 'clearUnreadChat':
        draft.unreadChatCount = 0;
        return;
    }
  }

  useEffect(() => {
    if (state.loggedIn) {
      localStorage.setItem('complexappToken', state.user.token);
      localStorage.setItem('complexappUsername', state.user.username);
      localStorage.setItem('complexappAvatar', state.user.avatar);
    } else {
      localStorage.removeItem('complexappToken');
      localStorage.removeItem('complexappUsername');
      localStorage.removeItem('complexappAvatar');
    }
  }, [state.loggedIn]);

  /**
   * REPLACE WITH REDUCER
   */
  // const [loggedIn, setLoggedIn] = useState();
  // const [flashMessages, setFlashMessages] = useState([]);
  // function addFlashMessage(msg) {
  //   setFlashMessages((prev) => prev.concat(msg));
  // }

  return (
    // <ExampleContext.Provider value={{state, dispatch}}>
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <FlashMessages messages={state.flashMessages} status={state.flashMessageStatus} />
          <Header />
          <Suspense fallback={<LoadingDotsIcon />}>
            <Switch>
              <Route path="/" exact>
                {state.loggedIn ? <Home /> : <HomeGuest />}
              </Route>
              <Route path="/profile/:username">
                <Profile />
              </Route>
              <Route path="/create-post">
                <CreatePost />
              </Route>
              <Route path="/post/:id/edit" exact>
                <EditPost />
              </Route>
              <Route path="/post/:id">
                <ViewSinglePost />
              </Route>
              <Route path="/about-us">
                <About />
              </Route>
              <Route path="/terms">
                <Terms />
              </Route>
              <Route>
                <NotFound />
              </Route>
            </Switch>
          </Suspense>

          {/* CSSTransition will add css to its direct nearest child element */}
          <CSSTransition
            timeout={330}
            in={state.isSearchOpen}
            classNames="search-overlay"
            unmountOnExit
          >
            <div className="search-overlay">
              <Suspense fallback="">
                <Search />
              </Suspense>
            </div>
          </CSSTransition>
          {/* {state.isSearchOpen ? <Search /> : ''} */}

          {/* NOTE: do not use CSSTransition because we do no want the chat component to be unmounted when chat is close. Chat needs to be always connected to server */}
          <Suspense fallback="">{state.loggedIn && <Chat />}</Suspense>
          <Footer />
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
    // </ExampleContext.Provider>
  );
}

ReactDOM.render(<Main />, document.querySelector('#app'));

// Load js on the fly (without refresh browser)
if (module.hot) {
  module.hot.accept();
}
