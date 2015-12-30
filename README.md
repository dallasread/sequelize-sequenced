```
var Sequelize = require('sequelize');

require('sequelize-sequenced')(Sequelize);

var Item = sequelize.define('items', {
    prettyId: { 
        type: Sequelize.SEQUENCED, // Just an integer field
        sequenceScope: ['thingId', 'other'] // fields that must be unique
    }
});
```
