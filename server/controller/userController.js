const { User, UserInfo, UserAddress } = require('../models');

// Lấy danh sách user + thông tin của họ + địa chỉ
const getUserInfor = async (req, res) => {
    try {
        const user_id = req.user.user_id
        const user = await User.findOne({
            where: {user_id},
            attributes: { exclude: ['password_hash'] },
            include: [
                { model: UserInfo, as: "user_info"}, // Lấy cả thông tin user
                { model: UserAddress, as: "user_addresses" } // Lấy cả địa chỉ của user
            ]
        });

        res.json(user); // Trả về JSON
    } catch (error) {
        console.error('Lỗi lấy dữ liệu:', error);
        res.status(500).json({ error: 'Lỗi máy chủ' });
    }
};

const getAllUsers = async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: { exclude: ['password_hash'] },
        include: [
          { model: UserInfo, as: "user_info" },
          { model: UserAddress, as: "user_addresses" }
        ]
      });
      res.json(users);
    } catch (error) {
      console.error('Lỗi lấy dữ liệu:', error);
      res.status(500).json({ error: 'Lỗi máy chủ' });
    }
};

const getUserById = async (req, res) => {
    try {
      const userId = req.params.userId;
      const user = await User.findByPk(userId, {
        attributes: { exclude: ['password_hash'] },
        include: [
          { model: UserInfo, as: "user_info" },
          { model: UserAddress, as: "user_addresses" }
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

const createUser = async (req, res) => {
    try {
      const { username, password, email, role, phone_number, img, address_infor } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({
          error: 'Lỗi tạo người dùng',
          errorMessage: 'Tên người dùng đã tồn tại. Vui lòng chọn tên khác.'
        });
      }

      const existingEmail = await UserInfo.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({
          error: 'Lỗi tạo người dùng',
          errorMessage: 'Email đã được sử dụng. Vui lòng sử dụng email khác.'
        });
      }

      if (phone_number) {
        const existingUserInfo = await UserInfo.findOne({ where: { phone_number } });
        if (existingUserInfo) {
          return res.status(400).json({
            error: 'Lỗi tạo người dùng',
            errorMessage: 'Số điện thoại đã được sử dụng. Vui lòng sử dụng số khác.'
          });
        }
      }

      const newUser = await User.create({
        username,
        password_hash: hashedPassword,
        role: role || 'buyer'
      });

      if (newUser) {
        try {
          await UserInfo.create({
            user_id: newUser.user_id,
            email,
            phone_number,
            img
          });
        } catch (infoError) {
          console.error('Lỗi tạo thông tin người dùng:', infoError);
        }


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
        const { phone_number, role, address_infor } = req.body;
        const img = req.file

        // 1. Kiểm tra user tồn tại
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'Không tìm thấy người dùng' });
        }

        // 2. Cập nhật thông tin cơ bản trên bảng User
        const userUpdateData = {};
        if (role !== undefined && req.user.role === 'admin') {
          userUpdateData.role = role;
        }

        if (Object.keys(userUpdateData).length > 0) {
            await user.update(userUpdateData);
        }

        // 3. Cập nhật thông tin chi tiết trên bảng UserInfo
        const userInfo = await UserInfo.findOne({ where: { user_id: userId } });
        if (userInfo) {
            const userInfoUpdateData = {};
            if (phone_number !== undefined) {
                // Kiểm tra số điện thoại hơpj lệ
                const existingPhone = await UserInfo.findOne({ where: { phone_number, user_id: { [Op.ne]: userId } } });
                if (existingPhone) {
                    return res.status(400).json({ error: 'Số điện thoại đã được sử dụng bởi người dùng khác.' });
                }
                userInfoUpdateData.phone_number = phone_number;
            }
            if (img !== undefined) { // Cho phép truyền null để xóa ảnh
                userInfoUpdateData.avatar_url = img; // Giả sử trường trong DB là avatar_url
            }
            // Thêm các trường khác của UserInfo nếu có: full_name, ...

            if (Object.keys(userInfoUpdateData).length > 0) {
                await userInfo.update(userInfoUpdateData);
            }
        } else if (phone_number || img) {
            // Nếu UserInfo chưa tồn tại mà có dữ liệu để tạo thì tạo mới
            // Cần email để tạo UserInfo, có thể lấy từ đâu đó hoặc yêu cầu trong body
            console.warn(`UserInfo không tồn tại cho user_id: ${userId}, cân nhắc việc tạo mới nếu có đủ thông tin.`);
        }

        // 4. Xử lý địa chỉ trên bảng UserAddress
        if (address_infor) { // address_infor nên là một object { full_name, phone_number, street_address, ...}
            // Giả sử User chỉ có 1 địa chỉ chính hoặc bạn có logic chọn/tạo địa chỉ cụ thể
            let address = await UserAddress.findOne({ where: { user_id: userId /*, address_type: 'default' */ } });

            if (address) {
                // Cập nhật địa chỉ hiện có
                await address.update({
                    full_name: address_infor.full_name || address.full_name,
                    phone_number: address_infor.phone_number || address.phone_number,
                    street_address: address_infor.street_address || address.street_address,
                    ward: address_infor.ward || address.ward,
                    district: address_infor.district || address.district,
                    city: address_infor.city || address.city,
                    // ... các trường khác của UserAddress
                });
            } else {
                // Tạo địa chỉ mới nếu chưa có (và có đủ thông tin)
                if (address_infor.full_name && address_infor.phone_number && address_infor.street_address) {
                    address = await UserAddress.create({
                        user_id: userId,
                        ...address_infor
                    });
                } else {
                    console.warn("Thiếu thông tin cần thiết để tạo địa chỉ mới cho người dùng.");
                }
            }
        }

        // 5. Lấy lại thông tin user đã cập nhật để trả về
        const updatedUser = await User.findByPk(userId, {
            attributes: { exclude: ['password_hash'] },
            include: [
                { model: UserInfo, as: "user_info" },
                { model: UserAddress, as: "user_addresses" }
            ]
        });

        res.json({
            message: 'Cập nhật người dùng thành công',
            user: updatedUser
        });

    } catch (error) {
        console.error('Lỗi cập nhật người dùng:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Dữ liệu bị trùng lặp (ví dụ: số điện thoại).', details: error.errors });
        }
        res.status(500).json({ error: 'Lỗi máy chủ khi cập nhật người dùng.' });
    }
};

