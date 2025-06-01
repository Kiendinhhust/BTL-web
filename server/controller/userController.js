const { User, UserInfo, UserAddress, Shop, ShopRevenue, OrderShipping, sequelize } = require("../models");
const { Op } = require('sequelize');

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

// Lấy danh sách tất cả người dùng có vai trò 'shipper' (Admin hoặc Seller)
const getAllShippers = async (req, res) => {
    try {
        // Middleware authorizeRole(['admin', 'seller']) đã kiểm tra quyền
        const shippers = await User.findAll({
            where: { role: 'shipper' },
            attributes: { exclude: ['password_hash'] },
            include: [
                {
                    model: UserInfo,
                    attributes: ['email', 'phone_number', 'firstname', 'lastname']
                },
            ],
            order: [['created_at', 'DESC']]
        });
        res.status(200).json(shippers);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách shippers:", error);
        res.status(500).json({ message: "Lỗi máy chủ khi lấy danh sách shippers." });
    }
};

// Lấy thông tin chi tiết một shipper bằng ID (Admin hoặc Seller)
const getShipperById = async (req, res) => {
    try {
        const shipperId = parseInt(req.params.shipperId);
        // Middleware authorizeRole(['admin', 'seller']) đã kiểm tra quyền cơ bản
        // Có thể thêm logic kiểm tra seller có quyền xem shipper của shop họ không nếu cần

        const shipper = await User.findOne({
            where: { user_id: shipperId, role: 'shipper' },
            attributes: { exclude: ['password_hash'] },
            include: [
                { model: UserInfo,},
                { model: UserAddress, as: 'user_addresses' },
                {
                  model: OrderShipping,
                  as: 'assignedShipments',
                  attributes: [
                      [sequelize.fn('COUNT', sequelize.col('assignedShipments.order_shipping_id')), 'totalDeliveredOrders']
                  ],
                  where: { status: 'delivered' },
                  required: false
                }
            ]
        });

        if (!shipper) {
            return res.status(404).json({ message: "Không tìm thấy shipper hoặc người dùng không phải là shipper." });
        }

        const plainShipper = shipper.get({ plain: true });
        if (plainShipper.assignedShipments && plainShipper.assignedShipments.length > 0 && plainShipper.assignedShipments[0].totalDeliveredOrders) {
            plainShipper.totalDeliveredOrders = parseInt(plainShipper.assignedShipments[0].totalDeliveredOrders);
        } else {
            plainShipper.totalDeliveredOrders = 0;
        }
        delete plainShipper.assignedShipments;

        res.status(200).json(plainShipper);
    } catch (error) {
        console.error(`Lỗi khi lấy thông tin shipper ID ${req.params.shipperId}:`, error);
        res.status(500).json({ message: "Lỗi máy chủ khi lấy thông tin shipper." });
    }
};

// Tìm shipper theo số điện thoại (Admin hoặc Seller)
const findShipperByPhoneNumber = async (req, res) => {
    try {
        const { phone_number } = req.query;
        // Middleware authorizeRole(['admin', 'seller']) đã kiểm tra quyền

        if (!phone_number) {
            return res.status(400).json({ message: "Vui lòng cung cấp số điện thoại để tìm kiếm." });
        }

        const shipper = await User.findOne({
            attributes: { exclude: ['password_hash'] },
            include: [{
                model: UserInfo,
              
                where: { phone_number: phone_number },
                required: true
            }],
            where: { role: 'shipper' }
        });

        if (!shipper) {
            return res.status(404).json({ message: `Không tìm thấy shipper với số điện thoại '${phone_number}'.` });
        }
        res.status(200).json(shipper);
    } catch (error) {
        console.error("Lỗi khi tìm shipper theo số điện thoại:", error);
        res.status(500).json({ message: "Lỗi máy chủ khi tìm kiếm shipper." });
    }
};

