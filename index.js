/*
new Updater({
  repository: 'djalmaaraujo/cowdown'
  actualRelease: 'ID_GITHUB_RELEASE',
  onProgress: function
  onError: function
  onSuccess: function
})
*/

var GITHUB_API = 'https://api.github.com/repos/';
var _          = require('lodash');
var request    = require('request');

var fs       = require('fs');
var path     = require('path');
var appPath  = path.resolve(__dirname);

var defaultOptions = {
  repository: 'djalmaaraujo/cowdown',
  dmgTempName: '.tmp-updater.dmg',
  actualRelease: 0,
  onError: function () {},
  onSuccess: function () {},
  onEnd: function (err, isUpdated) {},
  onProgress: function () {},
  onStream: function () {}
};

var Updater = function (config) {
  this.config     = _.extend(defaultOptions, config || defaultOptions);
  this.data          = '';
  this.chunkTotal    = 0;
  this.contentLength = 0;
  this.percentage    = 0;


  this.update();
};

Updater.prototype.update = function() {
  var self = this;

  self.getRelease(function (err) {
    if (err && !self.release) {
      self.config.onError(err);
    }
    else {
      if (self.hasNewVersion()) {
        self.startDownload();
      }
      else {
        self.config.onError(true, false);
      }
    }
  });
};

Updater.prototype.startDownload = function() {
  var self          = this;
  var downloadUrl   = self.release.assets[0].browser_download_url;
  var finalPath     = appPath + '/' + self.config.dmgTempName;

  try {
    var stream   = request(downloadUrl);
    var writable = fs.createWriteStream(finalPath);

    stream.pipe(writable);
    self.config.onStream(stream);

    stream.on('response', function (res) {
      self.contentLength = res.headers['content-length'];
    });

    stream.on('data', function () {
      self.onData.apply(self, arguments);
    });

    stream.on('error', self.config.onError);
    stream.on('end', self.config.onEnd);

  } catch (err) {
    self.config.onError(err);
  }
};

Updater.prototype.onData = function (chunk) {
  var self        = this;
  self.data       += chunk;
  self.chunkTotal += chunk.length;

  var p = Math.round((self.chunkTotal/self.contentLength) * 100);

  if (p > self.percentage) {
    self.percentage = p;
    self.config.onProgress(p);
  }
};

Updater.prototype.hasNewVersion = function() {
  return (this.config.actualRelease < this.release.id);
};

Updater.prototype.getRelease = function(cb) {
  var self = this;

  request({
    url: GITHUB_API + self.config.repository + '/releases',
    method: 'GET',
    json: true,
    headers: {
      'User-Agent': 'Node Webkit Github Release App'
    }
  }, function (error, response, body) {
    if (error) {
      self.config.onError(error);
      cb(error, false);
    } else {
      self.release = body[0];
      cb(false, self.release);
    }
  });
};

module.exports = Updater;
