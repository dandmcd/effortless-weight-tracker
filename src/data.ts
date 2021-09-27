import { db, Auth } from './config/firebase';
import { update, Weights } from './graph';
import {
  username,
  login,
  weight_view,
  thumbsUp,
  thumbsDown,
  isAuthorized,
  chart,
  formErrorText,
  formError,
} from './index';

// 60 days prior used to filter old data
let backDate = new Date();
backDate.setDate(backDate.getDate() - 60);

let data: Weights[] = [];
let userId: string = '';
// Real-time data and reactive state observer
Auth.onAuthStateChanged((user) => {
  console.log(user);
  if (user) {
    localStorage.setItem('myPage.expectSignIn', '1');
    userId = user.uid;
    username.innerText = user.email!.split('@')[0];
    login.forEach((el) => {
      el.style.display = 'none';
    });
    isAuthorized.forEach((el) => {
      if (data) {
        if (el.className.includes('flex')) {
          el.style.display = 'flex';
        } else {
          el.style.display = 'block';
        }
      }
    });
    db.collection('user_weights')
      .where('userId', '==', user.uid)
      .orderBy('date')
      .onSnapshot((res) => {
        res.docChanges().map((change) => {
          const doc: any = { ...change.doc.data(), id: change.doc.id };
          switch (change.type) {
            case 'added':
              if (new Date(doc.date) > backDate) {
                data.push(doc);
              }
              break;
            case 'modified':
              const index = data.findIndex((item) => item.id == doc.id);
              data[index] = doc;
              break;
            case 'removed':
              data = data.filter((item) => item.id !== doc.id);
              break;
            default:
              break;
          }
        });
        update(data);
        console.log(data);

        //Get the most recent weight to display
        if (data.length <= 0) {
          chart.style.display = 'none';
          weight_view.innerText = '000';
        } else {
          chart.style.display = 'block';
          weight_view.innerText = data[data.length - 1]?.weight.toString();
        }

        // Compare last two weight entries and display thumbs up or down img
        if (data[data.length - 2]?.weight >= data[data.length - 1]?.weight) {
          thumbsDown.style.display = 'none';
          thumbsUp.style.display = 'block';
        } else {
          thumbsUp.style.display = 'none';
          thumbsDown.style.display = 'block';
        }
        console.log(data[data.length - 1]);
        console.log(data);
      });
  } else {
    localStorage.removeItem('myPage.expectSignIn');
    login.forEach((el) => {
      if (el.id != 'modal') {
        el.style.display = 'block';
      }
    });
  }
});

// Enter new weight
const form = <HTMLFormElement>document.querySelector('#weight-entry');

const input = <HTMLInputElement>document.querySelector('#input-weight');
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const weight = parseInt(input.value);
  if (data.length === 0 && weight) {
    db.collection('user_weights')
      .add({
        weight,
        userId,
        date: new Date().toString(),
      })
      .then(() => {
        input.value = '';
      })
      .catch((err) => console.log(err));
  } else if (data.length >= 1 && weight) {
    // Perform a check to see if there is already an entry for today
    const lastDate = new Date(data[data.length - 1].date).getDate();
    let isToday = new Date().getDate() === lastDate;

    if (!isToday) {
      db.collection('user_weights')
        .add({
          weight,
          userId,
          date: new Date().toString(),
        })
        .then(() => {
          input.value = '';
        })
        .catch((err) => console.log(err));
    } else {
      formErrorText.innerText =
        'You already entered a weight for today!  If this is a mistake, use the chart to modify or delete the incorrect entry';
      formError.style.display = 'block';
    }
  } else {
    formErrorText.innerText = 'Please enter a valid weight';

    formError.style.display = 'block';
  }
});

export { data };
