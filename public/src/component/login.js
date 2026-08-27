import { Grid } from '@material-ui/core';

class Login extends React.Component {
    signup = async () => {
        const email = document.getElementById('inputEmail').value.trim();
        const password = document.getElementById('inputPassword').value;
        try {
            await firebase.auth().createUserWithEmailAndPassword(email, password);
            this.props.changemode('chat');
        } catch (error) {
            alert(error.message);
        }
    };

    signin = async () => {
        const email = document.getElementById('Email').value.trim();
        const password = document.getElementById('Password').value;
        try {
            await firebase.auth().signInWithEmailAndPassword(email, password);
            this.props.changemode('chat');
        } catch (error) {
            alert(error.message);
        }
    };

    signingoogle = async () => {
        try {
            await firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider());
            this.props.changemode('chat');
        } catch (error) {
            alert(error.message);
        }
    };

    render() {
        return <div className="main">
            <input className="input1" type="checkbox" id="chk" aria-hidden="true" />
            <div className="signup"><Grid>
                <label className="label1" htmlFor="chk">Sign up</label>
                <input className="input1" type="email" placeholder="Email" required id="inputEmail" />
                <input className="input1" type="password" placeholder="Password" required id="inputPassword" />
                <button className="button1" onClick={this.signup}>Sign up</button>
            </Grid></div>
            <div className="login"><Grid>
                <label className="label1" htmlFor="chk">Login</label>
                <input className="input1" type="email" placeholder="Email" required id="Email" />
                <input className="input1" type="password" placeholder="Password" required id="Password" />
                <button className="button1" onClick={this.signin}>Login</button>
                <button className="button1" onClick={this.signingoogle}>使用 Google 登入</button>
            </Grid></div>
        </div>;
    }
}

export default Login;