// Cập nhật thông tin chi tiết
const updateUserDetail = async (req, res) => {
    try {
        const userId = req.user.user_id; // Người dùng chỉ cập nhật thông tin của chính họ
        const {
            full_name, // Đổi từ firstname, lastname thành full_name cho khớp UserInfo
            phone_number,
            // address_infor,
            avatar_url,
            email,
            currentPassword,
            newPassword
        } = req.body;

        // 1. Kiểm tra user tồn tại
        const user = await User.findByPk(userId);
        if (!user) {
            // Trường hợp này hiếm khi xảy ra nếu token hợp lệ
            return res.status(404).json({ error: 'Không tìm thấy người dùng của bạn.' });
        }

        // 2. Xử lý cập nhật mật khẩu nếu có
        if (currentPassword && newPassword) {
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
            if (!isPasswordValid) {
                return res.status(400).json({
                    error: 'Cập nhật thất bại',
                    errorMessage: 'Mật khẩu hiện tại không đúng.'
                });
            }
            if (newPassword.length < 6) { // Ví dụ: yêu cầu mật khẩu tối thiểu 6 ký tự
                 return res.status(400).json({ error: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
            }
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await user.update({ password_hash: hashedPassword });
        } else if (currentPassword || newPassword) {
            // Nếu chỉ cung cấp 1 trong 2, báo lỗi
            return res.status(400).json({ error: 'Vui lòng cung cấp cả mật khẩu hiện tại và mật khẩu mới để thay đổi.' });
        }


        // 3. Cập nhật thông tin trên bảng UserInfo
        // Giả sử UserInfo đã được tạo khi đăng ký hoặc có logic tạo nếu chưa có
        let userInfo = await UserInfo.findOne({ where: { user_id: userId } });
        const userInfoUpdateData = {};

        if (full_name !== undefined) {
            userInfoUpdateData.full_name = full_name;
        }
        if (phone_number !== undefined) {
             const existingPhone = await UserInfo.findOne({ where: { phone_number, user_id: { [Op.ne]: userId } } });
             if (existingPhone) {
                 return res.status(400).json({ error: 'Số điện thoại đã được sử dụng bởi người dùng khác.' });
             }
            userInfoUpdateData.phone_number = phone_number;
        }
        if (avatar_url !== undefined) { // Cho phép truyền null để xóa ảnh
            userInfoUpdateData.avatar_url = avatar_url;
        }

        if (Object.keys(userInfoUpdateData).length > 0) {
            if (userInfo) {
                await userInfo.update(userInfoUpdateData);
            } else {
                // Nếu UserInfo chưa tồn tại, tạo mới
                const userRecord = await User.findByPk(userId, { include: [{model: UserInfo, as: 'user_info'}]});
                 if(userRecord && userRecord.user_info && userRecord.user_info.email){
                    userInfo = await UserInfo.create({
                        user_id: userId,
                        email: userRecord.user_info.email, // Cần email để tạo
                        ...userInfoUpdateData
                    });
                 } else {
                    console.warn(`Không thể tạo/cập nhật UserInfo cho user_id: ${userId} do thiếu email hoặc UserInfo chưa tồn tại.`);
                 }
            }
        }

        // 5. Lấy lại thông tin user đã cập nhật để trả về
        const updatedUser = await User.findByPk(userId, {
            attributes: { exclude: ['password_hash'] },
            include: [
                { model: UserInfo, as: "user_info" },
                { model: UserAddress, as: "user_addresses" }
            ]
        });

        res.json({
            message: 'Cập nhật thông tin thành công!',
            success: true,
            user: updatedUser
        });

    } catch (error) {
        console.error('Lỗi cập nhật thông tin chi tiết người dùng:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Dữ liệu bị trùng lặp (ví dụ: số điện thoại).', details: error.errors });
        }
        res.status(500).json({ error: 'Lỗi máy chủ khi cập nhật thông tin.' });
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
    getUserInfor,
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    updateUserDetail  
};