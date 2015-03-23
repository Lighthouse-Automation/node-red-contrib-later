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

module.exports = function(RED) {
    var later = require('later');
    var fs = require('fs');
    var path = require('path');

    function laterNode(config) {
        RED.nodes.createNode(this,config);
        
        this.name = config.name;
        this.schedule = config.schedule;
        var node = this;

        var runSched = function(msg, sched) {
            //Add a 'later' object to the msg to keep track of stuff
            if (!msg.later) msg.later = {};
            //Initialise the count, if necessary
            if (!msg.later.count) msg.later.count = 0;
            //Only do anything if the schedule has a next event
            if (later.schedule(sched).next(1)) {
                //Inc count and start a timer running
                msg.later.count++;
                later.setTimeout(function() {
                    //Send out the message
                    node.send(msg);
                    //Run this again to schedule the next event
                    runSched(msg, sched);
                }, sched);
            };
        }

        //Set later to use the local time rather than UTC
        later.date.localTime();

        node.on('input', function(msg) {
            //Set a local var for this schedeule...
            var schedStr = (node.schedule.length > 0)?node.schedule:msg.later;
            //If we have a string, try and parse it, otherwise just send msg on
            if (schedStr && schedStr.length > 0) {
                var thisSched = later.parse.text(schedStr, true);
                //If there are errors parsing this, send the msg, and warn.
                if (thisSched.error > -1) {
                    node.warn("Later could not parse : <" + schedStr + "> the error is at : " + thisSched.error);
                    node.send(msg);
                }
                //Later could parse it, so set it to go once. Send the msg once the timer fires.
                else {
                    runSched(msg, thisSched);
                };
            }
            else {
                node.send(msg);
            };
        }); 
    }

    RED.nodes.registerType("later", laterNode);

    RED.httpAdmin.get('/node-red-contrib-later/:file', function(req, res){
        fs.readFile(path.resolve(__dirname, "../node_modules/later/" + req.params.file),function(err,data) {
            if (err) {
                res.send("<html><head></head><body>Error reading the file: <br />" + req.params.file + "</body></html>");
            } else {
                res.set('Content-Type', 'text/javascript').send(data);
            }
        });
    });
}
