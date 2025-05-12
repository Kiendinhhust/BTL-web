const {UserInfo, UserAddress } = require('../models');


const getUserAddresses = async (req, res) => {
    try {
      const userId = req.params.userId;
      
      const userInfo = await UserInfo.findOne({ where: { user_id: userId } });
      const userAddresses = await UserAddress.findAll({ 
        where: { user_id: userId },
        raw: true // Thêm dòng này để convert thành plain object
      });
  
      if (userInfo && userInfo.default_address) {
        const defaultAddressIndex = userAddresses.findIndex(
          address => address.address_id === userInfo.default_address
        );
        
        if (defaultAddressIndex > -1) {
          const [defaultAddress] = userAddresses.splice(defaultAddressIndex, 1);
          userAddresses.unshift(defaultAddress);
        }
      }
      
      return res.status(200).json(userAddresses); // Di chuyển return ra ngoài if
    } catch (error) {
      console.error('Error getting user addresses:', error);
      return res.status(500).json({
        message: 'Internal server error',
        error: error.message
      });
    }
  };

// Thêm địa chỉ mới
const addUserAddress = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { address_infor, type } = req.body;
        
        // Tạo địa chỉ mới
        const newAddress = await UserAddress.create({
            user_id: userId,
            address_infor,
            type,
            created_at: new Date()
        });
        
        // Kiểm tra xem đây có phải là địa chỉ đầu tiên hay không
        const addressCount = await UserAddress.count({ where: { user_id: userId } });
        
        // Nếu là địa chỉ đầu tiên, đặt làm mặc định
        if (addressCount === 1) {
            await UserInfo.update(
                { default_address: newAddress.address_id },
                { where: { user_id: userId } }
            );
        }
        
        return res.status(201).json(newAddress);
    } catch (error) {
        console.error('Error adding user address:', error);
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Cập nhật địa chỉ
const updateUserAddress = async (req, res) => {
    try {
        const { userId, addressId } = req.params;
        const { address_infor, type } = req.body;
        
        // Tìm địa chỉ
        const address = await UserAddress.findOne({
            where: { address_id: addressId, user_id: userId }
        });
        
        if (!address) {
            return res.status(404).json({
                message: 'Address not found'
            });
        }
        
        // Cập nhật địa chỉ
        await address.update({
            address_infor,
            type
        });
        
        return res.status(200).json(address);
    } catch (error) {
        console.error('Error updating user address:', error);
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Xóa địa chỉ
const deleteUserAddress = async (req, res) => {
    try {
        const { userId, addressId } = req.params;
        
        // Tìm địa chỉ
        const address = await UserAddress.findOne({
            where: { address_id: addressId, user_id: userId }
        });
        
        if (!address) {
            return res.status(404).json({
                message: 'Address not found'
            });
        }
        
        // Kiểm tra xem địa chỉ này có phải là mặc định không
        const userInfo = await UserInfo.findOne({
            where: { user_id: userId }
        });
        
        // Xóa địa chỉ
        await address.destroy();
        
        // Nếu đã xóa địa chỉ mặc định, tìm địa chỉ khác để đặt làm mặc định
        if (userInfo && userInfo.default_address === parseInt(addressId)) {
            // Tìm địa chỉ mới nhất để đặt làm mặc định
            const newDefaultAddress = await UserAddress.findOne({
                where: { user_id: userId },
                order: [['created_at', 'DESC']]
            });
            
            if (newDefaultAddress) {
                await userInfo.update({
                    default_address: newDefaultAddress.address_id
                });
            } else {
                await userInfo.update({
                    default_address: null
                });
            }
        }
        
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error deleting user address:', error);
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Đặt địa chỉ mặc định
const setDefaultAddress = async (req, res) => {
    try {
        const { userId, addressId } = req.params;
        
        // Tìm địa chỉ
        const address = await UserAddress.findOne({
            where: { address_id: addressId, user_id: userId }
        });
        
        if (!address) {
            return res.status(404).json({
                message: 'Address not found'
            });
        }
        
        // Cập nhật địa chỉ mặc định trong bảng UserInfo
        await UserInfo.update(
            { default_address: addressId },
            { where: { user_id: userId } }
        );
        
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error setting default address:', error);
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Đảm bảo export các hàm mới
module.exports = {
    getUserAddresses,
    addUserAddress,
    updateUserAddress,
    deleteUserAddress,
    setDefaultAddress
};

