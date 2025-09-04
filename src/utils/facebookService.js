const axios = require('axios')
const config = require('../config/index')
const facebookVerifyLogin = async (accessToken) => {
    // --- BƯỚC QUAN TRỌNG: GỌI API DEBUG_TOKEN CỦA FACEBOOK ---
    const appAccessToken = `${config.FACEBOOK_APP_ID}|${config.FACEBOOK_APP_SECRET}`
    const url = `https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${appAccessToken}`
    const response = await axios.get(url)
    const {data}  = response.data
    // --- KIỂM TRA TÍNH HỢP LỆ CỦA TOKEN ---
    // 1. Kiểm tra token có hợp lệ không
    // 2. Kiểm tra token này có phải được tạo ra cho ứng dụng của BẠN không
    if (!data.is_valid || data.app_id !== config.FACEBOOK_APP_ID) {
        return res.status(401).json({ success: false, message: 'Invalid Facebook token.' });  // Lỗi tiếp nè
    }
    // Token hợp lệ, lấy user_id đã được xác thực
    const facebookUserId = data.user_id;
    // Lấy thêm thông tin người dùng trực tiếp từ Facebook bằng chính accessToken đó
    const profileUrl = `https://graph.facebook.com/${facebookUserId}?fields=id,first_name,last_name,email&access_token=${accessToken}`;
    const profileResponse = await axios.get(profileUrl);
    const { id, first_name, last_name } = profileResponse.data;
    const facebookPayload = { id, first_name, last_name } 
    return facebookPayload
}

module.exports = { facebookVerifyLogin}