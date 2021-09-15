import { provider, Auth } from './config/firebase';
import {
  login,
  loginForm,
  logout,
  isAuthorized,
  signUp,
  signupForm,
  signUpToggle,
  loginGoogle,
  signupGoogle,
  signInToggle,
} from './index';

//Error handler
let error = <HTMLParagraphElement>document.getElementById('error');
let errorBlock = <HTMLDivElement>document.getElementById('error-block');
const errorHandler = (err: Error) => {
  error.innerText = err.message;
  errorBlock.style.display = 'block';
};

// logout
logout.addEventListener('click', (e) => {
  e.preventDefault();
  Auth.signOut();
  isAuthorized.forEach((el) => {
    el.style.display = 'none';
  });
});

// toggle login and signup
let isLogin = true;
console.log(isLogin);
signUpToggle.addEventListener('click', () => {
  console.log('Present');
  if (isLogin) {
    signUp.style.display = 'block';
    login.forEach((el) => {
      el.style.display = 'none';
    });
  } else {
    signUp.style.display = 'none';
  }
});

signInToggle.addEventListener('click', () => {
  console.log('Here');
  isLogin = false;
  console.log(isLogin);
  if (!isLogin) {
    signUp.style.display = 'block';
  }
});

// create email account
signupForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // get user info
  const email = signupForm['signup-email'].value;
  const password = signupForm['signup-password'].value;

  // log the user in
  Auth.createUserWithEmailAndPassword(email, password)
    .then((cred) => {
      console.log(cred.user);
    })
    .catch((err: Error) => {
      errorHandler(err);
    });
});

// login
// const loginForm = <HTMLFormElement>document.querySelector('#login-form');
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // get user info
  const email = loginForm['login-email'].value;
  const password = loginForm['login-password'].value;

  // log the user in
  Auth.signInWithEmailAndPassword(email, password)
    .then((cred) => {
      console.log(cred.user);
    })
    .catch((err: Error) => {
      errorHandler(err);
    });
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
