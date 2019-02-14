angular.module('Schedule').factory("scheduleService", function ($http, $q, $rootScope) {
    var isLoaded = false;


    function getSchedule() {
        isLoaded = false;
        var promise = null;

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
        var promise = null;

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
        var promise = null;

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
        var promise = null;

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
        var promise = null;

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

    function createMultipleSchedule(schedule, classrooms){
        var promises = [];
        for(var i=0; i<classrooms.length; i++){
            var classroom = classrooms[i];
            var classRoomSchedule = JSON.parse(JSON.stringify(schedule));
            classRoomSchedule.ClassroomId = classroom.id;
            promises.push(createSchedule(classRoomSchedule));
        }
        return $q.all(promises);
    }

    function disableScheduleForMultipleClassrooms(SchoolId, classrooms){
        var promises = [];
        for(var i=0; i<classrooms.length; i++){
            promises.push(disableScheduleForClassroom(SchoolId, classrooms[i].id));
        }
        return $q.all(promises);
    }

    function deleteMultipleSchedule(ids){
        var promises = [];
        for(var i=0; i<ids.length; i++){
            promises.push(deleteSchedule(ids[i]));
        }        
        return $q.all(promises);
    }
    
    return {
        getSchedule: getSchedule,
        createSchedule: createSchedule,
        disableScheduleForClassroom: disableScheduleForClassroom,
        disableSchedule: disableSchedule,
        deleteSchedule: deleteSchedule,
        createMultipleSchedule: createMultipleSchedule,
        disableScheduleForMultipleClassrooms: disableScheduleForMultipleClassrooms,
        deleteMultipleSchedule: deleteMultipleSchedule,
        isLoaded: function () {
            return isLoaded;
        }
    }
});

angular.module('Schedule').factory("recurrenceService", function ($http, $q, $rootScope) {
    var isLoaded = false;
    var promise = null;

    function createRecurrence(recurrence){
        isLoaded = false;
        if (promise) promise.abort();

        var canceller = $q.defer();
        var request = $http({
            url: "/api/recurrence",
            method: "POST",
            data: recurrence,
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

    function getRecurrences() {
        isLoaded = false;
        if (promise) promise.abort();
        var canceller = $q.defer();
        var request = $http({
            url: "/api/recurrence",
            method: "GET",
            params: {SchoolId: $rootScope.schoolId},
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

    function deleteRecurrence(id) {
        if (promise) promise.abort();

        var canceller = $q.defer();
        var request = $http({
            url: "/api/recurrence",
            method: "DELETE",
            params: {id: id},
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

    
    return {
        createRecurrence: createRecurrence,
        getRecurrences: getRecurrences,
        deleteRecurrence: deleteRecurrence,
        isLoaded: function () {
            return isLoaded;
        }
    }
});

