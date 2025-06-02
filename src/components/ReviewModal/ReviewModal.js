// src/components/ReviewModal/ReviewModal.js
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { createProductReviewAPI } from '../../services/reviewService'; // Đường dẫn đúng
import './ReviewModal.scss'; // Tạo file CSS riêng cho modal

const ReviewModal = (props) => {
    const { show, onClose, orderId, productId, itemId, productName, itemAttributes, userId } = props;
    const [rating, setRating] = useState(0); // Số sao từ 0-5
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    // const [reviewImages, setReviewImages] = useState([]); // Nếu cho phép upload ảnh

    if (!show) {
        return null;
    }

    const handleRating = (rate) => {
        setRating(rate);
    };

    const handleSubmitReview = async () => {
        if (rating === 0) {
            toast.warn('Vui lòng chọn số sao đánh giá.');
            return;
        }
        setIsSubmitting(true);
        try {
            const reviewData = {
                product_id: productId,
                item_id: itemId, // item_id của biến thể nếu có
                order_id: orderId,
                rating: rating,
                comment: comment,
                // image_urls: reviewImages.map(img => img.url) // Nếu có upload ảnh và đã có url
            };

            const response = await createProductReviewAPI(reviewData);
            // console.log("Submit review response:", response);
            if (response && response.review) { // Giả sử API trả về "review" trong response
                toast.success('Đánh giá của bạn đã được gửi thành công!');
                onClose(true); // true để báo hiệu rằng đã submit thành công và cần fetch lại order
                // Reset form
                setRating(0);
                setComment('');
            } else {
                toast.error(response.message || 'Gửi đánh giá thất bại. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            toast.error(error.response?.data?.message || 'Đã xảy ra lỗi khi gửi đánh giá.');
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <div className="review-modal-overlay">
            <div className="review-modal-content">
                <h2>Đánh giá sản phẩm</h2>
                <p className="product-name-review"><strong>Sản phẩm:</strong> {productName}</p>
                {itemAttributes && (
                    <div className="item-attributes-review">
                        <strong>Phân loại: </strong>
                        {Object.entries(
                            typeof itemAttributes === "string"
                                ? JSON.parse(itemAttributes)
                                : itemAttributes
                        ).map(([key, value], idx) => (
                            <span key={idx}> {key}: {value}{idx < Object.entries(itemAttributes).length - 1 ? ', ' : ''}</span>
                        ))}
                    </div>
                )}

                <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <span
                            key={star}
                            className={`star ${star <= (hoverRating || rating) ? 'filled' : ''}`}
                            onClick={() => handleRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                        >
                            ★ {/* Star character */}
                        </span>
                    ))}
                    {rating > 0 && <span className="rating-text">({rating}/5 sao)</span>}
                </div>

                <textarea
                    className="comment-textarea"
                    placeholder="Viết bình luận của bạn (không bắt buộc)..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows="4"
                />
                {/* Optional: Image upload section
                <div>
                    <label>Thêm hình ảnh (tối đa X ảnh):</label>
                    <input type="file" multiple onChange={handleImageUpload} />
                     Display selected image previews
                </div> */}
                <div className="modal-actions">
                    <button onClick={() => onClose(false)} className="btn-cancel-review" disabled={isSubmitting}>
                        Hủy
                    </button>
                    <button onClick={handleSubmitReview} className="btn-submit-review" disabled={isSubmitting || rating === 0}>
                        {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = (state) => ({
    userInfo: state.admin.userInfo,
});


export default connect(mapStateToProps)(ReviewModal);