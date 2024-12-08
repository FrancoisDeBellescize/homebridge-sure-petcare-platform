var SurePetcareAccessory = require('./SurePetcareAccessory.js');

function SurePetcareOccupancySensor(log, accessory, device, session, occupancy_flipped) {
    SurePetcareAccessory.call(this, log, accessory, device, session);

    this.sensor = device;

    this.occupancy_flipped = occupancy_flipped;

    this.service = this.accessory.getService(global.Service.OccupancySensor);

    this.service
        .getCharacteristic(global.Characteristic.OccupancyDetected)
        .on('get', this._getOccupancy.bind(this));


    this.accessory.updateReachability(true);
}

SurePetcareOccupancySensor.prototype = Object.create(SurePetcareOccupancySensor.prototype);

SurePetcareOccupancySensor.prototype.pollStatus = function(data) {
    var self = this;
    var pets = data.data.pets;

        for(var i in pets) {
            var pet = pets[i];
            if(pet.id == this.sensor.id) {
                var where = pet.position.where == 2 ? 0 : 1;
                if(self.occupancy_flipped) {
                    where = where === 1 ? 0 : 1;
                }
                this.service
                    .getCharacteristic(Characteristic.OccupancyDetected)
                    .setValue(where);

                return;
            }
        }
}

SurePetcareOccupancySensor.prototype._getOccupancy = function(callback) {
    var self = this;
    this.session.getStatuses(function(data) {

        var pets = data.data.pets;

        for(var i in pets) {
            var pet = pets[i];
            if(pet.id == self.sensor.id && pet.position) {
                //Pet position is 1 for inside and 2 for outside.
                //This needs to be 0 for no occupancy and 1 for occupancy
                var where;
                if(pet.position.where != undefined) {
                    where = pet.position.where == 2 ? 0 : 1;
                    if(self.occupancy_flipped) {
                        where = where === 1 ? 0 : 1;
                    }
                } else {
                    where = 0;
                    console.log(pet);
                    console.log("Pet occupancy not found. If this error persists, consider turning off pet occupancy.");
                }
                
                callback(null, where);
                return;
            }
        }
    });
}


module.exports = SurePetcareOccupancySensor;