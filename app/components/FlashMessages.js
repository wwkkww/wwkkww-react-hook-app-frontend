import React, { useEffect } from 'react';

function FlashMessages(props) {
  const statusClass =
    props.status === 'error' ? 'alert-danger' : props.status === 'success' ? 'alert-success' : '';
  return (
    <div className="floating-alerts">
      {props.messages.map((msg, index) => {
        return (
          <div key={index} className={'alert text-center floating-alert shadow-sm ' + statusClass}>
            {msg}
          </div>
        );
      })}
    </div>
  );
}

export default FlashMessages;
