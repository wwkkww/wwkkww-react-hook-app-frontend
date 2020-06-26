import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Page from './Page';

function NotFound() {
  return (
    <Page title="Not Found">
      <div className="text-center">
        <h2>Whoops, page not found</h2>
        <p>
          Back to <Link to="/">Homepage</Link>
        </p>
      </div>
    </Page>
  );
}

export default NotFound;
