var CartesianSystemPlugin = function (scene)
{
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

        eventEmitter.on('shutdown', this.shutdown, this);
        eventEmitter.on('destroy', this.destroy, this);
    },

    initWorld: function(config)
    {
        this.world = (new CartesianSystem.World(config)).init();
        this.followX = 0;
        this.followY = 0;

        var bounds = this.world.bounds;
        this.scene.cameras.main.setBounds(
            bounds.minX, 
            bounds.minY, 
            bounds.maxX - bounds.minX, 
            bounds.maxY - bounds.minY
        );
    },

    integrate: function()
    {
        var world = this.world;
        var sys = this.systems;

        sys.displayList.removeAll();
        sys.updateList.removeAll();

        sys.updateList.update();

        world.loopProcessList(function(object)
        {
            sys.displayList.add(object);
            sys.updateList.add(object);
        });
// maybe the bug has something to do this with this?:
        sys.displayList.queueDepthSort();
    },

    setFollow: function(x, y)
    {
        this.followX = x;
        this.followY = y;
    },

    updateWorld: function()
    {
        var world = this.world;

        world.update(this.followX, this.followY);

        world.updateProcessList();
        this.integrate();
        world.resetProcessList();
    },

    syncWithGrid: function()
    {
        var world = this.world;

        world.gameObjectHandler.forEach(function(gameObjectArray)
        {
            gameObjectArray.forEach(function(gameObject)
            {
                // update      
                gameObject.bodyConf.update = function()
                {
                    gameObject.bodyConf.updateBoundingBox();
                    world.cameraGrid.removeReference(gameObject);
                    world.cameraGrid.addReference(gameObject);
                };
    
                // destroy
                gameObject.bodyConf.destroy = function()
                {
                    world.cameraGrid.removeReference(gameObject);
                };
            });
        });
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