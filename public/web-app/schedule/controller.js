angular.module('Schedule').controller("ScheduleCtrl", function ($scope, $rootScope, $location, $mdDialog, scheduleService, recurrenceService) {

    $scope.requestForSchedule = null;
    $scope.requestForRecurrences = null;
    var initialized = false;

    $scope.lessons = [];
    $scope.classrooms = [];
    $scope.schedule = [];
    $scope.recurrences = [];

    //filters
    $scope.filter = {
        ClassroomId: '',
    };
    $scope.showRecurrentEvents = true;

    // pagination
    $scope.itemsByPage = 10;
    $scope.currentPage = 1;

    $scope.table = {
        show: false,
        filter: "",
        order: '-startDate'
    };

    $scope.schoolSelected = function(){
        return $rootScope.schoolId >= 2;
    };

    if ($rootScope.schoolId >= 2){
        getSchedule();
        getRecurrences();
    }

    $rootScope.$watch("schoolId", function(){
        if (initialized && $rootScope.schoolId >= 2 && 'schedules' === $location.path().toString().split("/")[1]){
            getSchedule();
            getRecurrences();
        }
    });

    $scope.isLoaded = function(){
        return scheduleService.isLoaded();
    };

    $scope.getClassroomName = function(id){
        var filteredClassrooms = $scope.classrooms.filter(classroom => classroom.id == id);
        return filteredClassrooms.length > 0 ? filteredClassrooms[0].classroomName : "";
    }

    $scope.activation = function(){
        $mdDialog.show({
            controller: "DialogEnableController",
            templateUrl: "modals/modalEnableContent.html",
            locals: {
                items: {
                }
            }
        }).then(function(){
            getSchedule();
        }, function(){
            //no changes
        });
    };

    $scope.deactivation = function(lesson){
        $mdDialog.show({
            controller: "DialogConfirmController",
            templateUrl: "modals/modalConfirmContent.html",
            locals: {
                items: {
                    action: 'disableLesson'
                }
            }
        }).then(function(){
            if ($scope.requestForSchedule) $scope.requestForSchedule.abort();
            $scope.requestForSchedule = scheduleService.disableSchedule($rootScope.schoolId, lesson.id);
            $scope.requestForSchedule.then(function (promise) {
                if (promise && promise.error) $scope.$broadcast("apiError", promise.error);
                getSchedule();
            })
        }, function(){
            //no changes
        });
    };

    function getSchedule(){
        if ($scope.requestForSchedule) $scope.requestForSchedule.abort();
        $scope.requestForSchedule = scheduleService.getSchedule();
        $scope.requestForSchedule.then(function (promise) {
            if (promise && promise.error) $scope.$broadcast("apiError", promise.error);
            else {
                initialized = true;
                $scope.classrooms = promise.classrooms;
                $scope.lessons = promise.lessons;
                $scope.isLoaded = function () {
                    return scheduleService.isLoaded();
                }
            }
        });
    };

    function getRecurrences(){
        if ($scope.requestForRecurrences) $scope.requestForRecurrences.abort();
        $scope.requestForRecurrences = recurrenceService.getRecurrences();
        $scope.requestForRecurrences.then(function (promise) {
            if (promise && promise.error) $scope.$broadcast("apiError", promise.error);
            else {
                initialized = true;
                $scope.recurrences = promise.recurrences;
                $scope.isLoaded = function () {
                    return recurrenceService.isLoaded();
                }
            }
        });
    };

     $scope.deleteSchedule = function(scheduleId){
        $mdDialog.show({
            controller: "DialogConfirmController",
            templateUrl: "modals/modalConfirmContent.html",
            locals: {
                items: {
                    action: 'removeSchedule'
                }
            }
        }).then(function() {
            var requestForSchedule = scheduleService.deleteSchedule(scheduleId);
            requestForSchedule.then(function (promise) {
                if (promise && promise.error) $scope.$broadcast("apiError", promise.error);
                else getSchedule();
            })
        });
    };

    $scope.planSchedule = function() {
        $mdDialog.show({
            controller: "DialogPlanScheduleController",
            templateUrl: "modals/modalPlanScheduleContent.html",
            locals: {
                items: {}
            }
        }).then(function () {
            getSchedule();
        }, function(){
            //no changes
        });
    };
    $scope.editSchedule = function(schedule){
        $mdDialog.show({
            controller: "DialogScheduleController",
            templateUrl: "modals/modalScheduleContent.html",
            locals: {
                items: {
                    schedule: schedule
                }
            }
        }).then(function() {
            getSchedule();
        }, function(){
            //no changes
        });
    }
    $scope.createRecurrence = function(){
        $mdDialog.show({
            controller: "DialogRecurrenceController",
            templateUrl: "modals/modalRecurrenceContent.html",
            locals: {
                items: {}
            }
        }).then(function() {
            getSchedule();
            getRecurrences();
        }, function(){
            //no changes
        });
    }

    $scope.deleteRecurrence = function(id){
        $mdDialog.show({
            controller: "DialogConfirmController",
            templateUrl: "modals/modalConfirmContent.html",
            locals: {
                items: {
                    action: 'removeRecurrence'
                }
            }
        }).then(function() {
            var requestForRecurrences = recurrenceService.deleteRecurrence(id);
            requestForRecurrences.then(function (promise) {
                if (promise && promise.error) $scope.$broadcast("apiError", promise.error);
                else {
                    getRecurrences();
                    var relatedLessons = $scope.lessons.filter(lesson => lesson.RecurrenceId == id);
                    var relatedLessonsIds = relatedLessons.map(lesson => lesson.id);
                    var requestForSchedule = scheduleService.deleteMultipleSchedule(relatedLessonsIds);
                    requestForSchedule.then(function (promise) {
                        if (promise && promise.error) $scope.$broadcast("apiError", promise.error);
                        else getSchedule();
                    })
                };
            })
        }, function(){

        });
    }

    $scope.resetFilters = function(){
        $scope.filter = {
            ClassroomId: '',
        }
        $scope.dateFrom = undefined;
        $scope.dateTo = undefined;
    }

    $scope.isItemRecurrent = function(item){
        return $scope.showRecurrentEvents || !item.RecurrenceId;
    }
});