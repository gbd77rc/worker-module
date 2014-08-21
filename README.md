Worker Module
================

This node module will allow specific jobs to be scheduled at user controlled intervals

The job will be made up of the following.

    {
        name : "name of the job",
        pattern : "cron pattern to trigger job",
        start : "the function to call when the job is triggered"
    }

##How to install

Until this module has been published to NPM repo add the following to your package.json file in the dependencies element.

    "worker-module": "git+https://github.com/gbd77rc/worker-module.git"
    
Then run 
    
    npm update worker-module
    
It should then install the latest version.

##Dependencies 

The following Node packages are also installed.

*   q
*   node-schedule (It has been fixed for CRON intervals so the code is in the lib folder and not as a package dependency)
    
##How to use

In the app.js/server.js or whichever Node JavaScript file you wish to initialise this module in do the following.

The job can be added using this method

    var worker = require('worker-module');
    worker.add({
        name :"queue-job",
        pattern:"0 0 4 * *",  // Start at 4am every morning
        start: function(jobStatus){
            var def = q.defer();
            setInterval(function(){
                console.log("Its 4am time to get up!");
                status.processed++;
                def.resolve("Successful");
            },500);
            return def.promise;
        }
    });

###Job Start Function
The job start method MUST implement a promise.  The system is designed to work with a promise being returned and the method either resolving or rejecting depending on the outcome of the start method.

####Start Method    
If the job is already running then this method is ignore.  It will just return straight away.

To start the heartbeat in fire/forget mode then just use the command
    
    worker.start()
    
####Stop Method
If the job is already stopped then this method is ignore.  It will just return straight away.

To stop the worker in fire/forget mode then just use the command
   
    worker.stop();
    
####Restart Method
To restart all jobs then use without the jobName parameter.

    worker.stop(jobName);    

####Get Status Method
To get the current status of the jobs then just use the command
    
    worker.getStatus();
    
It will return the following object.  It will contain a job status per job added.

    [
        {
            name:"queue-job",
            status:"waiting",
            nextRunTime:"",
            lastRunTime:"",
            timesRan:"",
            processed:0,  // The only property of the jobStatus that is not automatically updated by the worker system.
            pattern:"",
            schedule:null,
            start:{}
        }
    ]
    
####Events Triggered
The following events are available.

    worker.on('worker-job-success',function(result){
       // Do something as the job has completed successfully
    });

    worker.on('worker-job-error',function(result){
       // Do something as the job has completed with an error
    });

    worker.on('worker-job-waiting',function(result){
        // Do something as the job has been scheduled
    });

    worker.on('worker-job-stopped',function(result){
       // Do something as the job has been stopped
    });

The `result` object will contain the following information

    {
        name:"",
        status:"",
        results:""
    }
