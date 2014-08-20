Worker Module
================

This node module will allow specific jobs to be scheduled at user controlled intervals

The job will be made up of the following.

    {
        name : "name of the job",
        pattern : "cron pattern to trigger job",
        startJob : "the function to call when the job is triggered"
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
    
##How to use

In the app.js/server.js or whichever Node JavaScript file you wish to initialise this module in do the following.

The job can be added using this method

    var worker = require('worker-module');
    worker.add({
        name :"queue-job",
        pattern:"0 0 4 * *",  // Start at 4am every morning
        start: function(){
            console.log("Its 4am time to get up!");
        }
    });

###Control the start/stop
The methods to start/stop the worker are asynchronous and can be used with promises.
    
####Start Method    
If the worker is already running then this method is ignore.  It will just return straight away.  If you use the continue with a promise, it will return the current status.

To start the heartbeat in fire/forget mode then just use the command
    
    worker.start()
    
To start the heartbeat and then continue with a promise mode then just use the command
   
    worker.start().then(function(status){
        // continue on with the rest of the startup code.
        // status object is describe the getStatus method
    });

Every time the job is triggered then it will emit `job-triggered` event.

    worker.on('job-trigger',function(status){
        // Do something as the job has triggered!
        // The status is the current jobStatus
    });
    
####Stop Method    
If the heartbeat is already stopped then this method is ignore.  It will just return straight away.  If you use the continue with a promise, it will return the current status.

To stop the worker in fire/forget mode then just use the command
   
    worker.stop();
    
To stop the heartbeat and then continue mode then just use the command
   
    worker.stop().then(function(status){
        // continue on with the rest of the shutdown code.
        // status object is describe the he getStatus method
    });    
    

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
            processed:0,
            pattern:"",
            schedule:null,
            start:{}
        }
    ]
    
    