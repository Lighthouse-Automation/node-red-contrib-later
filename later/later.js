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

    function laterNode(config) {
        RED.nodes.createNode(this,config);
        
        this.name = config.name;
        this.schedule = config.schedule;
        var node = this;

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
                    later.setTimeout(function() { node.send(msg); }, thisSched);
                };
            }
            else {
                node.send(msg);
            };
        }); 
    }

    RED.nodes.registerType("later", laterNode);
}
