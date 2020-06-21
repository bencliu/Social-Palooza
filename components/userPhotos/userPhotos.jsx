import React from 'react';
import {
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField
} from '@material-ui/core';
import './userPhotos.css';
import axios from 'axios';
import { Link } from "react-router-dom";

/**
 * Define UserPhotos, a React componment of CS142 project #5
*/
class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      photoArray: [],
      commentText: "",
      dialogDisplayTracker: [],
      loggedUser: ""
    }

    this.handleCommentChange = this.handleCommentChange.bind(this);
    this.commentForm = this.commentForm.bind(this);
    this.likeDisplay = this.likeDisplay.bind(this);
    this.sortByLikes = this.sortByLikes.bind(this);
  }

  //Fetches user photo objects when component mounts
  componentDidMount() {
    this.dataRequest();
  }

  //Fetch user info after updating
  componentDidUpdate(prevProps) {
    if (this.props != prevProps) {
      this.dataRequest();
      this.handlePhotoUpload();
    }
  }

  //Get request for photos
  dataRequest = () => {
    axios.get('/photosOfUser/' + this.props.match.params.userId)
      .then(res => {
        let data = res.data;
        data = this.sortByLikes(data);
        this.setState({ photoArray: data });
      })
      .catch(err => {
        console.log(err);
      });
  }

  //Updates photo array with new photo
  handlePhotoUpload = () => {
    if (this.props.photoHold) {
      let tempPhotoArray = this.state.photoArray;
      tempPhotoArray.push(this.props.photoHold);
      this.setState( {photoArray: tempPhotoArray });
    }
  }

  //Handles closing comment; sending POST request to add comment to database
  handleCloseComment = (commented, photoId, index) => {
    console.log("HANDLECLOSE", photoId);
    if (commented) { //Finished is clicked
      let photoUrl = '/commentsOfPhoto/' + photoId;
      axios.post(photoUrl, {
        photoId: photoId,
        comment: this.state.commentText
      })
      .then((response) => {
        if (response.status == 200) { //Create comment, update photo array
          let commentObject = response.data;
          let photo_id = response.data.photo_id;
          let photoArrayCopy = this.state.photoArray;
          for (let a = 0; a < photoArrayCopy.length; a++) {
            if (photoArrayCopy[a]._id === photo_id) {
              photoArrayCopy[a].comments.push(commentObject);
              break;
            }
          }
          this.setState({photoArray: photoArrayCopy});
          alert("Comment added successfully");
        } else if (response.status == 400) { //Request unsuccessful
          alert("Comment added unsuccessfully");
        }
      })
      .catch((error) => {
        console.log(error);
        alert("No text in comment!");
      });
    }
    let displayObjectTwo = this.state.dialogDisplayTracker; //Updates display status
    displayObjectTwo[index] = false;
    this.setState({ dialogDisplayTracker: displayObjectTwo,
                    commentText: ""});
  }

  //Handles opening the comment dialog box
  handleOpenComment(index) {
    let displayObject = [];
    //Push current boolean list to array copy
    for (let b = 0; b < this.state.dialogDisplayTracker.length; b++) {
      displayObject.push(this.state.dialogDisplayTracker[b]);
    }
    let displace = displayObject.length - index + 1;
    for (let c = 0; c < displace; c++) { //Push default booleans
      displayObject.push(false);
    }
    displayObject[index] = true; //Change display status to true
    this.setState({ dialogDisplayTracker: displayObject});
  }

  //Updates comment text while typing comment
  handleCommentChange = (e) => {
    this.setState({ commentText : e.target.value })
  }

  //Render subcomponent: comment form
  commentForm(photoId, index) {
    return (
      <div>
        <Button variant="outlined" color="primary" onClick={() => this.handleOpenComment(index)}>
          New Comment
        </Button>
        <Dialog open={this.state.dialogDisplayTracker[index]} onClose={() => this.handleCloseComment(true, photoId, index)} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">Write New Comment</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id = "Comment Form"
              label = "Type your comment here"
              value = {this.state.commentText}
              onChange = {this.handleCommentChange}
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.handleCloseComment(false, photoId, index)} color="primary">
              Cancel
            </Button>
            <Button onClick={() => this.handleCloseComment(true, photoId, index)} color="primary">
              Finish
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }

  //Handles photo like action
  handleLike(photoId) {
    console.log("ID", photoId);
    let photoUrl = '/like/' + photoId;
    axios.post(photoUrl, { photoId: photoId })
    .then((response) => {
      if (response.status == 200) { //Create comment, update photo array
        let newPhoto = response.data.photo;
        let loggedUser = response.data.loggedUser;
        let photoArrayCopy = this.state.photoArray;
        let photoArrayOriginal = this.state.photoArray;
        for (let i = 0; i < photoArrayOriginal.length; i++) { //Copy updated array
          if (photoArrayCopy[i]._id === newPhoto._id) {
            photoArrayCopy[i].likes = newPhoto.likes;
            photoArrayCopy[i].userLikes = newPhoto.userLikes;
          }
        }
        photoArrayCopy = this.sortByLikes(photoArrayCopy); //Sort based on likes
        this.setState( {photoArray: photoArrayCopy,
                        loggedUser: loggedUser   });
        alert("Like handled successfully");
      } else if (response.status == 400) { //Request unsuccessful
        alert("Like handled unsuccessfully");
      }
    })
    .catch((error) => { //Catch Error
      console.log(error);
      alert("Failed!");
    });
  }

  //Helper fucntion to sort photos based on likes
  sortByLikes(photoArray) {
    let newArray = [];
    while (photoArray.length > 0) { //Iterate until original length is 0
      let max = -1;
      let maxIndex = -1;
      let dateTime = 99999999999999999999;
      for (let i = 0; i < photoArray.length; i++) { //Iterate photos
        if (photoArray[i].likes > max) {
          max = photoArray[i].likes;
          maxIndex = i;
          dateTime = new Date(photoArray[i].date_time).getTime();
        } else if (photoArray[i].likes == max) { //Tiebreaker
          let dateOne = new Date(photoArray[i].date_time).getTime();
          if (dateOne > dateTime) {
            maxIndex = i;
            dateTime = dateOne;
          }
        }
      }
      newArray.push(photoArray[maxIndex]);
      photoArray.splice(maxIndex, 1); //Pop old elem
    }
    return newArray;
  }

  //Handle unlike action
  handleUnlike(photoId) {
    let photoUrl = '/unlike/' + photoId;
    axios.post(photoUrl, { photoId: photoId })
    .then((response) => {
      if (response.status == 200) { //Create comment, update photo array
        let newPhoto = response.data.photo;
        let loggedUser = response.data.loggedUser;
        let photoArrayCopy = this.state.photoArray;
        let photoArrayOriginal = this.state.photoArray;
        for (let i = 0; i < photoArrayOriginal.length; i++) { //Change array
          if (photoArrayCopy[i]._id === newPhoto._id) {
            photoArrayCopy[i].likes = newPhoto.likes;
            photoArrayCopy[i].userLikes = newPhoto.userLikes;
          }
        }
        photoArrayCopy = this.sortByLikes(photoArrayCopy); //Sort by likes
        this.setState({photoArray: photoArrayCopy,
                       loggedUser: loggedUser   });
        alert("Unlike handled successfully");
      } else if (response.status == 400) { //Request unsuccessful
        console.log("error here");
        alert("Unlike handled unsuccessfully");
      }
    })
    .catch((error) => { //Catch error
      console.log(error);
      alert("Failed!");
    });
  }

  //Render component for like buttons
  likeDisplay(photo) {
    let likedState = false;
    for (let i = 0; i < photo.userLikes.length; i++) { //Check if liked or not by curr user
      if (photo.userLikes[i] === this.state.loggedUser) {
        likedState = true;
      }
    }
    return (
      <div className="like-container">
        <div className="like-component">
          {
            likedState ?
            <Button variant="contained" color="secondary" onClick = {() => { this.handleUnlike(photo._id); }}>
            Unlike
            </Button>
            :
            <Button variant="contained" color="secondary" onClick = {() => { this.handleLike(photo._id); }}>
            Like
            </Button>
          }
        </div>
        <div className="like-component">
          <Button variant="contained" color="primary">
          {photo.likes} like(s)
          </Button>
        </div>
      </div>
    )
  }

  //Main render function
  render() {
    var commentArrayOfArrays = []; //Track array of comments
    for (let i = 0; i < this.state.photoArray.length; i++) {
      commentArrayOfArrays.push(this.state.photoArray[i].comments);
    }
    let photoIDArray = []; //Photo ID array
    for (let t = 0; t < this.state.photoArray.length; t++) {
      photoIDArray.push(this.state.photoArray[t]._id);
    }

    return (
      <div className="full-container">
        <Button component = {Link} to = {'/users/' + this.props.match.params.userId}
        variant="contained" color="primary" onClick = {() => {this.props.parentViewTracker("Information"); }}>
          User Details
        </Button>

        <List>
          <div className="wrapper-container">
          {this.state.photoArray.map((photoObject, index) =>
                <ListItem key={photoObject._id}>
                    <div className="photo-comment-box">
                      <div className='image-bound'>
                        <img src={"../images/" + photoObject.file_name} />
                      </div>
                      <Divider />
                      <div className="caption-bound">
                        <Typography variant="caption">
                          Caption: This photo was created on {photoObject.date_time}.
                        </Typography>
                      </div>
                      {this.likeDisplay(photoObject)}
                      <Divider />

                      {photoObject.comments !== undefined &&
                        <List alignItems="flex-start">
                          {photoObject.comments.map((commentObject) => {
                              return <div key={commentObject._id} className="comment-object">
                              <ListItem>
                                <ListItemText primary = {commentObject.comment}/>
                                <div className="comment-author">
                                  <Button component = {Link} to= {'/users/' + commentObject.user._id}
                                    onClick = {() => {
                                      this.props.parentViewTracker("Information");
                                      this.props.parentNameTracker(commentObject.user.first_name);
                                     }}>
                                    - {commentObject.user.first_name} {commentObject.user.last_name}
                                  </Button>
                                </div>
                              </ListItem>
                              </div>
                          })}
                        </List>
                      }
                      {this.commentForm(photoObject._id, index)}
                    </div>
                </ListItem>
          )}
            </div>
          </List>
      </div>
    );
  }
}

export default UserPhotos;
