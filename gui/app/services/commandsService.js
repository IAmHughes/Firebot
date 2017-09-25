(function(){
  
 //This manages command data
 
 const fs = require('fs');
 const _ = require('underscore')._; 
 const dataAccess = require('../../lib/data-access.js');
 
 angular
    .module('firebotApp')
    .factory('commandsService', function ($http, $q, settingsService, $rootScope, utilityService) {
        var service = {};

        // in memory commands storage
        var commandsCache = {};

        // Refresh commands cache
        service.refreshCommands = function() {
            var commandsDb = dataAccess.getJsonDbInUserData("/user-settings/chat/commands");
            commandsCache = commandsDb.getData('/');
        }

        // Get an array of command types.
        service.getCommandTypes = function(){
            var commandTypes = [];
            if (commandsCache != null) {
                commandTypes = Object.keys(commandsCache);
            }
            return commandTypes;
        }

        // Return all commands for a specific command type.
        service.getAllCommandsForType = function(commandType){
            var commandArray = [];
            if (commandsCache != null) {
                var commands = commandsCache[commandType];
                for (command in commands){
                    var command = commands[command];
                    commandArray.push(command);
                }
            }
            return commandArray;
        }

        // Saves out a command
        service.saveCommand = function(command) {
            var commandDb = dataAccess.getJsonDbInUserData("/user-settings/chat/commands");
            
            // Note(ebiggz): Angular sometimes adds properties to objects for the purposes of two way bindings
            // and other magical things. Angular has a .toJson() convienence method that coverts an object to a json string
            // while removing internal angular properties. We then convert this string back to an object with 
            // JSON.parse. It's kinda hacky, but it's an easy way to ensure we arn't accidentally saving anything extra.
            var cleanedCommands = JSON.parse(angular.toJson(command));
            
            // If the command is active, throw it into the active group. Otherwise put it in the inactive group.
            if(command.active === true){
                console.log('Saving '+command.commandID+' to active');
                try{
                    commandDb.delete("/Inactive/" + command.commandID);
                }catch(err){}
                commandDb.push("/Active/" + command.commandID, cleanedCommands);
            } else {
                console.log('Saving '+command.commandID+' to inactive');
                try{
                    commandDb.delete("/Active/" + command.commandID);
                }catch(err){}
                commandDb.push("/Inactive/" + command.commandID, cleanedCommands);
            }
        }

        return service;
    });    
})();