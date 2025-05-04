const sanitizeHtml = require('sanitize-html');

const sanitizeBody = (req, res, next) => {
  const sanitize = (value) => {
    if (typeof value === 'string') {
      return sanitizeHtml(value, {
        allowedTags: [], // Không cho phép thẻ HTML nào cả
        allowedAttributes: {} // Không cho phép thuộc tính nào
      });
    }
    if (typeof value === 'object' && value !== null) {
      // Xử lý đệ quy với object con
      for (let key in value) {
        value[key] = sanitize(value[key]);
      }
    }
    return value;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }

  next();
};

module.exports = {
    sanitizeBody
};
