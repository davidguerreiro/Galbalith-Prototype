//=============================================================================
// ModuleMenu.js
//=============================================================================

/*:
 * @plugindesc Galbalith Prototype Menu Screen.
 * @author David Guerreiro
 *
 * @help This plugin does not provide plugin commands.
 * 
 * Prototype version of Galbalith menu.
 */


 (function() {
    var _Scene_Menu_Base = Scene_MenuBase.prototype.create;

    /**
     * Sleep Implementation in JS
     */
    var sleepTime = function sleep(milliseconds) {
        var start = new Date().getTime();
        for (var i = 0; i < 1e7; i++) {
          if ((new Date().getTime() - start) > milliseconds){
            break;
          }
        }
      }

    /**
     * Init Menu and set windows.
     */
    Scene_Menu.prototype.create = function() {
        _Scene_Menu_Base.call(this);
        this.createCommandWindow();
        this.createGoldWindow();
        this.createMapNameWindow();
        this.createStatusWindow();

        this._statusWindow.x = 0;

        this._commandWindow.x = this._statusWindow.width;

        this._goldWindow.x = this._statusWindow.width;
        this._goldWindow.y = Graphics.boxHeight - ( this._windowMapName.height + this._goldWindow.height );

        this._windowMapName.x = this._statusWindow.width;

        
    };

//-----------------------------------------------------------------------------
// Status Window
//
// The window for displaying party status.
//-----------------------------------------------------------------------------
    /*
    function Window_MenuStatus() {
        this.initialize.apply(this, arguments);
    }

    Window_MenuStatus.prototype = Object.create(Window_Selectable.prototype);
    Window_MenuStatus.prototype.constructor = Window_MenuStatus;
    */
    Window_MenuStatus.prototype.initialize = function(x, y) {
        var width = this.windowWidth();
        var height = this.windowHeight();
        var self = this;
        this._frames = [130, 65, 0];
        this._counter = 0;
        Window_Selectable.prototype.initialize.call(this, x, y, width, height);
        this._formationMode = false;
        this._pendingIndex = -1;

        // frames used to animate battles in the main menu.
        this.refresh();
        

        // set interval to animate
        setInterval( function() {  
             
            if ( self._counter == 2 ) {
                self._frames = self._frames.reverse();
                self._counter = 0;
                console.log( self._frames );
                console.log( self._counter);
                console.log('inside');
            }
            
            self.refresh();
            //self._frames.splice(-1,1);
            self._counter++;
        }, 175);
        
    };
    
    

    Window_MenuStatus.prototype.windowWidth = function() {
        return Graphics.boxWidth - 240;
    };

    /**
     * Create Status Window
     */
    Scene_Menu.prototype.createStatusWindow = function() {
        this._statusWindow = new Window_MenuStatus(this._commandWindow.width, 0);
        this._statusWindow.reserveFaceImages();
        this.addWindow(this._statusWindow);
    };
    /**
     * Load and cache battler spreadsheet for each party member,
     * so they are later displayed on the menu.
     */
    Scene_Menu.prototype.getBattlerSprites = function() { 
        var battlerSprites = [];
        $gameParty.members().forEach(function(actor) {
           battlerSprites[actor._actorId] = ImageManager.reserveSvActor(actor._battlerName);
        }, this);
        return battlerSprites;
    }

    Window_MenuStatus.prototype.refresh = function() {
        console.log( 'this it refresh' );
        if (this.contents) {
            this.contents.clear();
            this.drawAllItems();
        }
    };

    // add parameter to animate battlers.
    /*
    Window_MenuStatus.prototype.drawAllItems = function() {
        var topIndex = this.topIndex();
        for (var i = 0; i < this.maxPageItems(); i++) {
            var index = topIndex + i;
            if (index < this.maxItems()) {
                this.drawItem(index);
            }
        }
    };
    */

    /**
     * Set Status window height according to party members.
     */
    Window_MenuStatus.prototype.windowHeight = function() {
        var baseHeight = Graphics.boxHeight / 4;
        return baseHeight * $gameParty._actors.length;
    };

    /**
     * Set number of selectable / visible rows to be
     * te same as the party members
     */
    Window_MenuStatus.prototype.numVisibleRows = function() {
        return $gameParty._actors.length;
    };

    /**
     * Re-write Actor data in Window Status
     */
    Window_MenuStatus.prototype.drawItem = function(index) {
        this.drawItemBackground(index);
        // this.drawItemImage(index);
        this.drawActorDataColOne(index, frames);
        //this.drawItemStatus(index);

    };
    
    Window_MenuStatus.prototype.drawItemBackground = function(index) {
        if (index === this._pendingIndex) {
            var rect = this.itemRect(index);
            var color = this.pendingColor();
            this.changePaintOpacity(false);
            this.contents.fillRect(rect.x, rect.y, rect.width, rect.height, color);
            this.changePaintOpacity(true);
        }
    };

    /**
     * Draw Actor Name, Status and Battler in Window Menu Status
     */
    Window_MenuStatus.prototype.drawActorDataColOne = function(index) {
        var actor = $gameParty.members()[index];
        var rect = this.itemRectForText(index);
        console.log( this._counter );
        console.log(actor);
        this.resetTextColor();
        this.drawText(actor._name, rect.y, rect.x - 10, 130, 'center' );
        this.drawActorIcons(actor, rect.y, rect.x + 20, 130 );
        var battlerSprite = ImageManager.loadSvActor(actor._battlerName);

        this.contents.blt(battlerSprite, this._frames[this._counter], 0, 65, 65, rect.x + 40, rect.y + 50);
        
    }

    /**
     * Draws animated actor sprite
     */
    Window_MenuStatus.prototype.drawAnimatedActorSprite = function(battlerBitMap, frames, rect) {
            var self = this;
            setInterval(function(j) {
                for(var i = 0; i < frames.length; i++) {
                    self.contents.blt(battlerBitMap, frames[i], 4, 60, 60, rect.x = 40, rect.y + 50);
                    sleepTime(500);
                }
            }, 2000);
    }
    
    Window_MenuStatus.prototype.drawItemImage = function(index) {
        var actor = $gameParty.members()[index];
        var rect = this.itemRect(index);
        this.changePaintOpacity(actor.isBattleMember());
        this.drawActorFace(actor, rect.x + 1, rect.y + 1, Window_Base._faceWidth, Window_Base._faceHeight);
        this.changePaintOpacity(true);
    };
    
    Window_MenuStatus.prototype.drawItemStatus = function(index) {
        var actor = $gameParty.members()[index];
        var rect = this.itemRect(index);
        var x = rect.x + 162;
        var y = rect.y + rect.height / 2 - this.lineHeight() * 1.5;
        var width = rect.width - x - this.textPadding();
        this.drawActorSimpleStatus(actor, x, y, width);
    };
    

    //-----------------------------------------------------------------------------
    // Window_Gold
    //
    // The window for displaying the party's gold.
    //-----------------------------------------------------------------------------
    function Window_Gold_Menu() {
        this.initialize.apply(this, arguments);
    }

    Window_Gold_Menu.prototype = Object.create(Window_Gold.prototype);
    Window_Gold_Menu.prototype.constructor = Window_Gold_Menu;

    Window_Gold_Menu.prototype.initialize = function(x, y) {
        var self = this;
        var width = this.windowWidth();
        var height = this.windowHeight();
        Window_Base.prototype.initialize.call(this, x, y, width, height);
        this.refresh();

        // refres every second to display played time in real time.
        setInterval(function(){
            self.refresh();
        }, 1000);
    };


    Scene_Menu.prototype.createGoldWindow = function() {
        this._goldWindow = new Window_Gold_Menu(0, 0);
        this._goldWindow.y = Graphics.boxHeight - this._goldWindow.height;
        this.addWindow(this._goldWindow);
    };

    /**
     * Set Window Gold Menu height to two rows.
     */
    Window_Gold_Menu.prototype.windowHeight = function() {
        return this.fittingHeight(2);
    };

    /**
     * Refresh function - Window Gold Menu adds the time just before
     * the currency value.
     */
    Window_Gold_Menu.prototype.refresh = function() {
        var _Game_System = new Game_System();
        var x = this.textPadding();
        var width = this.contents.width - this.textPadding() * 2;
        this.contents.clear();
        this.drawCurrentGameplayTime(_Game_System.playtimeText(), x, 0, width);
        this.drawCurrencyValue(this.value(), this.currencyUnit(), x, this.contents.height / 2, width);
    };

    /**
     * Draw current gameplay time.
     */
    Window_Gold_Menu.prototype.drawCurrentGameplayTime = function( value, x, y, width) {
       this.resetTextColor();
       this.drawText(value, x, y, width, 'right');
    };

//-----------------------------------------------------------------------------
// Current Map Window
//
// The window for displaying current map.
//-----------------------------------------------------------------------------

    function Window_MapName_Menu() {
        this.initialize.apply(this, arguments);
    }

    Window_MapName_Menu.prototype = Object.create(Window_Base.prototype);
    Window_MapName_Menu.prototype.constructor = Window_MapName_Menu;

    Window_MapName_Menu.prototype.initialize = function(x, y) {
        var width = this.windowWidth();
        var height = this.windowHeight();
        Window_Base.prototype.initialize.call(this, x, y, width, height);
        this.refresh();
    };

    Window_MapName_Menu.prototype.windowWidth = function() {
        // TODO: Set windwoWith based on text displayed.
        return 240;
        //return this.contents.measureTextWidth($dataMap.displayName);
    };

    Window_MapName_Menu.prototype.windowHeight = function() {
        return this.fittingHeight(1);
    };

    Window_MapName_Menu.prototype.refresh = function() {
        var x = this.textPadding();
        var width = this.contents.width - this.textPadding() * 2;
        this.contents.clear();
        // this.drawCurrencyValue(this.value(), this.currencyUnit(), x, 0, width);
        this.drawCurrentMapName(x, 0, width);
    };

    /**
     * Display current map name.
     */
    Window_MapName_Menu.prototype.drawCurrentMapName = function(x, y, width) {
        this.resetTextColor();
        this.drawText( $dataMap.displayName, x, y, width );
    }

    /**
     * Display current map name
     */
    Scene_Menu.prototype.createMapNameWindow = function() {
        this._windowMapName = new Window_MapName_Menu(0, 0);
        this._windowMapName.y = Graphics.boxHeight - this._windowMapName.height;
        this.addWindow(this._windowMapName);
    };


    //-----------------------------------------------------------------------------
    // Current Command Window
    //
    // The window for current Commands in the Main Menu.
    //-----------------------------------------------------------------------------
    Scene_Menu.prototype.createCommandWindow = function() {
        this._commandWindow = new Window_MenuCommand(0, 0);
        this._commandWindow.setHandler('item',      this.commandItem.bind(this));
        this._commandWindow.setHandler('skill',     this.commandPersonal.bind(this));
        this._commandWindow.setHandler('equip',     this.commandPersonal.bind(this));
        this._commandWindow.setHandler('status',    this.commandPersonal.bind(this));
        this._commandWindow.setHandler('formation', this.commandFormation.bind(this));
        this._commandWindow.setHandler('options',   this.commandOptions.bind(this));
        this._commandWindow.setHandler('save',      this.commandSave.bind(this));
        this._commandWindow.setHandler('gameEnd',   this.commandGameEnd.bind(this));
        this._commandWindow.setHandler('cancel',    this.popScene.bind(this));
        this.addWindow(this._commandWindow);
    };

    /**
     * Added function to add Quests to Main Menu.
     */
    Window_MenuCommand.prototype.makeCommandList = function() {
        this.addMainCommands();
        this.addFormationCommand();
        this.addOriginalCommands();
        this.addQuestCommand();
        this.addOptionsCommand();
        this.addSaveCommand();
        this.addGameEndCommand();
    };

    /**
     * Set command Equip before skills.
     * Add Limits Command
     */
    Window_MenuCommand.prototype.addMainCommands = function() {
        var enabled = this.areMainCommandsEnabled();
        if (this.needsCommand('item')) {
            this.addCommand(TextManager.item, 'item', enabled);
        }

        if (this.needsCommand('equip')) {
            this.addCommand(TextManager.equip, 'equip', enabled);
        }

        if (this.needsCommand('skill')) {
            this.addCommand(TextManager.skill, 'skill', enabled);
        }

        /**
         * Limits is a new command. It opens the window to see
         * Party Members commands list.
         */
        this.addCommand( 'Límites', 'limits', true );

        if (this.needsCommand('status')) {
            this.addCommand(TextManager.status, 'status', enabled);
        }
    };

    /**
     * Add quest command to Main menu
     */
    Window_MenuCommand.prototype.addQuestCommand = function() {
        this.addCommand('Misiones', 'quest', true);
    }

 })();