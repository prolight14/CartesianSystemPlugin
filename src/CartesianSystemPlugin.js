var CartesianSystemPlugin = function (scene)
{
    // The Scene that owns this plugin
    this.scene = scene;

    this.systems = scene.sys;

    if (!scene.sys.settings.isBooted)
    {
        scene.sys.events.once('boot', this.boot, this);
    }
};

CartesianSystemPlugin.register = function (PluginManager)
{
    PluginManager.register('CartesianSystemPlugin', CartesianSystemPlugin, 'base');
};

CartesianSystemPlugin.prototype = {
    boot: function()
    {
        var eventEmitter = this.systems.events;

        eventEmitter.on('start', this.start, this);

        eventEmitter.on('update', this.update, this);

        eventEmitter.on('shutdown', this.shutdown, this);
        eventEmitter.on('destroy', this.destroy, this);
    },

    initWorld: function(config)
    {
        return new CartesianSystem.World(config).init();
    },

    start: function()
    {
        this.world = this.initWorld(this.scene.cspConfig);
    },

    integrate: function()
    {
        var world = this.world;
        var sys = this.systems;

        sys.displayList.removeAll();
        sys.updateList.removeAll();

        world.utils.loopProcessList(function(object)
        {
            sys.displayList.add(object);
            sys.updateList.add(object);
        });

        sys.displayList.queueDepthSort();
    },

    update: function()
    {

    },

    shutdown: function()
    {
        this.world = undefined;
    },

    destroy: function()
    {
        this.shutdown();

        this.scene = undefined;
        this.systems = undefined;
    }
};

CartesianSystemPlugin.prototype.constructor = CartesianSystemPlugin;

module.exports = CartesianSystemPlugin;