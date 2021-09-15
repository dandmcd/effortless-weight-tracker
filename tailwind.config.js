module.exports = {
  purge: ['./src/**/*.html', './src/**/*.js'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    fontFamily: {
      body: ['Oswald', 'sans-serif'],
    },
    extend: {
      colors: {
        myDarkBlue: '#307580',
        myBlue: '#47adbd',
        myLightBlue: '#8cf0ff',
        myBright: '#fd5fe8',
        myLight: '#fff7fe',
        myError: '#ff7660',
        mySuccess: '#44b553',
        myMedText: '#443e3d',
        myText: '#0B0A0A',
        myLightText: '#817474',
      },
    },
  },
  variants: {},
  plugins: [],
};
