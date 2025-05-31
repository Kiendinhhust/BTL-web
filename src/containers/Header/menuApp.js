export const adminMenu = [
  {
    // Trang chủ
    name: "Trang chủ",
    link: "/home",
  },
  {
    //hệ thống
    name: "menu.system.header",
    menus: [
      {
        name: "menu.system.system-administrator.header",
        subMenus: [
          {
            name: "menu.system.system-administrator.user-manage",
            link: "/system/user-manage",
          },
          {
            name: "menu.system.system-administrator.shipping-method",
            link: "/system/shipping-method",
          },
          {
            name: "menu.system.system-administrator.shop-admin",
            link: "/system/shop-admin",
          },
        ],
      },
    ],
  },
];
export const sellerMenu = [
  {
    name: "Trang chủ",
    link: "/home",
  },
  {
    name: "Quản lý cửa hàng",
    link: "/seller/shop-manage",
  },
  {
    name: "Đơn hàng cửa hàng",
    link: "/seller/orders",
  },
];

export const buyerMenu = [
  {
    name: "Trang chủ",
    link: "/home",
  },
  {
    name: "Đăng ký người bán",
    link: "/buyer/register-seller",
  },
];
