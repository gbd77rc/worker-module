var scheduler = require('./schedule');
var events = require('events');

exports = module.exports = new events.EventEmitter();

var jobs = [];

var validate = function(job){
    if ( job == undefined ){
        throw "Job is missing";
    }
    if ( job.name === undefined  || job.name === ""){
        throw "Name of job is missing";
    }
    if ( job.pattern === undefined || job.pattern === ""){
        throw "Job interval pattern is missing";
    }
    if ( job.start=== undefined || typeof job.start !== "function"){
        throw "Job start method is missing";
    }
    if ( findIndex(job.name) > -1){
        throw "Job with this name (" + job.name +") already exists!";
    }
};

var findIndex = function(jobName){
    var idx = -1;
    for( var i = 0; i < jobs.length; i++ ){
        var job = jobs[i];
        if ( job.name == jobName ){
            idx = i;
            break;
        }
    }
    return idx;
};

// Status
// not-started
// waiting
// success
// error

var createJob = function(job){
    return {
        name:job.name,
        status:"not-started",
        nextRunTime:"",
        lastRunTime:"",
        timesRan:"",
        processed:0,
        pattern:job.pattern,
        schedule:null,
        start: job.start,
        lastError:""
    };
};

var findJob = function(jobName){
    for(var i = 0; i < jobs.length; i++){
        var job = jobs[i];
        if ( job.name === jobName ){
            return job;
        }
    }
    return null;
};

exports.clear = function(){
    exports.stop();
    jobs = [];
};

exports.add = function(job){
    validate(job);
    // If got here then we must be ok.
    jobs.push(createJob(job));
};

exports.getStatus = function(){
    return jobs;
};

exports.runJob = function(jobName){
    try {
        var job = jobs[findIndex(jobName)];
        if ( job === undefined ){
            throw "Job not found!";
        }
        if( job.schedule != null ){
            var currentTime = new Date();
            // Check if manually triggered or not
            job.lastRunTime = (currentTime < job.nextRunTime) ? currentTime : job.nextRunTime;
            job.nextRunTime = job.schedule.nextInvocation();
        }
        job.status = "running";
        job.start(job).then(function(results){
            job.status = "success";
            job.timesRan++;
            if ( results == "skipped"){
                job.status = "skipped";
            }
            exports.emit("worker-job-success", {
                name : job.name,
                status : job.status,
                results : results
            });
        }, function(err){
            job.status = "error";
            job.lastError = err;
            exports.emit("worker-job-error", {
                name : job.name,
                status : job.status,
                results : err
            });
        }).finally(function(){
            var msg = "next schedule run is " + job.nextRunTime;
            exports.emit('worker-job-waiting',{
                name : job.name,
                status : job.status,
                results : msg
            });
        }).done();
    }
    catch(e){
        throw "Problem running job - " + e;
    }
};

exports.start = function(){
    // Schedule
    for(var i =0; i < jobs.length; i++ ){
        var job = jobs[i];
        startJob(job);
    }
};

var startJob = function(job){
    if ( job.status === "not-started") {
        job.schedule = scheduler.scheduleJob(job.pattern, function () {
            exports.runJob(job.name);
        });
        job.nextRunTime = job.schedule.nextInvocation();
        var msg = "schedule to run at " + job.nextRunTime;
        exports.emit('worker-job-waiting',{
            name : job.name,
            status : job.status,
            results : msg
        });
    }
};

exports.stop = function(){
    // Schedule
    for(var i =0; i < jobs.length; i++ ){
        var job = jobs[i];
        stopJob(job);
    }
};

var stopJob = function(job){
    if ( job.schedule != null ){
        job.schedule.cancel();
    }
    job.status = "not-started";
    var msg = "has been stopped.";
    exports.emit('worker-job-stopped',{
        name : job.name,
        status : job.status,
        results : msg
    });
};

exports.restart = function(jobName){
    if ( jobName == undefined || jobName === "") {
        exports.stop();
        exports.start();
    } else {
        var job = findJob(jobName);
        stopJob(job);
        startJob(job);
    }
};