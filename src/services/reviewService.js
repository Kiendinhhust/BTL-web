// src/services/reviewService.js
import axios from '../axios'; // Giả sử bạn đã cấu hình axios instance

export const createProductReviewAPI = (data) => {
    // API endpoint của bạn cho việc tạo review, ví dụ: POST /api/reviews/
    return axios.post('/api/order/review', data);
};