// Chuyển đổi vai trò của một User thành 'shipper' (Yêu cầu quyền Admin HOẶC User đó tự đăng ký - logic phức tạp hơn)
// Hiện tại router của bạn chưa phân quyền cho route này, nên sẽ hiểu là người dùng tự thao tác (cần sửa) hoặc admin (phổ biến hơn).
// Tôi sẽ giả định đây là API admin hoặc cần logic phân quyền chặt chẽ hơn.
// SỬA ĐỔI: Kiểm tra quyền và số điện thoại
const setUserAsShipper = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const userIdToUpdate = parseInt(req.params.userId);
        const currentUserId = req.user.user_id;
        const currentUserRole = req.user.role;

        // --- Phân quyền ---
        // Kịch bản 1: Admin thực hiện
        // Kịch bản 2: Seller của shop muốn đăng ký nhân viên của họ làm shipper (cần thêm logic check shop_id)
        // Kịch bản 3: User tự đăng ký làm shipper (nếu hệ thống cho phép)
        // Hiện tại, router không có authorizeRole, nghĩa là BẤT KỲ USER ĐÃ ĐĂNG NHẬP NÀO CŨNG CÓ THỂ GỌI
        // => Đây là lỗ hổng bảo mật. Cần thêm authorizeRole(['admin']) hoặc logic phức tạp hơn vào router hoặc ở đây.
        // Tạm thời, sẽ cho phép admin hoặc user tự set role cho chính mình (CẦN CÂN NHẮC KỸ)
        if (currentUserRole !== 'admin' && currentUserId !== userIdToUpdate) {
             await transaction.rollback();
             return res.status(403).json({ message: "Truy cập bị từ chối. Bạn không có quyền thực hiện thao tác này." });
        }
        // Nếu là user tự set, có thể cần thêm các điều kiện khác (vd: đã xác minh thông tin,...)

        const user = await User.findByPk(userIdToUpdate, {
            include: [{ model: UserInfo, attributes: ['phone_number'] }],
            transaction
        });

        if (!user) {
            await transaction.rollback();
            return res.status(404).json({ message: "Không tìm thấy người dùng." });
        }

        if (user.role === 'shipper') {
            await transaction.rollback();
            return res.status(400).json({ message: "Người dùng này đã là shipper." });
        }

        // --- Kiểm tra điều kiện tiên quyết: User phải có số điện thoại trong UserInfo ---
        if (!user.user_info || !user.user_info.phone_number) {
            await transaction.rollback();
            return res.status(400).json({ message: "Không thể đặt làm shipper. Người dùng này chưa cập nhật số điện thoại." });
        }

        // Cập nhật vai trò
        await user.update({ role: 'shipper' }, { transaction });
        await transaction.commit();

        const updatedUser = await User.findByPk(userIdToUpdate, {
            attributes: { exclude: ['password_hash'] },
            include: [{ model: UserInfo,}]
        });
        res.status(200).json({ message: `Người dùng '${user.username}' đã được cập nhật vai trò thành shipper.`, user: updatedUser });

    } catch (error) {
        if (transaction && !transaction.finished) await transaction.rollback();
        console.error(`Lỗi khi cập nhật vai trò người dùng ID ${req.params.userId} thành shipper:`, error);
        res.status(500).json({ message: "Lỗi máy chủ khi cập nhật vai trò người dùng." });
    }
};

// Gỡ bỏ vai trò 'shipper' (Admin)
const removeShipperRole = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const userIdToUpdate = parseInt(req.params.userId);
        // Middleware authorizeRole(['admin']) đã kiểm tra quyền

        const user = await User.findByPk(userIdToUpdate, { transaction });
        if (!user) {
            await transaction.rollback();
            return res.status(404).json({ message: "Không tìm thấy người dùng." });
        }

        if (user.role !== 'shipper') {
            await transaction.rollback();
            return res.status(400).json({ message: "Người dùng này không phải là shipper." });
        }

        const activeAssignments = await OrderShipping.count({
            where: {
                shipper_id: userIdToUpdate,
                status: { [Op.notIn]: ['delivered', 'canceled', 'returned'] }
            },
            transaction
        });

        if (activeAssignments > 0) {
            await transaction.rollback();
            return res.status(400).json({ message: `Không thể gỡ vai trò shipper. Người dùng này đang được gán cho ${activeAssignments} đơn hàng đang hoạt động.` });
        }

        await user.update({ role: 'buyer' }, { transaction }); // Chuyển về buyer
        await transaction.commit();

        const updatedUser = await User.findByPk(userIdToUpdate, {
            attributes: { exclude: ['password_hash'] },
            include: [{ model: UserInfo,}]
        });
        res.status(200).json({ message: `Đã gỡ bỏ vai trò shipper cho người dùng '${user.username}'.`, user: updatedUser });

    } catch (error) {
        if (transaction && !transaction.finished) await transaction.rollback();
        console.error(`Lỗi khi gỡ bỏ vai trò shipper cho người dùng ID ${req.params.userId}:`, error);
        res.status(500).json({ message: "Lỗi máy chủ khi gỡ bỏ vai trò shipper." });
    }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserDetail,
  // Các hàm mới cho shipper
  getAllShippers,
  getShipperById,
  findShipperByPhoneNumber,
  setUserAsShipper,
  removeShipperRole,
};
