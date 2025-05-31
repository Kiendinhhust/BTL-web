const { User, UserInfo, UserAddress, Shop, ShopRevenue } = require("../models");
const bcrypt = require("bcrypt");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [{ model: UserInfo }, { model: UserAddress }],
    });
    res.json(users);
  } catch (error) {
    console.error("Lỗi lấy dữ liệu:", error);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
};

const getUserById = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findByPk(userId, {
      include: [{ model: UserInfo }, { model: UserAddress }],
    });

    if (!user) {
      return res.status(404).json({ error: "Không tìm thấy người dùng" });
    }

    res.json(user);
  } catch (error) {
    console.error("Lỗi lấy dữ liệu:", error);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
};

const createUser = async (req, res) => {
  try {
    const {
      username,
      password,
      email,
      role,
      phone_number,
      img,
      address_infor,
    } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({
        error: "Lỗi tạo người dùng",
        errorMessage: "Tên người dùng đã tồn tại. Vui lòng chọn tên khác.",
      });
    }

    const existingEmail = await UserInfo.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({
        error: "Lỗi tạo người dùng",
        errorMessage: "Email đã được sử dụng. Vui lòng sử dụng email khác.",
      });
    }

    if (phone_number) {
      const existingUserInfo = await UserInfo.findOne({
        where: { phone_number },
      });
      if (existingUserInfo) {
        return res.status(400).json({
          error: "Lỗi tạo người dùng",
          errorMessage:
            "Số điện thoại đã được sử dụng. Vui lòng sử dụng số khác.",
        });
      }
    }

    const newUser = await User.create({
      username,
      password_hash: hashedPassword,
      role: role || "buyer",
    });

    if (newUser) {
      try {
        await UserInfo.create({
          user_id: newUser.user_id,
          email,
          phone_number,
          img,
        });
      } catch (infoError) {
        console.error("Lỗi tạo thông tin người dùng:", infoError);
      }

      if (address_infor) {
        const newAddress = await UserAddress.create({
          user_id: newUser.user_id,
          address_infor,
        });
      }
    }

    res.status(201).json({
      message: "Tạo người dùng thành công",
      user: newUser,
    });
  } catch (error) {
    console.error("Lỗi tạo người dùng:", error);
    res.status(500).json({ error: "Lỗi máy chủ" });
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
      return res.status(404).json({ error: "Không tìm thấy người dùng" });
    }

    // Cập nhật thông tin cơ bản
    if (role) {
      await user.update({
        role: role || user.role,
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
          address_infor,
        });
      }
    }

    res.json({
      message: "Cập nhật người dùng thành công",
      user: await User.findByPk(userId, {
        include: [{ model: UserInfo }, { model: UserAddress }],
      }),
    });
  } catch (error) {
    console.error("Lỗi cập nhật người dùng:", error);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
};

const updateUserDetail = async (req, res) => {
  try {
    const userId = req.params.userId;
    const {
      phone_number,
      firstname,
      lastname,
      address_infor,
      img,
      currentPassword,
      newPassword,
    } = req.body;

    // Kiểm tra user tồn tại
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "Không tìm thấy người dùng" });
    }

    // Xử lý cập nhật mật khẩu nếu có
    if (currentPassword && newPassword) {
      // Kiểm tra mật khẩu hiện tại
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password_hash
      );
      if (!isPasswordValid) {
        return res.status(400).json({
          error: "Lỗi cập nhật người dùng",
          errorMessage: "Mật khẩu hiện tại không đúng",
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await user.update({
        password_hash: hashedPassword,
      });
    }

    const userInfo = await UserInfo.findOne({ where: { user_id: userId } });
    if (userInfo) {
      const updateData = {};

      if (phone_number) {
        updateData.phone_number = phone_number;
      }

      if (firstname !== undefined) {
        updateData.firstname = firstname;
      }

      if (lastname !== undefined) {
        updateData.lastname = lastname;
      }

      if (img !== undefined) {
        updateData.img = img;
      }

      if (Object.keys(updateData).length > 0) {
        await userInfo.update(updateData);
      }
    }

    if (address_infor) {
      let address = await UserAddress.findOne({ where: { user_id: userId } });
      if (address) {
        await address.update({ address_infor });
      } else {
        address = await UserAddress.create({
          user_id: userId,
          address_infor,
        });
      }
    }

    res.json({
      message: "Cập nhật người dùng thành công",
      success: true,
      user: await User.findByPk(userId, {
        include: [{ model: UserInfo }, { model: UserAddress }],
      }),
    });
  } catch (error) {
    console.error("Lỗi cập nhật người dùng:", error);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
};
// Xóa user
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Kiểm tra user tồn tại
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "Không tìm thấy người dùng" });
    }

    // Xóa thông tin liên quan (UserInfo, UserAddress)
    await UserInfo.destroy({ where: { user_id: userId } });
    await UserAddress.destroy({ where: { user_id: userId } });

    // Xóa user
    await user.destroy();

    res.json({ message: "Xóa người dùng thành công" });
  } catch (error) {
    console.error("Lỗi xóa người dùng:", error);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserDetail,
};
