const zlib = require('zlib');

function compressResponse(data, callback) {
    zlib.gzip(data, (err, compressedData) => {
        if (err) {
            callback(err);
        } else {
            callback(null, compressedData);
        }
    });
}

module.exports = { compressResponse };
