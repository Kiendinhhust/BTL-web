import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Route, Switch ,withRouter} from 'react-router-dom';
import { ConnectedRouter as Router } from 'connected-react-router';
import { history } from '../redux'
import { ToastContainer } from 'react-toastify';


import { userIsAuthenticated, userIsNotAuthenticated } from '../hoc/authentication';

import { path } from '../utils'

import Home from '../routes/Home';
import Login from '../routes/Login';
import Header from './Header/Header';
import System from '../routes/System';
import Register from '../routes/Register.js';
import VerifyOTP from '../routes/VerifyOTP.js';
import HomePage from './HomePage/HomePage.js';
import { default as HomePageHeader } from './HomePage/Header.js';
import { CustomToastCloseButton } from '../components/CustomToast';
import ConfirmModal from '../components/ConfirmModal';

class App extends Component {

    handlePersistorState = () => {
        const { persistor } = this.props;
        let { bootstrapped } = persistor.getState();
        if (bootstrapped) {
            if (this.props.onBeforeLift) {
                Promise.resolve(this.props.onBeforeLift())
                    .then(() => this.setState({ bootstrapped: true }))
                    .catch(() => this.setState({ bootstrapped: true }));
            } else {
                this.setState({ bootstrapped: true });
            }
        }
    };

    componentDidMount() {
        this.handlePersistorState();
    }

    render() {
        const { location } = this.props;
        return (
            <Fragment>
                <Router history={history}>
                    <div className="main-container">
                        <ConfirmModal />
                        
                        {   location.pathname !== path.LOGIN&&( this.props.isLoggedIn ? <Header /> : <HomePageHeader />)}

                        <span className="content-container">
                        <Switch>
                            <Route path={path.LOGIN} component={userIsNotAuthenticated(Login)} />
                            <Route path={path.REGISTER} component={userIsNotAuthenticated(Register)} />
                            <Route path={path.VERIFY_OTP} component={userIsNotAuthenticated(VerifyOTP)} />
                            <Route path={path.SYSTEM} component={userIsAuthenticated(System)} />
                            <Route path={path.HOME} exact component={HomePage} />
                            <Route path={path.HOMEPAGE} component={HomePage} />
                        </Switch>
                        </span>

                        <ToastContainer
                            className="toast-container" toastClassName="toast-item" bodyClassName="toast-item-body"
                            autoClose={false} hideProgressBar={true} pauseOnHover={false}
                            pauseOnFocusLoss={true} closeOnClick={false} draggable={false}
                            closeButton={<CustomToastCloseButton />}
                        />
                    </div>
                </Router>
            </Fragment>
        )
    }
}

const mapStateToProps = state => {
    return {
        started: state.app.started,
        isLoggedIn: state.admin.isLoggedIn
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
