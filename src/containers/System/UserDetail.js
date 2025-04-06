import React, { Component } from 'react';
import { connect } from "react-redux";
import { FormattedMessage } from 'react-intl';
import './UserDetail.scss'; // Import SCSS file

class UserDetail extends Component {

    constructor(props) {
        super(props);
        this.state = {
            // Add state properties if needed, e.g., user details fetched from API
        }
    }

    componentDidMount() {
        // Fetch user details based on ID or logged-in user info
        // Example: const userId = this.props.match?.params?.id || this.props.userInfo?.id;
        // if (userId) { /* Fetch details */ }
        console.log("User Detail Page Mounted. User Info:", this.props.userInfo);
    }

    render() {
        const { userInfo } = this.props; // Get user info from Redux state

        return (
            <div className="user-detail-container">
                <div className="title text-center"><FormattedMessage id="user-detail.title" defaultMessage="User Profile" /></div>
                <div className="user-info-section">
                    {userInfo ? (
                        <>
                            <p><strong><FormattedMessage id="user-detail.email" defaultMessage="Email:" /></strong> {userInfo.email}</p>
                            <p><strong><FormattedMessage id="user-detail.first-name" defaultMessage="First Name:" /></strong> {userInfo.firstName}</p>
                            <p><strong><FormattedMessage id="user-detail.last-name" defaultMessage="Last Name:" /></strong> {userInfo.lastName}</p>
                            {/* Add more user details as needed */}
                        </>
                    ) : (
                        <p><FormattedMessage id="user-detail.loading" defaultMessage="Loading user data..." /></p>
                    )}
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        language: state.app.language,
        userInfo: state.user.userInfo // Assuming user info is in Redux state
    };
};

const mapDispatchToProps = dispatch => {
    return {
        // Add dispatch actions if needed, e.g., fetchUserDetails(userId)
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(UserDetail);
