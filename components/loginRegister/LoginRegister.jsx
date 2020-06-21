import React from 'react';
import axios from 'axios';
import './LoginRegister.css';
import {
  Button,
  TextField,
  Typography
} from '@material-ui/core';

class LoginRegister extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      password: "",
      userName: "",
      signUserName: "",
      signPassword: "",
      signConfirmPassword: "",
      signFirstName: "",
      signLastName: "",
      signLoc: "",
      signDesc: "",
      signOccupation: ""
    }

    //Event handlers for sign-in text fields
    this.handlePassChange = this.handlePassChange.bind(this);
    this.handleUsernameChange = this.handleUsernameChange.bind(this);

    //Event handlers for registration text fields
    this.handleSignLoc = this.handleSignLoc.bind(this);
    this.handleSignDesc = this.handleSignDesc.bind(this);
    this.handleSignUserName = this.handleSignUserName.bind(this);
    this.handleSignPassword = this.handleSignPassword.bind(this);
    this.handleLogInRequest = this.handleLogInRequest.bind(this);
    this.handleSignLastName = this.handleSignLastName.bind(this);
    this.handleSignFirstName = this.handleSignFirstName.bind(this);
    this.handleSignOccupation = this.handleSignOccupation.bind(this);
    this.handleConfirmPassword = this.handleConfirmPassword.bind(this);

    //Event Handlers for log-in and registration post requests
    this.handleLogInRequest = this.handleLogInRequest.bind(this);
    this.handleSignUpRequest = this.handleSignUpRequest.bind(this);

    //Render subcomponents
    this.logInForm = this.logInForm.bind(this);
    this.signUpForm = this.signUpForm.bind(this);
  }

  //password text handler  (login)
  handlePassChange(e) {
    this.setState({
      password: e.target.value
    });
  }

  //username text handler (login_name)
  handleUsernameChange(e) {
    this.setState({
      userName: e.target.value
    });
  }

  //Registration username handle
  handleSignUserName(e) {
    this.setState({
      signUserName: e.target.value
    });
  }

  //Registration password handle
  handleSignPassword(e) {
    this.setState({
      signPassword: e.target.value
    });
  }

  //Registration location handle
  handleSignLoc(e) {
    this.setState({
      signLoc: e.target.value
    });
  }

  //Registration occupation handle
  handleSignOccupation(e) {
    this.setState({
      signOccupation: e.target.value
    });
  }

  //Registration description handle
  handleSignDesc(e) {
    this.setState({
      signDesc: e.target.value
    });
  }

  //Registration first_name handle
  handleSignFirstName(e) {
    this.setState({
      signFirstName: e.target.value
    });
  }

  //Registration last_name handle
  handleSignLastName(e) {
    this.setState({
      signLastName: e.target.value
    });
  }

  //Registration confirm password handle
  handleConfirmPassword(e) {
    this.setState({
      signConfirmPassword: e.target.value
    });
  }

  //Handling log-in requests
  handleLogInRequest() {
    axios.post('/admin/login', { //axios.post login request
      login_name: this.state.userName,
      password: this.state.password
    })
    .then((response) => {
      if (response.status === 200) {
        let logged_name = response.data.logged_name;
        let user_id = response.data._id;
        this.props.parentLogStatusTracker(user_id, logged_name); //Send to parent
      } else if (response.status === 400) {
        alert("Sign in was unsuccessful");
      }
      console.log(response.status);
    })
    .catch((error) => {
      console.log(error);
      alert("Sign in was unsuccessful due to invalid password or username");
    });
  }

  //Handling user registration
  handleSignUpRequest() {
    let properFields = true;
    let registerStateArray = [this.state.signUserName, this.state.signPassword, this.state.signFirstName,
      this.state.signLastName, this.state.signConfirmPassword];
    let registerStateFieldArray = ["login_name", "password", "first name", "last name", "confirmed password"];
    for (let i = 0; i < registerStateArray.length; i++) {
      if (registerStateArray[i] === "") {
        alert(registerStateFieldArray[i] + " is not filled out!");
        properFields = false; //Essential field missing
        break;
      }
    }
    if ((this.state.signPassword !== this.state.signConfirmPassword) ||
         !this.state.signPassword || !this.state.signConfirmPassword) {
      alert("Passwords are not matching or are missing!");
      properFields = false; //Passwords not watching
    }
    if (properFields) { //Fields and password match
      axios.post('/user', { //Send post request
        login_name: this.state.signUserName,
        password: this.state.signPassword,
        first_name: this.state.signFirstName,
        last_name: this.state.signLastName,
        location: this.state.signLoc,
        description: this.state.signDesc,
        occupation: this.state.occupation
      })
      .then((response) => {
        if (response.status == 200) {
          alert("Successfully registered!");
          this.setState({ //Reset updating fields
            signConfirmPassword: "", signLoc: "", signDesc: "",
            signLastName: "", signPassword: "", signUserName: "",
            signOccupation: "", signFirstName: ""
          });
        } else if (response.status == 400) {
          alert("Registration was unsuccessful");
        }
      })
      .catch((error) => {
        console.log(error);
        alert("Registration was unsuccessful");
      });
    }
  }

  //Subcomponent log-in form
  logInForm() {
    return (
      <form>
        <TextField
          id = "login_name field"
          label = "Login_name"
          variant = "outlined"
          color = "primary"
          value = {this.state.userName}
          onChange = {this.handleUsernameChange}
        />
        <TextField
          id = "password field"
          label = "Password"
          variant = "outlined"
          color = "primary"
          value = {this.state.password}
          onChange = {this.handlePassChange}
          type = "password"
        />
      </form>
    );
  }

  //Subcomponent registration form
  signUpForm() {
    return (
      <form>
        <div>
          <TextField
            id = "Sign first name field"
            label = "First Name"
            variant = "outlined"
            color = "primary"
            value = {this.state.signFirstName}
            onChange = {this.handleSignFirstName}
          />
          <TextField
            id = "Sign last name field"
            label = "Last Name"
            variant = "outlined"
            color = "primary"
            value = {this.state.signLastName}
            onChange = {this.handleSignLastName}
          />
        </div>
        <div>
          <TextField
            id = "sign login_name field"
            label = "Login_name"
            variant = "outlined"
            color = "primary"
            value = {this.state.signUserName}
            onChange = {this.handleSignUserName}
          />
          <TextField
            id = "sign password field"
            label = "Password"
            variant = "outlined"
            color = "primary"
            value = {this.state.signPassword}
            onChange = {this.handleSignPassword}
            type = "password"
          />
          <TextField
            id = "confirm password field"
            label = "Confirm Password"
            variant = "outlined"
            color = "primary"
            value = {this.state.signConfirmPassword}
            onChange = {this.handleConfirmPassword}
            type = "password"
          />
        </div>
        <div>
          <TextField
            id = "Sign location field"
            label = "Location"
            variant = "outlined"
            color = "primary"
            value = {this.state.signLoc}
            onChange = {this.handleSignLoc}
          />
          <TextField
            id = "Sign description field"
            label = "Description"
            variant = "outlined"
            color = "primary"
            value = {this.state.signDesc}
            onChange = {this.handleSignDesc}
          />
          <TextField
            id = "Sign occupation field"
            label = "Occupation"
            variant = "outlined"
            color = "primary"
            value = {this.state.signOccupation}
            onChange = {this.handleSignOccupation}
          />
        </div>
      </form>
    );
  }

  render() {
    return (
      <div className="outer-container">
        <div className = "rl-container">
          <div className= "rl-elem">
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
          </div>
          <div className= "rl-elem">
            {this.logInForm()}
          </div>
          <div className= "rl-elem">
            <Button variant="contained" color="primary" onClick = {this.handleLogInRequest}>
              Log In
            </Button>
          </div>
        </div>
        <div className= "rl-container">
          <div className= "rl-elem">
            <Typography component="h1" variant="h5">
              Register Me
            </Typography>
          </div>
          <div className= "rl-elem">
            {this.signUpForm()}
          </div>
          <div className= "rl-elem">
            <Button variant="contained" color="primary" onClick = {this.handleSignUpRequest}>
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default LoginRegister;
