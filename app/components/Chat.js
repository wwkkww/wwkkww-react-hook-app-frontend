import React, { useEffect, useContext, useRef } from 'react';
import { useImmer } from 'use-immer';
import io from 'socket.io-client';
import { Link } from 'react-router-dom';
import StateContext from '../StateContext';
import DispatchContext from '../DispatchContext';

// setup url point to server & establish ongoing connection between clien & server
// const socket = io('http://localhost:8080');

function Chat() {
  // useRef instead of state to prevent recreate of variable.
  // let browser to consistently hold on to the socket connection
  const socket = useRef(null);

  const chatField = useRef(null);
  const chatLog = useRef(null);
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);
  const [state, setState] = useImmer({
    fieldValue: '',
    chatMessages: [],
  });

  useEffect(() => {
    if (appState.isChatOpen) {
      appDispatch({ type: 'clearUnreadChat' });
      chatField.current.focus();
    }
  }, [appState.isChatOpen]);

  useEffect(() => {
    // reconnect to socket server every time user login
    // socket.current = io('http://localhost:8080');
    socket.current = io(process.env.BACKENDURL || 'https://reactcomplexappbackend.herokuapp.com');

    socket.current.on('chatFromServer', message => {
      setState(draft => {
        draft.chatMessages.push(message);
      });
    });

    // disconnect socket connection when unmounted (user logout)
    // return () => socket.disconnect();
    return () => socket.current.disconnect();
  }, []);

  useEffect(() => {
    // to scroll to the bottom, set the chatLog scrollTop (how far down it will scroll)
    // as the entire height (scroll to very bottom)
    chatLog.current.scrollTop = chatLog.current.scrollHeight;

    if (state.chatMessages.length && !appState.isChatOpen) {
      appDispatch({ type: 'incrementUnreadChat' });
    }
  }, [state.chatMessages]);

  function handleFieldChange(e) {
    const value = e.target.value;
    setState(draft => {
      draft.fieldValue = value;
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    console.log('submit', state.fieldValue);
    // Send message to chat server
    socket.current.emit('chatFromBrowser', {
      message: state.fieldValue,
      token: appState.user.token,
    });
    setState(draft => {
      // add msg to chatMessages[]
      draft.chatMessages.push({
        message: state.fieldValue,
        username: appState.user.username,
        avatar: appState.user.avatar,
      });
      draft.fieldValue = '';
    });
  }

  return (
    <div
      id="chat-wrapper"
      className={
        'chat-wrapper shadow border-top border-left border-right ' +
        (appState.isChatOpen ? 'chat-wrapper--is-visible' : '')
      }
    >
      <div className="chat-title-bar bg-primary">
        Chat
        <span className="chat-title-bar-close" onClick={() => appDispatch({ type: 'closeChat' })}>
          <i className="fas fa-times-circle"></i>
        </span>
      </div>
      <div id="chat" className="chat-log" ref={chatLog}>
        {state.chatMessages.map((message, index) => {
          if (message.username === appState.user.username) {
            return (
              <div key={index} className="chat-self">
                <div className="chat-message">
                  <div className="chat-message-inner">{message.message}</div>
                </div>
                <img className="chat-avatar avatar-tiny" src={message.avatar} />
              </div>
            );
          }

          return (
            <div key={index} className="chat-other">
              <Link to={`/profile/${message.username}`}>
                <img className="avatar-tiny" src={message.avatar} />
              </Link>
              <div className="chat-message">
                <div className="chat-message-inner">
                  <Link to={`/profile/${message.username}`}>
                    <strong>{message.username}: </strong>
                  </Link>
                  {message.message}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <form id="chatForm" className="chat-form border-top" onSubmit={handleSubmit}>
        <input
          ref={chatField}
          type="text"
          className="chat-field"
          id="chatField"
          placeholder="Type a message…"
          autoComplete="off"
          onChange={handleFieldChange}
          value={state.fieldValue}
        />
      </form>
    </div>
  );
}

export default Chat;
