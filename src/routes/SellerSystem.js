import React, { Component } from 'react';
import { connect } from "react-redux";
import { Redirect, Route, Switch } from 'react-router-dom';
import ShopManage from '../containers/Seller/ShopManage';
import ProductManage from '../containers/Seller/ProductManage';

class SellerSystem extends Component {
    render() {
        const { sellerMenuPath } = this.props;
        return (
            <div className="seller-container">
                <div className="seller-list">
                    <Switch>
                        <Route path="/seller/shop-manage" component={ShopManage} />
                        <Route path="/seller/product-manage" component={ProductManage} />
                        <Route component={() => { return (<Redirect to={sellerMenuPath} />) }} />
                    </Switch>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        sellerMenuPath: state.app.sellerMenuPath || '/seller/shop-manage'
    };
};

const mapDispatchToProps = dispatch => {
    return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(SellerSystem);
