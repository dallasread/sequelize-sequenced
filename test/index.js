require('should');

var Sequelize = require('sequelize');

// Apply `sequelize-sequenced`
require('../')(Sequelize);

try { require('fs').unlinkSync('./tmp.sqlite'); } catch (e) {}

var sequelize = new Sequelize('sequelize-sequenced', null, null, {
    dialect: 'sqlite',
    storage: './tmp.sqlite',
    logging: false,
});

function resetTestDB(done) {
    sequelize.query('PRAGMA foreign_keys = OFF').then(function() {
        sequelize.sync({ force: true }).then(function () {
            done();
        });
    });
}

describe('Sequence Ids', function () {
    var Item, Thing;

    before(function (done) {
        Item = sequelize.define('items', {
            prettyId: { type: Sequelize.SEQUENCED, sequenceScope: ['thingId', 'other'] },
            other: { type: Sequelize.STRING }
        });

        Thing = sequelize.define('things', {});

        Item.belongsTo(Thing);

        resetTestDB(function() {
            done();
        });
    });

    it('are being generated', function(done) {
        Item.create({ thingId: 1, other: 'anotherField' }).then(function(item) {
            item.should.have.property('prettyId').eql(1);
            done();
        });
    });

    it('start IDs from the beginning by scope', function(done) {
     Item.create({ thingId: 2, other: 'anotherField' }).then(function(item) {
            item.should.have.property('prettyId').eql(1);
            done();
        });
    });

    it('continue IDs via scope', function(done) {
        Item.create({ thingId: 1, other: 'anotherField' }).then(function(item) {
            item.should.have.property('prettyId').eql(2);
            done();
        });
    });

    it('create correct IDs for multiple scopes', function(done) {
        Item.create({ thingId: 1, other: 'anotherField2' }).then(function(item) {
            item.should.have.property('prettyId').eql(1);
            done();
        });
    });
});
