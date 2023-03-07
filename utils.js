const fs = require('fs');
const zlib = require('zlib');


function loadMerkleDistFile(file) {
    let d = fs.readFileSync(file);
    d = zlib.gunzipSync(d);
    return JSON.parse(d);
}


module.exports = {
    loadMerkleDistFile,
    EulTokenAddr: '0xd9fcd98c322942075a5c3860693e9f4f03aae07b',
    EulDistributorAddr: '0xd524E29E3BAF5BB085403Ca5665301E94387A7e2',
};
