import { db, Auth } from './config/firebase';
import { update, Weights } from './graph';
import {
  username,
  login,
  weight_view,
  thumbsUp,
  thumbsDown,
  isAuthorized,
  dataReq,
} from './index';
let dateOffset = 24 * 60 * 60 * 1000 * 30; //5 days
let myDate = new Date();
myDate.setTime(myDate.getTime() - dateOffset);

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
      // .where('date', '<=', myDate.toString())
      .orderBy('date')
      .onSnapshot((res) => {
        res.docChanges().map((change) => {
          const doc: any = { ...change.doc.data(), id: change.doc.id };
          switch (change.type) {
            case 'added':
              data.push(doc);
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

        // If no data hide the bar chart
        // if (data === []) {
        //   chart.style.display = 'none';
        // }

        //Get the most recent weight to display
        weight_view.innerText = data[data.length - 1]?.weight.toString();
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
      el.style.display = 'block';
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
      console.log(
        'You already entered a weight for today!  If that was a mistake, use the chart to modify or delete the incorrect entry',
      );
    }
  } else {
    console.log('Please enter a valid weight');
  }
});

export { data };
