/*
The MIT License (MIT)

Copyright (c) 2015 Lighthouse Automation

https://github.com/Lighthouse-Automation/node-red-contrib-later

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

//For jslint linter
/*jslint node: true */
"use strict";

module.exports = function (RED) {
    var later = require('later'),
        fs = require('fs'),
        path = require('path'),
        debug = require('debug')('later');


    function laterNode(config) {
        RED.nodes.createNode(this, config);

        this.name = config.name;
        this.schedule = config.schedule;
        var node = this,
            //Global object to keep track of running timers
            runningSchedules = {},
            //Function that does the work of running a schedule
            runSched = function (msg, sched) {
                //Only do anything if the schedule has a next event
                if (later.schedule(sched).next(1)) {
                    runningSchedules[msg.later.id] = later.setTimeout(function () {
                        //Run this again to schedule the next event
                        /*IMPORTANT that this is done before the message is sent
                          to avoid a race condition in the case this message triggers
                          a downstream node to cancel the flow*/
                        runSched(msg, sched);
                        //Send out the message
                        msg.later.count += 1;
                        node.send(msg);
                    }, sched);
                    debug('Started timer for schedule : ' + msg.later.id);
                } else {
                    //This schedule has finished, remove any references to previous timers
                    debug('Schedule has ended : ' + msg.later.id);
                    delete runningSchedules[msg.later.id];
                }
            },

            parsePayloadForLater = function (payload) {
                var res = "";

                if (typeof payload === 'object' && typeof payload.later === 'string') {
                    res = payload.later;
                }
                return res;
            };

        node.on('input', function (msg) {
            //Add a 'later' object to the msg for downstream nodes to use, or not
            if (!msg.later) {
                msg.later = {};
                //Generate a kind of unique number for the 'later' id.
                msg.later.id = (3 + Math.random() * 6763504675).toString(16);
            }
            //Initialise the count, if necessary
            if (!msg.later.count) {
                msg.later.count = 0;
            }
            //If this message has no (or null) payload, stop any running timers
            //remove this schedule from the list, and do no further processing
            if (!msg.payload && runningSchedules[msg.later.id]) {
                debug("Removing scheduled timer : " + msg.later.id);
                runningSchedules[msg.later.id].clear();
                delete runningSchedules[msg.later.id];
                return;
            }
            //Set a local var for this schedeule string
            var schedStr = (node.schedule.length > 0) ? node.schedule : parsePayloadForLater(msg.payload),
                thisSched = later.parse.text(schedStr, true);
            //If we have a string, try and parse it, otherwise just send msg on
            if (schedStr && schedStr.length > 0) {
                //If there are errors parsing this, send the msg, and warn.
                if (thisSched.error > -1) {
                    node.warn("Later could not parse : <" + schedStr + "> the error is at : " + thisSched.error);
                    node.send(msg);
                } else {
                    //Later could parse it, so set it to go once. Send the msg once the timer fires.
                    debug("Got a valid schedule, starting it running : " + schedStr);
                    runSched(msg, thisSched);
                }
            } else {
                debug("No valid schedule, sending msg through.");
                node.send(msg);
            }
        });
        //Listener for the close event, clear timers, tidy up
        node.on('close', function (done) {
            var id;
            debug("Close called, emptying running timers.");
            for (id in runningSchedules) {
                if (runningSchedules.hasOwnProperty(id)) {
                    debug("Removing timer : " + id);
                    runningSchedules[id].clear();
                }
            }
            runningSchedules = {};
            done();
        });
        debug("New node created : %s", (node.name.length > 0) ? node.name : 'Later');
    }

    //Set later to use the local time rather than UTC
    later.date.localTime();

    //Register the node creation fn with RED
    RED.nodes.registerType("later", laterNode);

    //Add a route to the 'later.js' instance installed with this node, so the html file can use it
    RED.httpAdmin.get('/node-red-contrib-later/:file', function (req, res) {
        fs.readFile(path.resolve(__dirname, "../node_modules/later/" + req.params.file), function (err, data) {
            if (err) {
                res.send("<html><head></head><body>Error reading the file: <br />" + req.params.file + "</body></html>");
            } else {
                res.set('Content-Type', 'text/javascript').send(data);
            }
        });
    });
};
