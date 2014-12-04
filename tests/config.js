var dojoConfig = {
    async: 1,
    cacheBust: 1,
    'routing-map': {
        pathPrefix: '',
        layers: {}
    },
    packages: [
        { name: 'dojo-form-controls', location: '../dojo-form-controls' },
        { name: 'mijit', location: '../mijit' },
        { name: 'crabpy_dojo', location: '..' }
    ]
};