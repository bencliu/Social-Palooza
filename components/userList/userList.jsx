import React from 'react';
import {
  Divider,
  List,
  ListItem,
  ListItemText,
}
from '@material-ui/core';
import './userList.css';
import axios from 'axios';
import { Link } from "react-router-dom";

/**
 * Define UserList, a React componment of CS142 project #5
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      userList: []
    }
  }

  //Fetch user list after mounting
  componentDidMount() {
    axios.get('/user/list')
      .then(res => {
        let data = res.data;
        this.setState({ userList: data});
        let loginArray = [];
        for (let i = 0; i < this.state.userList.length; i++) {
          loginArray.push(this.state.userList[i].last_name.toLowerCase());
        }
        console.log(loginArray);
        this.props.parentListTracker(loginArray);
      })
      .catch(err => {
        console.log(err);
      });
  }

  //Send info to parent => topBar
  nameRelayer= (userName) => {
    this.props.parentNameTracker(userName);
    this.props.parentViewTracker("Information");
    let loginArray = [];
    for (let i = 0; i < this.state.userList.length; i++) {
      loginArray.push(this.state.userList[i].login_name);
    }
    this.props.parentListTracker(loginArray);
  }

  render() {
    return (
      <div>
        <List component="nav">
          {this.state.userList.map((user) =>
              <ListItem
                key={user._id}
                button component = {Link} to= {'/users/' + user._id}
                onClick= {() => this.nameRelayer(user.first_name)}
                style={{display:'flex', textAlign:'center'}}>
                  <ListItemText primary= {user.first_name + ' ' + user.last_name}/>
                  <Divider />
              </ListItem>
          )}
        </List>
      </div>
    );
  }
}

export default UserList;
