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
            name: "menu.system.system-administrator.product-manage",
            link: "/system/product-manage",
          },
          { name: "Quản lý người bán hàng", link: "/system/shop-admin" },
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
    name: "Quản lý sản phẩm",
    link: "/seller/product-manage",
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
