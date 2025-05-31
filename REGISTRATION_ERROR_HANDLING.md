# Registration Error Handling

## Các lỗi được xử lý:

### 1. **Duplicate Username Errors:**
- ✅ Username đã tồn tại trong database
- ✅ Username đang trong quá trình đăng ký (tempUsers)
- ✅ Race condition khi nhiều user cùng username

### 2. **Duplicate Email Errors:**
- ✅ Email đã được sử dụng trong database

### 3. **OTP Errors:**
- ✅ OTP không hợp lệ
- ✅ OTP đã hết hạn (10 phút)
- ✅ Email không tồn tại trong tempUsers

### 4. **Database Errors:**
- ✅ SequelizeUniqueConstraintError
- ✅ PostgreSQL constraint violations (code 23505)
- ✅ Transaction rollback khi có lỗi

## Thông báo lỗi cho user:

```javascript
// Register errors
"Username đã tồn tại!"
"Username đang được sử dụng trong quá trình đăng ký khác!"
"Email đã được sử dụng!"

// VerifyOTP errors  
"Mã OTP không hợp lệ!"
"Username đã tồn tại! Vui lòng đăng ký lại với username khác."
"Username hoặc email đã tồn tại! Vui lòng đăng ký lại với thông tin khác."
```

## Cải tiến bảo mật:

1. **Transaction Safety**: Tất cả database operations trong transaction
2. **Auto-cleanup**: TempUsers tự động xóa sau 10 phút
3. **Double-check**: Kiểm tra username 2 lần (register + verifyOTP)
4. **Race condition prevention**: Lock username trong tempUsers
5. **Graceful error handling**: Không expose database errors
