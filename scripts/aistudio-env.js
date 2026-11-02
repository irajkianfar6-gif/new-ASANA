'use strict';
const http = require('node:http');

process.env.IFA_PORT = '3000';
process.env.IFA_HOST = '0.0.0.0';
process.env.IFA_OPEN_SCOPE = 'all';
if (process.env.IFA_DATA === '/data') {
  delete process.env.IFA_DATA;
}

const origWriteHead = http.ServerResponse.prototype.writeHead;
http.ServerResponse.prototype.writeHead = function (statusCode, statusMessage, headers) {
  let hdrs = typeof statusMessage === 'object' && statusMessage !== null ? statusMessage : headers;
  if (hdrs && typeof hdrs === 'object' && !Array.isArray(hdrs)) {
    delete hdrs['X-Frame-Options'];
    delete hdrs['x-frame-options'];
  }
  return origWriteHead.apply(this, arguments);
};
