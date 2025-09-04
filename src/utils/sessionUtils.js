// const { errorResponse, successResponse } = require("./response")

// /**
//  * @summary Regenerate Session To Prevent Session Hijacking
//  * @description Đây là utils dùng để rotate session ngay sau khi người dùng hoàn thành đăng nhập tài khoản (Kể cả SSO, tài khoản thường)
//  * 
//  * @param {Request} req 
//  * @param {Response} res
//  * @param {String} refreshToken - Nhằm mục đích là không bị mất refresh token trong quá trình regenerate
//  * @param {String} userId - Id của người dùng
//  */
// const sessionLoginRotation = ( req, res, userId, refreshToken) => {
//     req.session.regenerate(function (err) { // Lợi dụng việc nhận callback function để lưu session data sau regenerate
//         if (err) {
//             console.error("Lỗi khi regenerate token: ", err.message)
//             return errorResponse(res,'Lỗi hệ thống', 500)
//         }
//         // Thực hiện lưu refreshToken vào trong session sau khi tạo ra một session mới
//         req.session.refreshToken = refreshToken
//         req.session.userId = userId
//         // Lưu session một cách tường minh để chắc chắn là dữ liệu được ghi vào Redis
//         req.session.save(function (err){
//             if (err) {
//                 console.error("ERROR: [Regenerate] - ",err.message)
//                 return errorResponse(res, "Lỗi hệ thống", 500)
//             }
//         })
//         return
//     })
// }
// utils/sessionRotation.js

/**
 * @summary Regenerate Session To Prevent Session Hijacking
 * @description Trả về một Promise, resolve khi thành công, reject khi thất bại.
 * * @param {Request} req - Đối tượng request của Express
 * @param {any} dataToSave - Một object chứa dữ liệu bạn muốn lưu vào session mới
 * @returns {Promise<void>}
 */
const sessionLoginRotation = (req, dataToSave) => {
    return new Promise((resolve, reject) => {
        // Gọi regenerate với callback
        req.session.regenerate((err) => {
            if (err) {
                console.error("Lỗi khi regenerate session: ", err);
                return reject(err); // Reject promise nếu có lỗi
            }

            // Gán tất cả dữ liệu từ dataToSave vào session mới
            for (const key in dataToSave) {
                req.session[key] = dataToSave[key];
            }
            console.log(req.session.id)
            // Lưu session một cách tường minh
            req.session.save((err) => {
                if (err) {
                    console.error("Lỗi khi lưu session sau regenerate: ", err);
                    return reject(err); // Reject promise nếu có lỗi
                }
                
                resolve(); // Resolve promise khi mọi thứ thành công
            });
        });
    });
};


module.exports = { sessionLoginRotation }
