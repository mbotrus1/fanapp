import React, { useRef, useState } from 'react';
import logo from './logo.svg';
import './App.css';

//import * as firebase from '../node_modules/firebase';

import firebase from "firebase/compat/app";
//require('firebase/auth').default;
//require('firebase').default;
import 'firebase/compat/firestore';
import "firebase/compat/auth";
import 'firebase/compat/analytics';

import SplashScreen from './SplashScreen';


import {useAuthState, useCreateUserWithEmailAndPassword} from 'react-firebase-hooks/auth';
import {useCollectionData} from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyC2E43G35E_3MJkydVy9x-YDk3fWoPjvqY",
  authDomain: "fan-page-app-b7f5d.firebaseapp.com",
  projectId: "fan-page-app-b7f5d",
  storageBucket: "fan-page-app-b7f5d.appspot.com",
  messagingSenderId: "626933434831",
  appId: "1:626933434831:web:a340f5f37ca2c445556aba",
  measurementId: "G-1NNDY6YSHX"
  }
)

const auth = firebase.auth();
const firestore = firebase.firestore();
//const analytics = firebase.analytics();


function App() {

  const [user] = useAuthState(auth);
  const [registering, setRegistering] = useState(false);

  var displaySection;
  if (user) {
    displaySection = <ChatRoom />;
  } else {
    if (registering) {
      displaySection = <CreateAccount goToLogin={() => {setRegistering(false)}}/>;
    } else {
      displaySection = <SignIn goToRegister={() => {setRegistering(true)}} />;
    }
  }

  return (
    <div className="App">
      <header>
        <h1>Maryam Fan App</h1>
        <SignOut />
      </header>
      
      <section>
        {displaySection}
      </section>

      <div>
        <SplashScreen />
      </div>

    </div>
  );
}

function SignIn(props) {

  const {goToRegister} = props;

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
      <p>Welcome to Maryam's First React App Please behave!</p>
      <button className="create-account" onClick={() => goToRegister()}>Create a User Account</button> <p> </p>
    </>
  )

}

function CreateAccount(props)
{

  const {goToLogin} = props;

  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const submitAction = async () => {
    const usersRef = firestore.collection('userInfo');
    await usersRef.add({
      firstName: regFirstName,
      lastName: regLastName,
      email: regEmail,
      role: 'Customer',
      password: regPassword,
      registerTimestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    auth.createUserWithEmailAndPassword(regEmail, regPassword);
  };

  return (
    <>
      <button onClick = {() => goToLogin()}>BACK TO LOGIN</button>
      <button className="sign-in" onClick={() => submitAction()}>Create a User Account</button> <p> </p>
      <label>
      First Name:
      <input type="text" name="name" value={regFirstName} onChange={evt => setRegFirstName(evt.target.value)}/> <p> </p>
      </label>
      <label>
      Last Name:
      <input type="text" name="name" value={regLastName} onChange={evt => setRegLastName(evt.target.value)}/> <p> </p>
      </label> 
      <label>
      User Role:
      <input type="text" name="name" value="Customer"/> <p> </p>
      </label>
      <label>
      Email:
      <input type="text" name="name" value={regEmail} onChange={evt => setRegEmail(evt.target.value)}/> <p> </p>
      </label>
      <label>
      Password:
      <input type="text" name="name" value={regPassword} onChange={evt => setRegPassword(evt.target.value)}/> <p> </p>
      </label>
    </>
  )
}

function SignOut() {

  const [showConfirmation, setShowConfirmation] = useState(false);

  return auth.currentUser && (
    showConfirmation?
    <div>
      <p> Are you sure you want to sign out? </p>
      <br></br>
      <button className="sign-out" onClick={() => {setShowConfirmation(false)}}>No Thank You, I Was Just Kidding, Keep My Signed In Please</button>
      <button className="sign-out" onClick={() => {auth.signOut()}}>Yes Please, I Am Sure I Would Like To Sign Out</button>
    </div>:
    <button className="sign-out" onClick={() => {setShowConfirmation(true)}}>Sign Out</button>
  );
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');
  const [posting, setPosting] = useState(false);


  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  const messageSubmitForm = auth.currentUser.uid=='JIJKSFbCz1XAyqP3WHo6LQHuXow1'?(<form onSubmit={sendMessage}>

    <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />

    <button type="submit" disabled={!formValue}>POST MESSAGE</button>

    <button onClick={() => {setPosting(false)}}>NEVERMIND</button>

  </form>):(null);

  const messageDialogContainer = posting?messageSubmitForm:<div><button onClick={() => {setPosting(true)}}>+</button></div>;


  return (<>
    <main>

      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>

    </main>

    {messageDialogContainer}
  </>)
}


function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <p>{text}</p>
    </div>
  </>)
}


export default App;
