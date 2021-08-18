const { LIMIT } = require("../constants");

const pageToPagination = (page, limit = LIMIT) => {
  page = Number(page);
  limit = Number(limit);

  const offset = limit * page - limit;

  return { limit, offset };
};

function encodeString(hash) {
  var a = "";
  hash.toString();
  for (var i = 0; i < hash.length; i++) {
    var o = hash.charCodeAt(i),
      r = o ^ 69;
    a += String.fromCharCode(r);
  }
  return a;
}

function toSlug(str, separator) {
  str = str
    .toLowerCase()
    .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a")
    .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")
    .replace(/ì|í|ị|ỉ|ĩ/g, "i")
    .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o")
    .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u")
    .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y")
    .replace(/đ/g, "d")
    .replace(/\s+/g, "-")
    .replace(/[^A-Za-z0-9_-]/g, "")
    .replace(/-+/g, "-");
  if (separator) {
    return str.replace(/-/g, separator);
  }
  return str;
}

module.exports = {
  pageToPagination,
  toSlug,
  encodeString,
};
