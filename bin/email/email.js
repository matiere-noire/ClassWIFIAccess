var nodemailer = require('nodemailer');
var config = require(appRoot + '/bin/email/config');
var logger = require(appRoot + "/app").logger;

var transporter = nodemailer.createTransport({
  host: config.host,
  port: config.port,
  secure: false,
  auth: {
    user: config.user,
    pass: config.pass
  }
});

function sendEmail(to, subject, message) {
  const mailOptions = {
    from: config.email.user,
    to,
    subject,
    html: message,
  };
  transport.sendMail(mailOptions, (error) => {
      if (error) {
        logger.error("Email could not be sent : " + error);
      }
  });
}

module.exports = function sendDisableLessonEmail(to, classroomName) {
  var subject =   "Wifi désactivé pour la classe " + classroomName;
  var message =   "<p>Wifi désactivé pour la classe " + classroomName + "</p>";
  sendEmail(to, subject, message);
}

module.exports = function sendEnableLessonEmail(to, classroomName) {
  var subject =   "Wifi activé pour la classe " + classroomName;
  var message =   "<p>Wifi activé pour la classe " + classroomName + "</p>";
  sendEmail(to, subject, message);
}