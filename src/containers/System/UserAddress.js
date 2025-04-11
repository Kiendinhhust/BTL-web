import React, { Component } from 'react';
import { connect } from 'react-redux';
import './UserAddress.scss';

class UserAddress extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userAddresses: [],
      loading: true
    };
  }

  componentDidMount() {
    
    setTimeout(() => {
      this.setState({
        userAddresses: [
          {
            id: 1,
            address: '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM',
            isDefault: true,
            type: 'Nhà riêng'
          },
          {
            id: 2,
            address: '456 Đường DEF, Phường UVW, Quận 2, TP.HCM',
            isDefault: false,
            type: 'Văn phòng'
          }
        ],
        loading: false
      });
    }, 1000);
  }

  render() {
    const { userAddresses, loading } = this.state;

    if (loading) {
      return (
        <div className="user-address-container">
          <div className="loading">Đang tải thông tin địa chỉ...</div>
        </div>
      );
    }

    return (
      <div className="user-address-container">
        <div className="title">
          Chi tiết địa chỉ
        </div>
        
        <div className="address-actions">
          <button className="btn-add-address">
            <i className="fas fa-plus"></i> Thêm địa chỉ mới
          </button>
        </div>
        
        <div className="address-list">
          {userAddresses.length > 0 ? (
            userAddresses.map(address => (
              <div key={address.id} className={`address-item ${address.isDefault ? 'default' : ''}`}>
                <div className="address-info">
                  <div className="address-type">
                    <span>{address.type}</span>
                    {address.isDefault && <span className="default-badge">Mặc định</span>}
                  </div>
                  <div className="address-text">{address.address}</div>
                </div>
                <div className="address-actions">
                  <button className="btn-edit">
                    <i className="fas fa-pencil-alt"></i>
                  </button>
                  <button className="btn-delete">
                    <i className="fas fa-trash"></i>
                  </button>
                  {!address.isDefault && (
                    <button className="btn-set-default">
                      Đặt làm mặc định
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="no-address">
              <i className="fas fa-map-marker-alt"></i>
              <p>Bạn chưa có địa chỉ nào</p>
            </div>
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    userInfo: state.admin.userInfo
  };
};

export default connect(mapStateToProps)(UserAddress);