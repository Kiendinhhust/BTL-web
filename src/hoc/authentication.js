import locationHelperBuilder from "redux-auth-wrapper/history4/locationHelper";
import { connectedRouterRedirect } from "redux-auth-wrapper/history4/redirect";

const locationHelper = locationHelperBuilder({});

export const userIsAuthenticated = connectedRouterRedirect({
    authenticatedSelector: state => state.admin.isLoggedIn,
    wrapperDisplayName: 'UserIsAuthenticated',
    redirectPath: '/',  // Chuyển hướng về trang chủ thay vì trang home
    // Không lưu đường dẫn hiện tại vào query parameter
    allowRedirectBack: false
});

export const userIsNotAuthenticated = connectedRouterRedirect({
    // Want to redirect the user when they are authenticated
    authenticatedSelector: state => !state.admin.isLoggedIn,
    wrapperDisplayName: 'UserIsNotAuthenticated',
    redirectPath: (state, ownProps) => {
        // Khi đã đăng nhập, chuyển hướng dựa vào vai trò
        const role = state.admin?.userInfo?.role || '';

        // Trả về đường dẫn phù hợp với vai trò
        if (role === 'admin') return '/system/user-manage';
        if (role === 'seller') return '/seller/shop-manage';
        if (role === 'buyer') return '/buyer/register-seller';

        // Mặc định trả về trang chủ
        return '/';
    },
    allowRedirectBack: false // Không cho phép chuyển hướng trở lại
});