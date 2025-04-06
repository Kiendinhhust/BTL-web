const { User, UserInfo, UserAddress } = require('../models');
const bcrypt = require('bcrypt');
// Lấy danh sách user + thông tin của họ + địa chỉ
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [
        { model: UserInfo },
        { model: UserAddress }
      ]
    });
    res.json(users);
  } catch (error) {
    console.error('Lỗi lấy dữ liệu:', error);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
};

// Lấy thông tin user theo ID
const getUserById = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findByPk(userId, {
      include: [
        { model: UserInfo },
        { model: UserAddress }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    res.json(user);
  } catch (error) {
    console.error('Lỗi lấy dữ liệu:', error);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
};

// Tạo user mới
const createUser = async (req, res) => {
    try {
      const { username, password, email, role, phone_number, img, address_infor } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      // Kiểm tra username đã tồn tại chưa
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({
          error: 'Lỗi tạo người dùng',
          errorMessage: 'Tên người dùng đã tồn tại. Vui lòng chọn tên khác.'
        });
      }

      // Kiểm tra email đã tồn tại chưa
      const existingEmail = await UserInfo.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({
          error: 'Lỗi tạo người dùng',
          errorMessage: 'Email đã được sử dụng. Vui lòng sử dụng email khác.'
        });
      }

      // Kiểm tra số điện thoại đã tồn tại chưa
      if (phone_number) {
        const existingUserInfo = await UserInfo.findOne({ where: { phone_number } });
        if (existingUserInfo) {
          return res.status(400).json({
            error: 'Lỗi tạo người dùng',
            errorMessage: 'Số điện thoại đã được sử dụng. Vui lòng sử dụng số khác.'
          });
        }
      }

      // Tạo user cơ bản
      const newUser = await User.create({
        username,
        password_hash: hashedPassword,
        role: role || 'buyer'
      });

      if (newUser) {
        try {
          // Tạo thông tin user
          await UserInfo.create({
            user_id: newUser.user_id,
            email,
            phone_number,
            img
          });
        } catch (infoError) {
          console.error('Lỗi tạo thông tin người dùng:', infoError);
          // Xử lý lỗi, có thể xóa user đã tạo nếu cần
        }


        // Tạo địa chỉ người dùng nếu có
        if (address_infor) {
          const newAddress = await UserAddress.create({
            user_id: newUser.user_id,
            address_infor
          });



        }
      }

      res.status(201).json({
        message: 'Tạo người dùng thành công',
        user: newUser
      });
    } catch (error) {
      console.error('Lỗi tạo người dùng:', error);
      res.status(500).json({ error: 'Lỗi máy chủ' });
    }
  };

// Cập nhật thông tin user
const updateUser = async (req, res) => {
    try {
      const userId = req.params.userId;
      const { phone_number, role, address_infor, img } = req.body;

      // Kiểm tra user tồn tại
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'Không tìm thấy người dùng' });
      }

      // Cập nhật thông tin cơ bản
      if (role) {
        await user.update({
          role: role || user.role
        });
      }

      // Cập nhật thông tin chi tiết
      const userInfo = await UserInfo.findOne({ where: { user_id: userId } });
      if (userInfo) {
        const updateData = {};

        if (phone_number) {
          updateData.phone_number = phone_number;
        }

        // Chỉ cập nhật ảnh nếu có dữ liệu mới
        if (img !== undefined) {
          updateData.img = img;
        }

        if (Object.keys(updateData).length > 0) {
          await userInfo.update(updateData);
        }
      }

      // Xử lý address
      if (address_infor) {
        // Kiểm tra nếu user đã có địa chỉ
        let address = await UserAddress.findOne({ where: { user_id: userId } });

        if (address) {
          // Cập nhật địa chỉ hiện có
          await address.update({ address_infor });
        } else {
          // Tạo địa chỉ mới
          address = await UserAddress.create({
            user_id: userId,
            address_infor
          });
        }
      }

      res.json({
        message: 'Cập nhật người dùng thành công',
        user: await User.findByPk(userId, {
          include: [
            { model: UserInfo },
            { model: UserAddress }
          ]
        })
      });
    } catch (error) {
      console.error('Lỗi cập nhật người dùng:', error);
      res.status(500).json({ error: 'Lỗi máy chủ' });
    }
  };

// Xóa user
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Kiểm tra user tồn tại
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    // Xóa thông tin liên quan (UserInfo, UserAddress)
    await UserInfo.destroy({ where: { user_id: userId } });
    await UserAddress.destroy({ where: { user_id: userId } });

    // Xóa user
    await user.destroy();

    res.json({ message: 'Xóa người dùng thành công' });
  } catch (error) {
    console.error('Lỗi xóa người dùng:', error);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
