import React, { useEffect, useState, useContext } from 'react';
import Axios from 'axios';
import ReactTooltip from 'react-tooltip';
import DispatchContext from '../DispatchContext';

function HeaderLoggedOut(props) {
  const [username, setUsername] = useState();
  const [password, setPassword] = useState();
  const [inputClass, setInputClass] = useState();
  const [passwordClass, setPasswordClass] = useState();
  const appDispatch = useContext(DispatchContext);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username || !username.trim()) {
      console.log('Cant leave username black');
      setInputClass('is-invalid');
      return;
    }
    if (!password || !password.trim()) {
      console.log('Cant leave password black');
      setPasswordClass('is-invalid');
      return;
    }
    try {
      const response = await Axios.post('/login', {
        username,
        password,
      });
      if (response.data) {
        console.log('response', response);

        /** SEND RESPONSE BACK TO REDUCER */
        // localStorage.setItem('complexappToken', response.data.token);
        // localStorage.setItem('complexappUsername', response.data.username);
        // localStorage.setItem('complexappAvatar', response.data.avatar);

        // setLoggedIn(true);
        appDispatch({ type: 'login', data: response.data });
        appDispatch({ type: 'flashMessage', value: 'Welcome back to Complex App' });
      } else {
        // console.log('invalid credentials');
        appDispatch({ type: 'flashMessage', value: 'Invalid username / password' });
      }
    } catch (error) {
      console.log('error', error.response.data);
    }
  }

  return (
    <form className="mb-0 pt-2 pt-md-0" onSubmit={handleSubmit}>
      <div className="row align-items-center">
        <div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
          <input
            name="username"
            className={'form-control form-control-sm input-dark ' + inputClass}
            type="text"
            placeholder="Username"
            autoComplete="off"
            onChange={e => {
              setUsername(e.target.value), setInputClass('');
            }}
          />
        </div>
        <div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
          <input
            name="password"
            className={'form-control form-control-sm input-dark ' + passwordClass}
            type="password"
            placeholder="Password"
            onChange={e => {
              setPassword(e.target.value), setPasswordClass('');
            }}
          />
        </div>
        <div className="col-md-auto">
          <button className="btn btn-success btn-sm">Sign In</button>
        </div>
      </div>
    </form>
  );
}

export default HeaderLoggedOut;
