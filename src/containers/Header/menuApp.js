export const adminMenu = [
    { // Trang chủ
        name: 'Trang chủ', link: '/home'
    },
    { //hệ thống
        name: 'menu.system.header', menus: [
            {
                name: 'menu.system.system-administrator.header',
                subMenus: [
                    { name: 'menu.system.system-administrator.user-manage', link: '/system/user-manage' },
                    { name: 'menu.system.system-administrator.product-manage', link: '/system/product-manage' },
                    { name: 'menu.system.system-administrator.register-package-group-or-account', link: '/system/register-package-group-or-account' },
                ]
            },

        ]
    },
];
export const sellerMenu = [
    {
        name: 'Trang chủ',
        link: '/home'
    },

    {
        name: 'Quản lý cửa hàng',
        link: '/seller/shop-manage'
    },
];

export const buyerMenu = [
    {
        name: 'Trang chủ',
        link: '/home'
    },
    {
        name: 'Đăng ký người bán',
        link: '/buyer/register-seller'
    },
];
