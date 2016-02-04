module.exports = function(Sequelize) {
    if (!Sequelize) Sequelize = require('sequelize');

    Sequelize.addHook('afterInit', function(sequelize) {
        function setSequenceId(key, attr) {
            return function(model) {
                return new Sequelize.Promise(function(resolve, reject) {
                    var where = {},
                        k;

                    for (var i = attr.sequenceScope.length - 1; i >= 0; i--) {
                        k = attr.sequenceScope[i];
                        where[k] = model[k];
                    }

                    where[key] = {
                      $ne: null
                    };

                    sequelize.model(model.$modelOptions.name.plural).findOne({
                        where: where,
                        paranoid: false,
                        order: [
                            [key, 'DESC']
                        ],
                        limit: 1
                    }).then(function(latest) {
                        model[key] = (latest ? latest[key] : 0) + 1;
                        resolve();
                    }).catch(reject);
                });
            };
        }

        sequelize.addHook('afterDefine', function(model) {
            var attr;

            for (var key in model.attributes) {
                attr = model.attributes[key];

                if (attr.sequenceScope && attr.sequenceScope.length) {
                    if (typeof attr.sequenceScope === 'string') {
                        attr.sequenceScope = [attr.sequenceScope];
                    }

                    model.beforeCreate('find-' + key + '-sequence-id', setSequenceId(key, attr));
                }
            }
        });
    });

    Sequelize.SEQUENCED = Sequelize.INTEGER;
};
