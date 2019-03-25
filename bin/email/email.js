var nodemailer = require('nodemailer')
var config = require(appRoot + '/bin/email/config')
var logger = require(appRoot + '/app').logger

var transporter = nodemailer.createTransport({
  host: config.host,
  port: config.port,
  secure: false,
  auth: {
    user: config.user,
    pass: config.pass
  }
})

function sendEmail(to, subject, message) {
  if (config) {
    const mailOptions = {
      from: config.email.user,
      to,
      subject,
      html: message
    }
    transporter.sendMail(mailOptions, error => {
      if (error) {
        logger.error('Email could not be sent : ' + error)
      }
    })
  }
}

module.exports.sendDisableLessonEmail = function(to, classroomName) {
  var subject = 'Wifi désactivé pour la classe ' + classroomName
  var message = '<p>Wifi désactivé pour la classe ' + classroomName + '</p>'
  sendEmail(to, subject, message)
}

module.exports.sendEnableLessonEmail = function(to, classroomName) {
  var subject = 'Wifi activé pour la classe ' + classroomName
  var message = '<p>Wifi activé pour la classe ' + classroomName + '</p>'
  sendEmail(to, subject, message)
}
