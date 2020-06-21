import React from 'react';
import {
  Button,
  Divider,
  Typography
} from '@material-ui/core';
import './userDetail.css';
import axios from 'axios';
import { Link } from "react-router-dom";


/**
 * Define UserDetail, a React componment of CS142 project #5
 */
 class UserDetail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      user: [],
      recentPhoto: [],
      commentPhoto: [],
      topCommentNumber: 0
    }
  }

  //Fetch user info after updating
  componentDidUpdate(prevProps) {
    if (this.props != prevProps) {
      this.dataRequest();
    }
  }

  //Fetch user info after updating
  componentDidMount() {
    this.dataRequest();
  }

  //Helper to send get request
  dataRequest = () => {
    axios.get('/user/' + this.props.match.params.userId)
      .then(res => {
        let userData = res.data.user;
        let recentPhoto = res.data.recentPhoto;
        let commentPhoto = res.data.commentPhoto;
        let commentNumber = 0;
        if (commentPhoto.comments) {
          commentNumber = commentPhoto.comments.length;
        }
        this.setState({ user: userData,
                        recentPhoto: recentPhoto,
                        commentPhoto: commentPhoto,
                        topCommentNumber: commentNumber
                      });
      })
      .catch(err => {
        console.log(err);
      });
  }

  //Main render function 
  render() {
    return (
      <div>
        <Button component = {Link} to = {'/photos/' + this.props.match.params.userId}
        variant="contained" color="primary" onClick = {() => {this.props.parentViewTracker("Photos"); }}>
          User Photos
        </Button>
      <div className='large-container'>
        <div className='content-container-two'>
        {this.state.recentPhoto !== undefined &&
          this.state.recentPhoto._id !== this.state.commentPhoto._id &&
            <div>
              <div className='box-photo-comment'>
                <div className='bound-image'>
                  <a href={'photo-share.html#/photos/' + this.state.recentPhoto.user_id}>
                    <img src={"../images/" + this.state.recentPhoto.file_name}/>
                  </a>
                </div>
                <Divider />
                <div className="bound-caption">
                  <Typography variant="caption">
                    Most Recent Photo: Created on {this.state.recentPhoto.date_time}.
                  </Typography>
                </div>
                <Divider />
              </div>
              <div className='box-photo-comment'>
                <div className='bound-image'>
                  <a href={'photo-share.html#/photos/' + this.state.commentPhoto.user_id}>
                    <img src={"../images/" + this.state.commentPhoto.file_name}/>
                  </a>
                </div>
                <Divider />
                <div className="bound-caption">
                  <Typography variant="caption">
                    Most Commented Photo: This photo has {this.state.topCommentNumber} comment(s).
                  </Typography>
                </div>
                <Divider />
              </div>
            </div>
        }
        {this.state.recentPhoto !== undefined &&
          this.state.recentPhoto._id === this.state.commentPhoto._id &&
            <div className='box-photo-comment'>
              <div className='bound-image'>
                <a href={'photo-share.html#/photos/' + this.state.recentPhoto.user_id}>
                  <img src={"../images/" + this.state.recentPhoto.file_name}/>
                </a>
              </div>
              <Divider />
              <div className="bound-caption">
                <Typography variant="caption">
                  Highlight: Created on {this.state.recentPhoto.date_time} with {this.state.topCommentNumber} comment(s).
                </Typography>
              </div>
              <Divider />
            </div>
        }
        </div>
        <div className='content-container'>
          <div className="feature-content">
            <strong> First name: </strong>
            <p> {this.state.user.first_name} </p>
          </div>
          <div className="feature-content">
            <strong> Last name: </strong>
            <p> {this.state.user.last_name}</p>
          </div>
          <div className="feature-content">
            <strong> Location: </strong>
            <p> {this.state.user.location}</p>
          </div>
          <div className="feature-content">
            <strong> Description: </strong>
            <p> {this.state.user.description}</p>
          </div>
          <div className="feature-content">
            <strong> Occupation: </strong>
            <p> {this.state.user.occupation}</p>
          </div>
        </div>
      </div>
      </div>
    );
  }
}

export default UserDetail;
