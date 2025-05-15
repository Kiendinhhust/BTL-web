const { UserInfo, UserAddress } = require('../models');
const { Op } = require('sequelize');

// Lấy danh sách địa chỉ của người dùng
const getUserAddresses = async (req, res) => {
    try {
        const userId = req.params.userId;

        const userInfo = await UserInfo.findOne({ where: { user_id: userId } });
        const userAddresses = await UserAddress.findAll({
            where: { user_id: userId },
            order: [['created_at', 'DESC']], 
        });

        // Sắp xếp lại để địa chỉ mặc định lên đầu (nếu có)
        if (userInfo && userInfo.default_address_id) {
            const defaultAddressId = userInfo.default_address_id;
            const defaultAddressIndex = userAddresses.findIndex(
                address => address.address_id === defaultAddressId
            );

            if (defaultAddressIndex > -1) {
                const [defaultAddress] = userAddresses.splice(defaultAddressIndex, 1);
                userAddresses.unshift(defaultAddress);
            }
        }

        // Format lại dữ liệu
        const formattedAddresses = userAddresses.map(addr => {
            const plainAddr = addr.get({ plain: true });

            return {
                address_id: plainAddr.address_id,
                user_id: plainAddr.user_id,
                full_name: plainAddr.full_name,
                phone_number: plainAddr.phone_number,
                address_infor: [
                    plainAddr.street_address,
                    plainAddr.ward,
                    plainAddr.district,
                    plainAddr.city,
                    plainAddr.country
                ].filter(Boolean).join(', '),
                type: plainAddr.address_type,
                created_at: plainAddr.created_at
            };
        });

        return res.status(200).json(formattedAddresses);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách địa chỉ:', error);
        return res.status(500).json({
            message: 'Lỗi máy chủ nội bộ',
            error: error.message
        });
    }
};

// Thêm địa chỉ mới
const addUserAddress = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const {
            full_name, phone_number, street_address, ward, district, city,
            country = 'Vietnam', // Giá trị mặc định
            address_type
        } = req.body;

        // --- Xác thực đầu vào ---
        if (!full_name || !phone_number || !street_address || !ward || !district || !city) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin địa chỉ bắt buộc (Tên, SĐT, Đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố).' });
        }
        // Có thể thêm validate định dạng phone_number ở đây

        // --- Tạo địa chỉ mới ---
        const newAddress = await UserAddress.create({
            user_id: userId,
            full_name,
            phone_number,
            street_address,
            ward,
            district,
            city,
            country,
            address_type,
        });

        const userInfo = await UserInfo.findOne({ where: { user_id: userId } });
        if (!userInfo) {
            console.warn(`UserInfo không tìm thấy cho user_id: ${userId} khi thêm địa chỉ.`);
            return res.status(500).json({ message: "Lỗi: không tìm thấy thông tin người dùng." });
        }

        if (!userInfo.default_address_id) {
            await userInfo.update({ default_address_id: newAddress.address_id });
        }

        return res.status(201).json(newAddress.get({ plain: true }));
    } catch (error) {
        console.error('Lỗi khi thêm địa chỉ:', error);
        return res.status(500).json({
            message: 'Lỗi máy chủ nội bộ',
            error: error.message
        });
    }
};

// Cập nhật địa chỉ
const updateUserAddress = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { addressId } = req.params; // Lấy addressId từ params
        const {
            full_name, phone_number, street_address, ward, district, city,
            country, address_type
        } = req.body;

        // --- Tìm địa chỉ ---
        const address = await UserAddress.findOne({
            where: { address_id: addressId, user_id: userId } // Đảm bảo user chỉ cập nhật địa chỉ của mình
        });

        if (!address) {
            return res.status(404).json({ message: 'Không tìm thấy địa chỉ hoặc bạn không có quyền cập nhật địa chỉ này.' });
        }

        // --- Tạo object chứa các trường cần cập nhật ---
        const updateData = {};
        if (full_name !== undefined) updateData.full_name = full_name;
        if (phone_number !== undefined) updateData.phone_number = phone_number;
        if (street_address !== undefined) updateData.street_address = street_address;
        if (ward !== undefined) updateData.ward = ward;
        if (district !== undefined) updateData.district = district;
        if (city !== undefined) updateData.city = city;
        if (country !== undefined) updateData.country = country;
        if (address_type !== undefined) updateData.address_type = address_type;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'Không có thông tin nào được cung cấp để cập nhật.' });
        }

        // --- Cập nhật địa chỉ ---
        await address.update(updateData);

        return res.status(200).json(address.get({ plain: true }));
    } catch (error) {
        console.error('Lỗi khi cập nhật địa chỉ:', error);
        return res.status(500).json({
            message: 'Lỗi máy chủ nội bộ',
            error: error.message
        });
    }
};

// Xóa địa chỉ
const deleteUserAddress = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { addressId } = req.params;

        // --- Tìm địa chỉ ---
        const address = await UserAddress.findOne({
            where: { address_id: addressId, user_id: userId }
        });

        if (!address) {
            return res.status(404).json({ message: 'Không tìm thấy địa chỉ hoặc bạn không có quyền xóa địa chỉ này.' });
        }

        // --- Kiểm tra và cập nhật địa chỉ mặc định nếu cần ---
        const userInfo = await UserInfo.findOne({ where: { user_id: userId } });

        // Xóa địa chỉ
        await address.destroy();

        if (userInfo && userInfo.default_address_id === parseInt(addressId)) {
            // Tìm địa chỉ khác (mới nhất) để đặt làm mặc định
            const newDefaultAddress = await UserAddress.findOne({
                where: { user_id: userId }, // Tìm các địa chỉ còn lại của user
                order: [['created_at', 'DESC']] // Lấy địa chỉ mới nhất
            });

            if (newDefaultAddress) {
                await userInfo.update({ default_address_id: newDefaultAddress.address_id });
            } else {
                // Không còn địa chỉ nào khác, xóa default_address_id
                await userInfo.update({ default_address_id: null });
            }
        }

        return res.status(200).json({ success: true, message: 'Địa chỉ đã được xóa thành công.' });
    } catch (error) {
        console.error('Lỗi khi xóa địa chỉ:', error);
        return res.status(500).json({
            message: 'Lỗi máy chủ nội bộ',
            error: error.message
        });
    }
};

// Đặt địa chỉ làm mặc định
const setDefaultAddress = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { addressId } = req.params; // ID của địa chỉ muốn đặt làm mặc định

        // --- Tìm địa chỉ ---
        const address = await UserAddress.findOne({
            where: { address_id: addressId, user_id: userId }
        });

        if (!address) {
            return res.status(404).json({ message: 'Không tìm thấy địa chỉ hoặc bạn không có quyền thực hiện thao tác này.' });
        }

        // --- Cập nhật địa chỉ mặc định trong bảng UserInfo ---
        const userInfo = await UserInfo.findOne({ where: { user_id: userId } });
        if (!userInfo) {
             return res.status(500).json({ message: "Lỗi: không tìm thấy thông tin người dùng." });
        }

        await userInfo.update({ default_address_id: addressId });

        return res.status(200).json({ success: true, message: 'Địa chỉ mặc định đã được cập nhật.' });
    } catch (error) {
        console.error('Lỗi khi đặt địa chỉ mặc định:', error);
        return res.status(500).json({
            message: 'Lỗi máy chủ nội bộ',
            error: error.message
        });
    }
};

module.exports = {
    getUserAddresses,
    addUserAddress,
    updateUserAddress,
    deleteUserAddress,
    setDefaultAddress
};