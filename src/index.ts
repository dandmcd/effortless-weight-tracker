//Element queries
const logout = <HTMLFormElement>document.querySelector('#logout-form');
const loginForm = <HTMLFormElement>document.querySelector('#login-form');
const signupForm = <HTMLFormElement>document.querySelector('#signup-form');
const weight_view = <HTMLHeadingElement>document.querySelector('#weight-view');
const thumbsUp = <HTMLDivElement>document.querySelector('#thumbs-up');
const thumbsDown = <HTMLDivElement>document.querySelector('#thumbs-down');
const username = <HTMLHeadingElement>document.querySelector('#username');
const isAuthorized = document.querySelectorAll<HTMLElement>('.auth-only');
const login = document.querySelectorAll<HTMLElement>('.login');
const loginGoogle = <HTMLButtonElement>document.querySelector('#login-google');
const signupGoogle = <HTMLButtonElement>(
  document.querySelector('#signin-google')
);
const headToggle = <HTMLButtonElement>document.querySelector('#header-toggle');
const signUp = <HTMLDivElement>document.querySelector('#signup');
const signUpToggle = <HTMLButtonElement>document.querySelector('#signuptoggle');
const chart = <HTMLDivElement>document.querySelector('#container');
let error = <HTMLParagraphElement>document.getElementById('error');
let errorBlock = <HTMLDivElement>document.getElementById('error-block');
let formError = <HTMLDivElement>document.getElementById('form-error');
let formErrorText = <HTMLParagraphElement>(
  document.getElementById('form-error-text')
);

export {
  logout,
  login,
  headToggle,
  loginGoogle,
  signupGoogle,
  signUp,
  signupForm,
  signUpToggle,
  loginForm,
  weight_view,
  thumbsUp,
  thumbsDown,
  username,
  isAuthorized,
  chart,
  error,
  errorBlock,
  formError,
  formErrorText,
};
