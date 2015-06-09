'use strict';

var _ = require('lodash');

require('./transcribe.module.js')
    .factory('SubjectsFactory', SubjectsFactory);

// @ngInject
function SubjectsFactory($q, localStorageService, zooAPI, zooAPIProject) {

    if (localStorageService.get('subjects') === null) {
        localStorageService.set('subjects', {
            current: null,
            viewed: []
        });
    }

    var factory;
    var _data = localStorageService.get('subjects');
    var _queue = [];

    factory = {
        $advanceQueue: advanceQueue,
        $getData: getData,
        current: null,
        loading: false
    };

    return factory;

    function advanceQueue() {
        if (_data.current) {
            _data.viewed.push(_data.current);
            _data.current = null;
            _updateStorage();
        }
        if (!_queue.length) {
            return _populateQueue()
                .then(_setCurrent);
        } else {
            return $q.when(_setCurrent);
        }
    }

    function getData() {
        factory.loading = true;
        if (_data.current) {
            return _createSubject();
        } else {
            return advanceQueue()
                .then(_createSubject);
        }
    }

    function _createSubject() {
        factory.current = {
            data: _data.current,
            image: false
        };
        return $q.when(factory.current.data)
            .then(_loadImage);
    }

    function _loadImage() {
        var deferred = $q.defer();
        factory.current.image = new Image();
        factory.current.image.src = factory.current.data.locations[0]['image/jpeg'];
        factory.current.image.onload = function () {
            factory.loading = false;
            deferred.resolve();
        };
        return deferred.promise;
    }

    function _populateQueue() {
        var pages = [];
        pages.push(getPage(1));
        return $q.all(pages);

        function getPage(page) {
            return zooAPIProject.get()
                .then(function (project) {
                    return zooAPI.type('subjects').get({
                        page: page,
                        sort: 'cellect',
                        workflow_id: project.links.workflows[0]
                    });
                })
                .then(function (subjects) {
                    if (!subjects.length) {
                        return $q.reject('outOfData');
                    } else {
                        var newSubjects = _.difference(subjects, _data.viewed);
                        if (!newSubjects) {
                            pages.push(getPage(page + 1));
                        } else {
                            _queue = _queue.concat(newSubjects);
                        }
                    }
                });
        }
    }

    function _setCurrent() {
        _data.current = _queue.shift();
        _updateStorage();
    }

    function _updateStorage() {
        localStorageService.set('subjects', _data);
    }

}