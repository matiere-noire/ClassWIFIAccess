angular.module('Schedule').factory("scheduleService", function ($http, $q, $rootScope) {
    var isLoaded = false;
    var promise = null;


    function getSchedule() {
        isLoaded = false;
        if (promise) promise.abort();

        var canceller = $q.defer();
        var request = $http({
            url: "/api/schedule",
            method: "GET",
            params: {schoolId: $rootScope.schoolId},
            timeout: canceller.promise
        });

        promise = request.then(
            function (response) {
                if (response.data.error) return response.data;
                else {
                    isLoaded = true;
                    return response.data;
                }
            },
            function (response) {
                if (response.status && response.status >= 0) {
                    $rootScope.$broadcast('serverError', response);
                    return ($q.reject("error"));
                }
            });

        promise.abort = function () {
            canceller.resolve();
        };
        promise.finally(function () {
           // console.info("Cleaning up object references.");
            promise.abort = angular.noop;
            canceller = request = promise = null;
        });

        return promise;
    }

    function createSchedule(schedule){
        isLoaded = false;
        if (promise) promise.abort();

        var canceller = $q.defer();
        var request = $http({
            url: "/api/schedule",
            method: "POST",
            data: schedule,
            timeout: canceller.promise
        });

        promise = request.then(
            function (response) {
                if (response.data.error) return response.data;
                else {
                    isLoaded = true;
                    return response.data;
                }
            },
            function (response) {
                if (response.status && response.status >= 0) {
                    $rootScope.$broadcast('serverError', response);
                    return ($q.reject("error"));
                }
            });

        promise.abort = function () {
            canceller.resolve();
        };
        promise.finally(function () {
           // console.info("Cleaning up object references.");
            promise.abort = angular.noop;
            canceller = request = promise = null;
        });

        return promise;
    }

    function disableScheduleForClassroom(SchoolId, ClassroomId){
        isLoaded = false;
        if (promise) promise.abort();

        var canceller = $q.defer();
        var request = $http({
            url: "/api/schedule",
            method: "POST",
            data: {action: "disable", SchoolId: SchoolId, ClassroomId: ClassroomId},
            timeout: canceller.promise
        });

        promise = request.then(
            function (response) {
                if (response.data.error) return response.data;
                else {
                    isLoaded = true;
                    return response.data;
                }
            },
            function (response) {
                if (response.status && response.status >= 0) {
                    $rootScope.$broadcast('serverError', response);
                    return ($q.reject("error"));
                }
            });

        promise.abort = function () {
            canceller.resolve();
        };
        promise.finally(function () {
            //console.info("Cleaning up object references.");
            promise.abort = angular.noop;
            canceller = request = promise = null;
        });

        return promise;
    }
    function disableSchedule(SchoolId, ScheduleId){
        isLoaded = false;
        if (promise) promise.abort();

        var canceller = $q.defer();
        var request = $http({
            url: "/api/schedule",
            method: "POST",
            data: {action: "disable", SchoolId: SchoolId, LessonId: ScheduleId},
            timeout: canceller.promise
        });

        promise = request.then(
            function (response) {
                if (response.data.error) return response.data;
                else {
                    isLoaded = true;
                    return response.data;
                }
            },
            function (response) {
                if (response.status && response.status >= 0) {
                    $rootScope.$broadcast('serverError', response);
                    return ($q.reject("error"));
                }
            });

        promise.abort = function () {
            canceller.resolve();
        };
        promise.finally(function () {
            //console.info("Cleaning up object references.");
            promise.abort = angular.noop;
            canceller = request = promise = null;
        });

        return promise;
    }

    function deleteSchedule(id) {
        if (promise) promise.abort();

        var canceller = $q.defer();
        var request = $http({
            url: "/api/schedule",
            method: "DELETE",
            params: {LessonId: id},
            timeout: canceller.promise
        });

        promise = request.then(
            function (response) {
                if (response.data.error) return response.data;
                else return response
            },
            function (response) {
                if (response.status && response.status >= 0) {
                    $rootScope.$broadcast('serverError', response);
                    return ($q.reject("error"));
                }
            });
        promise.abort = function () {
            canceller.resolve();
        };
        promise.finally(function () {
            //console.info("Cleaning up object references.");
            promise.abort = angular.noop;
            canceller = request = promise = null;
        });
        return promise;
    }

    function updateSchedule(lessonId, lesson) {
        if (promise) promise.abort();

        var canceller = $q.defer();
        var request = $http({
            url: "/api/schedule",
            method: "POST",
            data: {lessonId: lessonId, lesson: lesson},
            timeout: canceller.promise
        });

        promise = request.then(
            function (response) {
                if (response.data.error) return response.data;
                else return response
            },
            function (response) {
                if (response.status && response.status >= 0) {
                    $rootScope.$broadcast('serverError', response);
                    return ($q.reject("error"));
                }
            });
        promise.abort = function () {
            canceller.resolve();
        };
        promise.finally(function () {
            //console.info("Cleaning up object references.");
            promise.abort = angular.noop;
            canceller = request = promise = null;
        });
        return promise;
    }

    function createMultipleSchedule(schedule, classrooms){
        var promises = [];
        classrooms.forEach( function(classroom){
            schedule.ClassroomId = classroom.id;
            promises.push(createSchedule(schedule));
        });

        return $q.all(promises);
    }

    function disableScheduleForMultipleClassrooms(SchoolId, classrooms){
        var promises = [];
        classrooms.forEach( function(classroom){
            promises.push(disableScheduleForClassroom(SchoolId, classroom.id));
        });
        return $q.all(promises);
    }
    
    return {
        getSchedule: getSchedule,
        createSchedule: createSchedule,
        disableScheduleForClassroom: disableScheduleForClassroom,
        disableSchedule: disableSchedule,
        deleteSchedule: deleteSchedule,
        updateSchedule: updateSchedule,
        createMultipleSchedule: createMultipleSchedule,
        disableScheduleForMultipleClassrooms: disableScheduleForMultipleClassrooms,
        isLoaded: function () {
            return isLoaded;
        }
    }
});
