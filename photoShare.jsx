import React from 'react';
import ReactDOM from 'react-dom';
import {
  HashRouter, Route, Switch, Redirect
} from 'react-router-dom';
import {
  Grid, Typography, Paper
} from '@material-ui/core';
import './styles/main.css';

// import necessary components
import TopBar from './components/topBar/TopBar';
import UserDetail from './components/userDetail/UserDetail';
import UserList from './components/userList/UserList';
import UserPhotos from './components/userPhotos/UserPhotos';
import LoginRegister from './components/loginRegister/LoginRegister'

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      userName: '',
      viewType: '',
      loggedIn: false,
      userId: '',
      loggedName: '',
      photoHold: undefined,
      userList: []
    }
  }

  //Parent callback used to update topbar user
  parentNameTracker = (childUserName) => {
    this.setState({userName: childUserName});
  }

  //Parent callback used to update topbar view type
  parentViewTracker = (childView) => {
    this.setState({viewType: childView});
  }

  //Parent callback: Tracks logging in to site => Passes name info to child components
  parentLogStatusTracker = (childUserId, logged_name) => {
    this.setState({loggedIn: true,
                   userId: childUserId,
                   loggedName: logged_name,
                   userName: logged_name,
                   viewType: "Information"});
    this.forceUpdate();
  }

  //Parent callback: Tracks logging off of site
  parentLogOffTracker = () => {
    this.setState({loggedIn: false});
  }

  //Parent callback: Update on registration
  parentRegStatusTracker = () => {
    this.forceUpdate();
  }

  //Parent Callback: Communicate between top-bar upload and user photos
  parentPhotoUploadMessenger = (photoObject) => {
    this.setState( {photoHold: photoObject} );
  }

  parentListTracker = (userList) => {
    this.setState( {userList: userList} )
  }

  render() {
    return (
      <HashRouter>
      <div>
      <Grid container spacing={8}>
        <Grid item xs={12}>
          <TopBar parentUserName={this.state.userName} parentViewType={this.state.viewType}
            loggedUser={this.state.loggedName} logStatus={this.state.loggedIn}
            parentLogOffTracker={this.parentLogOffTracker.bind(this)}
            parentPhotoUpload={this.parentPhotoUploadMessenger.bind(this)}
            userList={this.state.userList}/>
        </Grid>
        <div className="cs142-main-topbar-buffer"/>
        <Grid item sm={3}>
          <Paper  className="cs142-main-grid-item">
          {
            this.state.loggedIn &&
            <UserList parentNameTracker={this.parentNameTracker.bind(this)}
            parentViewTracker = {this.parentViewTracker.bind(this)}
            parentListTracker = {this.parentListTracker.bind(this)}/>
          }
          </Paper>
        </Grid>
        <Grid item sm={9}>
          <Paper className="cs142-main-grid-item">
            <Switch>
              {
                this.state.loggedIn ?
                  <Route exact path="/"
                     render={() =>
                       <Typography variant="body1">
                       Welcome!
                       </Typography>}
                   />
                  :
                 <Redirect exact path="/" to="/login-register"/>
              }
              {
                this.state.loggedIn ?
                  <Route path="/users/:userId"
                    render={ props => <UserDetail {...props} parentViewTracker = {this.parentViewTracker.bind(this)}/> }
                  />
                  :
                  <Redirect path="/users/:userId" to="/login-register"/>
              }
              {
                this.state.loggedIn ?
                  <Route path="/photos/:userId"
                    render ={ props => <UserPhotos {...props} parentViewTracker = {this.parentViewTracker.bind(this)}
                    parentNameTracker = {this.parentNameTracker.bind(this)}
                    photoUpload = {this.state.photoHold}/> }
                  />
                  :
                  <Redirect path="/photos/:userId" to="/login-register"/>
              }
              {
                this.state.loggedIn ?
                  <Route path="/users" component={UserList}  />
                  :
                  <Redirect path="/users" to="/login-register"/>
              }
              {
                !this.state.loggedIn ?
                  <Route path="/login-register"
                    render={ props =>
                      <LoginRegister {...props} parentLogStatusTracker = {this.parentLogStatusTracker.bind(this)}/>}
                  />
                  :
                  <Redirect path="/login-register" to= {"/users/" + this.state.userId}
                    render={ props => <UserDetail {...props} parentViewTracker = {this.parentViewTracker.bind(this)}/> }
                  />
              }
            </Switch>
          </Paper>
        </Grid>
      </Grid>
      </div>
    </HashRouter>
    );
  }
}


ReactDOM.render(
  <PhotoShare />,
  document.getElementById('photoshareapp'),
);
