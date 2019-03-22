var ssh = require(appRoot + '/bin/ssh/ssh')
var Classroom = require(appRoot + '/models/classroom')
var School = require(appRoot + '/models/school')
var Device = require(appRoot + '/models/device')
var Lesson = require(appRoot + '/models/lesson')
var logger = require(appRoot + '/app').logger
var email = require(appRoot + '/bin/email/email')

function lessonDisableDone(LessonId, callback) {
  Lesson.findById(LessonId, null, null, function(err, lesson) {
    if (err) callback(err)
    else {
      lesson.endDone = 'true'
      var lessonToDb = new Lesson.LessonSeralizer(lesson)
      lessonToDb.updateDB(lesson.id, function(err) {
        callback(err)
      })
    }
  })
}
function lessonEnableDone(LessonId, callback) {
  Lesson.findById(LessonId, null, null, function(err, lesson) {
    if (err) callback(err)
    else {
      lesson.startDone = 'true'
      var lessonToDb = new Lesson.LessonSeralizer(lesson)
      lessonToDb.updateDB(LessonId, function(err) {
        callback(err)
      })
    }
  })
}
function getClassroomName(LessonId, callback) {
  Lesson.findById(LessonId, null, null, function(err, lesson) {
    if (typeof callback == 'function') callback(lesson.classroomName)
  })
}
function disableWiFi(DeviceId, SchoolId, LessonId, callback) {
  // check if other classrooms are using this device
  if (DeviceId) {
    Classroom.findActiveByDevice(DeviceId, SchoolId, function(err, ret) {
      if (err) callback(err)
      else {
        // if no more classroom are using this device, disable the Wi-Fi
        if (ret.length == 0) {
          // retrive the device's information
          Device.findById(DeviceId, null, null, function(err, device) {
            if (err) callback(err)
            // retrieve the school's information
            School.findById(SchoolId, null, null, function(err, school) {
              if (err) callback(err)
              //TODO sent a error message telling SSH is not configured for this school
              else if (school == null) callback(null)
              else
                try {
                  if (device && device.hasOwnProperty('ip')) {
                    ssh.execute(device.ip, ['disableWiFi'], school.sshAdmin, school.sshPassword, function(err) {
                      if (err) callback(err)
                      else
                        lessonDisableDone(LessonId, function(err) {
                          email.sendDisableLessonEmail(school.email, getClassroomName(LessonId))
                          callback(err)
                        })
                    })
                  } else {
                    callback(null)
                  }
                } catch (e) {
                  callback(e)
                }
            })
          })
        } else {
          lessonDisableDone(LessonId, function(err) {
            email.sendDisableLessonEmail(school.email, getClassroomName(LessonId))
            callback(err)
          })
        }
      }
    })
  } else {
    callback('There is no device to control (classroom ' + getClassroomName(LessonId) + ')')
  }
}
function enableWiFi(DeviceId, SchoolId, LessonId, callback) {
  if (DeviceId) {
    Device.findById(DeviceId, null, null, function(err, device) {
      if (err) callback(err)
      School.findById(SchoolId, null, null, function(err, school) {
        if (err) callback(err)
        //TODO sent a error message telling SSH is not configured for this school
        else if (school == null) callback(null)
        else
          try {
            if (device && device.hasOwnProperty('ip')) {
              ssh.execute(device.ip, ['enableWiFi'], school.sshAdmin, school.sshPassword, function(err) {
                if (err) callback(err)
                else
                  lessonEnableDone(LessonId, function(err) {
                    //email.sendEnableLessonEmail(school.email, getClassroomName(LessonId));
                    callback(err)
                  })
              })
            } else {
              callback(null)
            }
          } catch (e) {
            callback(e)
          }
      })
    })
  } else {
    callback('There is no device to control (classroom ' + getClassroomName(LessonId) + ')')
  }
}

function checkLessons() {
  logger.info('New CRON turn -- ' + new Date() + ' -- Checking lessons.')
  School.getAll(null, function(err, schools) {
    if (err) logger.warn('CheckLessons (0): ' + err)
    else {
      for (var snum in schools) {
        var school = schools[snum]
        var lessonsPassedButNotDisabled = []
        var lessonsActive = []
        var lessonToDisabledFully = []
        var lessonToChangeStatusToDisabled = []

        Lesson.findActiveBySchool(school.id, function(err, lessons) {
          lessonsActive = lessons
        })

        Lesson.findPassedButNotDisabled(
          school.id,
          function(err, lessons) {
            if (err) logger.warn('CheckLessons for school ' + this.school.schoolName + ' (2.0): ' + err)
            lessonsPassedButNotDisabled = lessons
          }.bind({ school: school })
        )

        //distribute lessonsPassedButNotDisabled between lessonToChangeStatusToDisabled and lessonToDisabledFully
        for (var lnum in lessonsPassedButNotDisabled) {
          var lesson = lessons[lnum]

          //search activeLessons with the same DeviceId but different id
          var sameClassLessons = lessonsActive.filter(l => {
            return l.ClassroomId == lesson.ClassroomId && l.id != lesson.id
          })
          //if sameClassLessons is not empty it means that one or more lessons are active and should not be disable
          if (sameClassLessons.length > 0) {
            lessonToChangeStatusToDisabled.push(lesson)
          } else {
            lessonToDisabledFully.push(lesson)
          }
        }

        //desactivate "fully" (desactivate wifi + change status) a lesson
        for (var lnum in lessonToDisabledFully) {
          var lesson = lessons[lnum]
          disableWiFi(
            lesson.DeviceId,
            lesson.SchoolId,
            lesson.id,
            function(err) {
              if (err) logger.warn('CheckLessons for classroom ' + this.lesson.classroomName + ' (2.1): ' + err)
            }.bind({ lesson: lesson })
          )
        }

        //change only the status of a lesson
        for (var lnum in lessonToChangeStatusToDisabled) {
          var lesson = lessons[lnum]
          lessonDisableDone(
            lesson.id,
            function(err) {
              if (err) logger.warn('Could not change status for classroom ' + this.lesson.classroomName + ' ' + err)
            }.bind({ lesson: lesson })
          )
        }

        //activate lessons
        Lesson.findActiveButNotEnabled(
          school.id,
          function(err, lessons) {
            if (err) logger.warn('CheckLessons  ' + this.school.schoolName + '(1.0): ' + err)
            for (var lnum in lessons) {
              var lesson = lessons[lnum]
              enableWiFi(
                lesson.DeviceId,
                this.school.id,
                lesson.id,
                function(err) {
                  if (err) logger.warn('CheckLessons for classroom ' + this.lesson.classroomName + ' (1.1): ' + err)
                }.bind({ lesson: lesson })
              )
            }
          }.bind({ school: school })
        )
      }
    }
  })
}

module.exports.enableWiFi = enableWiFi
module.exports.disableWiFi = disableWiFi
module.exports.checkLessons = checkLessons
