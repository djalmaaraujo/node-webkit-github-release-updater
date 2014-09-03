var Updater = require('./index');

new Updater({
  repository: 'djalmaaraujo/cowdown',
  dmgTempName: '.tmp-updater.dmg',
  actualRelease: 0,
  onError: function (error) {
    console.log('onError', error);
  },
  onSuccess: function () {
    console.log('onSuccess');
  },
  onProgress: function (progress) {
    console.log('onProgress', progress + '%');
  },
  onStream: function (stream) {
    // console.log(stream);
  }
});
