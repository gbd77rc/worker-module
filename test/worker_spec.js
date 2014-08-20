var should = require('should');
var assert = require('assert');
var worker = require('../lib/');
var q = require('q');

describe("Use Background Worker", function(){
    describe("Pass an invalid job should raise exception", function() {
        it("No job specified", function () {
            try {
                worker.add();
                assert.fail("Should not reach here!");
            }
            catch (e) {
                e.should.be.equal("Job is missing");
            }
        });

        it("No name property specified", function () {
            try {
                worker.add({
                    name2: "testing"
                });
                assert.fail("Should not reach here!");
            }
            catch (e) {
                e.should.be.equal("Name of job is missing");
            }
        });
        it("No name value specified", function () {
            try {
                worker.add({
                    name: ""
                });
                assert.fail("Should not reach here!");
            }
            catch (e) {
                e.should.be.equal("Name of job is missing");
            }
        });
        it("No pattern property specified", function () {
            try {
                worker.add({
                    name: "Job test1"

                });
                assert.fail("Should not reach here!");
            }
            catch (e) {
                e.should.be.equal("Job interval pattern is missing");
            }
        });
        it("No pattern value specified", function () {
            try {
                worker.add({
                    name: "Job test1",
                    pattern : ""
                });
                assert.fail("Should not reach here!");
            }
            catch (e) {
                e.should.be.equal("Job interval pattern is missing");
            }
        });
        it("No start property specified", function () {
            try {
                worker.add({
                    name: "Job test1",
                    pattern: "0 4 * * *"

                });
                assert.fail("Should not reach here!");
            }
            catch (e) {
                e.should.be.equal("Job start method is missing");
            }
        });
        it("No start value specified", function () {
            try {
                worker.add({
                    name: "Job test1",
                    pattern: "0 4 * * *",
                    start:null
                });
                assert.fail("Should not reach here!");
            }
            catch (e) {
                e.should.be.equal("Job start method is missing");
            }
        });
    });
    describe("Run a missing job", function(){
       it("Should raise an exception", function(){
           try {
               worker.runJob("Test3");
               assert.fail("Should not be here!");
           } catch(e){
               e.should.be.equal("Problem running job - Job not found!")
           }
       });
    });
    describe("Worker is successful",function(){
        beforeEach(function(done){
            worker.removeAllListeners(['worker-job-success', 'worker-job-error']);
            worker.clear();
            done();
        });
        it("Job will display hello", function(){
            worker.on("worker-job-success", function(result){
                should.exists(result);
                result.status.should.equal("success");
                result.name.should.equal("Test1");
                result.results.should.equal("Success");
            });
            worker.add({
                name :"Test1",
                pattern:" 0/2 * * * *",
                start:function(status){
                    var def = q.defer();
                    setInterval(function() {
                        var msg = "Hello - " + status.status;
                        msg.should.be.equal("Hello - running");
                        def.resolve("Success");
                    }, 500);
                    return def.promise;
                }
            });
            var status = worker.getStatus();
            status.length.should.be.equal(1);
            status[0].status.should.be.equal("not-started");
            status[0].name.should.be.equal('Test1');
            worker.runJob("Test1");
        });

        it("Start schedule and stop it", function(){
            worker.on("worker-job-success", function(result){
                should.exists(result);
                result.status.should.equal("success");
                result.name.should.equal("Test2");
                result.results.should.equal("Success");
            });
            worker.add({
                name :"Test2",
                pattern:" 0/1 * * * *",
                start:function(status){
                    var def = q.defer();
                    setInterval(function() {
                        var msg = "Hello - " + status.status;
                        msg.should.be.equal("Hello - running");
                        def.resolve("Success");
                    }, 500);
                    return def.promise;
                }
            });

            worker.start();
        })

    });

});