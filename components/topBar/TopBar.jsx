import React from 'react';
import axios from 'axios';
import {
  AppBar, Toolbar, Typography, Button,
  Dialog, DialogTitle, DialogActions, DialogContent,
} from '@material-ui/core';
import { Multiselect } from 'multiselect-react-dropdown';
import Select from 'react-select';
import './TopBar.css';

/**
 * Define TopBar, a React componment of CS142 project #5
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      versionNumber: 5, //Stores ajax request version number, 5 is default
      dialogDisplay: false,
      permissions: [],
      permissionDisplay: false
    }
    this.uploadInput = "";
    this.uploadForm = this.uploadForm.bind(this);
    this.handlePhotoRequest = this.handlePhotoRequest.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.onRemove = this.onRemove.bind(this);
    this.enablePermissionHandler = this.enablePermissionHandler.bind(this);
  }

  //Retrieves version number whenever component updates
  componentDidUpdate(prevProps) {
    if (this.props !== prevProps) {
        this.dataRequest();
    }
  }

  //Mounting retrieval of version number and properties
  componentDidMount() {
    this.dataRequest();
  }

  //Helper to send get request
  dataRequest = () => {
    axios.get('/test/info')
      .then(res => {
        let data = res.data;
        this.setState({ user: data});
      })
      .catch(err => {
        console.log(err);
      });
  }

  //Handle log out request
  handleLogOutRequest = () => {
    axios.post('/admin/logout', {})
    .then((response) => {
      if (response.status == 400)  {
        alert("No user logged in");
      } else if (response.status == 200) {
        this.props.parentLogOffTracker(); //Update log-in status
        alert("Successfully logged off!");
      }
    })
    .catch((error) => {
      console.log(error);
      alert("No user logged in");
    });
  }

  //Handle upload request, send DOM form
  handlePhotoRequest(closed) {
    if (closed) {
      if (this.uploadInput.files.length > 0) {
        const domForm = new FormData();
        domForm.append('uploadedphoto', this.uploadInput.files[0]);
        if (this.state.permissionDisplay === true) {
          domForm.append('body', this.state.permissions); //Append permissions
        } else {
          domForm.append('body', undefined);
        }
        axios.post('/photos/new', domForm) //Send post request
        .then((response) => {
          if (response.status == 400) {
            alert("photo uploaded unsuccessfully");
          } else if (response.status == 200) {
            alert("photo uploaded successfully");
            this.props.parentPhotoUpload(response.data); //Send data to update photos page
          }
        })
        .catch((error) => {
          console.log(error);
          alert("photo uploaded unsuccessfully");
        });
      }
    }
    this.setState( { permissions: [] }) //Reset permission
    this.setState({ dialogDisplay: false }); //Dismiss dialog
  }

  //Open dialog
  handlePermissionsOpen() {
    this.setState({ dialogDisplay: true });
  }

  //Select item, add to permissions
  onSelect(selectedList, selectedItem) {
    let newPermissions = this.state.permissions;
    newPermissions.push(selectedItem);
    this.setState({ permissions: newPermissions });
  }

  //Deselect item, remove from premissions
  onRemove(selectedList, removedItem) {
    let newPermissions = this.state.permissions;
    newPermissions = newPermissions.filter(function(e) { return e !== removedItem });
    this.setState({ permissions: newPermissions });
  }

  //Enable to selection of items
  enablePermissionHandler(option) {
    if (option.value === "Yes") {
      this.setState({permissionDisplay: true});
    } else {
      this.setState({permissionDisplay: false});
    }
  }

  //Render subcomponenet for permissions form || Citation: Partially from REACT reference
  uploadForm() {
    return (
      <div className="photo-upload-display">
        <Button variant="contained" color="primary" onClick = {() => this.handlePermissionsOpen()}>
          Upload Photo
        </Button>
        <Dialog open={this.state.dialogDisplay} onClose={() => this.handlePermissionsClose(true)} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">Enable Permissions</DialogTitle>
          <DialogContent>
            <div className="dialog-display">
              <Select
                options={[{value: "Yes", label: "Yes"}, {value: "No", label: "No"}]}
                onChange={this.enablePermissionHandler}
              />
              {this.state.permissionDisplay &&
                <Multiselect
                  options={this.props.userList}
                  isObject={false}
                  onSelect={this.onSelect}
                  onRemove={this.onRemove}
                  displayValue="User Visibility"
                />
              }
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.handlePhotoRequest(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={() => this.handlePhotoRequest(true)} color="primary">
              Finish
            </Button>
          </DialogActions>
        </Dialog>
        <input className="upload-button" type="file" accept="image/*" ref={(domFileRef) => { this.uploadInput = domFileRef; }} />
      </div>
    );
  }

  //Main react function
  render() {
    return (
      <div className="topBar-box">
        <AppBar className="cs142-topbar-appBar" position="absolute">
          <Toolbar>
            {
              this.props.logStatus ?
              <div className="button-box">
                <div className="user-display">
                  <Typography className="user-display" variant="h5" color="inherit">
                    Hi {this.props.loggedUser}
                  </Typography>
                </div>
                <div className="user-display">
                  <Button variant="contained" color="primary" onClick = {this.handleLogOutRequest}>
                    Log off
                  </Button>
                </div>
                {this.uploadForm()}
              </div>
              :
              <Typography className="user-display self-display" variant="h5" color="inherit">
                  Please Login
              </Typography>
            }

            {this.state.versionNumber < 5 &&
              <Typography className="user-display" variant="h5" color="inherit" align= 'center'>
                  Version Number: {this.state.versionNumber}
              </Typography>
            }

            {this.props.parentUserName && this.props.logStatus &&
              <Typography className="user-display" variant="h5" color="inherit" align='right'>
                  {this.props.parentViewType} of {this.props.parentUserName}
              </Typography>
            }

          </Toolbar>
        </AppBar>
      </div>
    );
  }
}

export default TopBar;
