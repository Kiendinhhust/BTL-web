import React, { Component } from 'react';
import { connect } from "react-redux";
import { Redirect, Route, Switch } from 'react-router-dom';
import RegisterSeller from '../containers/Buyer/RegisterSeller';

class BuyerSystem extends Component {
    render() {
        const { buyerMenuPath } = this.props;
        return (
            <div className="buyer-container">
                <div className="buyer-list">
                    <Switch>
                        <Route path="/buyer/register-seller" component={RegisterSeller} />
                        <Route component={() => { return (<Redirect to={buyerMenuPath} />) }} />
                    </Switch>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        buyerMenuPath: state.app.buyerMenuPath || '/buyer/register-seller'
    };
};

const mapDispatchToProps = dispatch => {
    return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(BuyerSystem);