import { provider, Auth } from './config/firebase';
import {
  login,
  loginForm,
  logout,
  isAuthorized,
  signUpToggle,
  loginGoogle,
  error,
  errorBlock,
  headToggle,
} from './index';

//Error handler
const errorHandler = (err: Error) => {
  error.innerText = err.message;
  errorBlock.style.display = 'block';
};

headToggle.addEventListener('click', (e) => {
  login.forEach((el) => {
    el.style.display = 'block';
  });
});

//Boolean toggle changes login to signup modal
let isLogin = true;

// logout
logout.addEventListener('click', (e) => {
  e.preventDefault();
  isLogin = true;
  Auth.signOut();
  isAuthorized.forEach((el) => {
    el.style.display = 'none';
  });
});

// Toggles modal text for login or sign-up
signUpToggle.addEventListener('click', (e) => {
  if (isLogin) {
    isLogin = false;
    login.forEach((el) => {
      el.id === 'signuptoggle' && (el.innerText = 'Sign Up');
      el.id === 'toggletext' && (el.innerText = 'Have an account?');
      el.id === 'submitbutton' && (el.innerText = 'Sign Up');
      el.id === 'login-google' && (el.innerText = 'Sign Up with Google');
    });
  } else {
    isLogin = true;
    login.forEach((el) => {
      el.id === 'signuptoggle' && (el.innerText = 'Sign In');
      el.id === 'toggletext' && (el.innerText = 'No account?');
      el.id === 'submitbutton' && (el.innerText = 'Sign In');
      el.id === 'login-google' && (el.innerText = 'Sign In with Google');
    });
  }
});

// email login
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // get user info
  const email = loginForm['login-email'].value;
  const password = loginForm['login-password'].value;
  // create and log the user in
  if (!isLogin) {
    Auth.createUserWithEmailAndPassword(email, password)
      .then((cred) => {
        console.log(cred.user);
      })
      .catch((err: Error) => {
        errorHandler(err);
      });
  } else {
    // log the user in
    Auth.signInWithEmailAndPassword(email, password)
      .then((cred) => {
        console.log(cred.user);
      })
      .catch((err: Error) => {
        errorHandler(err);
      });
  }
});

//Google Login
loginGoogle.addEventListener('click', (e) => {
  e.preventDefault();

  Auth.signInWithPopup(provider)
    .then((result) => {})
    .catch((err) => {
      error = err.message;
    });
  //Hides login form after redirect
  localStorage.setItem('myPage.expectSignIn', '1');
});
