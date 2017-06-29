import React from 'react';
import PropTypes from 'prop-types';
import Layout from './Layout';

const ForgotPassword = ({ user, resetPassword }) =>
  (<Layout>
    <h1>
      Hello {user.name}!
    </h1>
    <p>Your forgot you password.</p>
    <p>
      Click {' '}
      <a href={`http://localhost:3000/change-password/${resetPassword.token}`}>
        here
      </a>{' '}
      to recover your password.
    </p>
    <p>ktxbye!</p>
  </Layout>);

ForgotPassword.propTypes = {
  user: PropTypes.object.isRequired,
  resetPassword: PropTypes.shape({
    token: PropTypes.string.isRequired,
  }).isRequired,
};

export default ForgotPassword;
