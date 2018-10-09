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
// Windows Base
//
// Super class for all menu windows
// Extended and new methods added below here to enhance funcionality
//-----------------------------------------------------------------------------

/**
 *  Custom method to update font size with ease.
 * @param {string} fontSize 
 */
Window_Base.prototype.setFontSize = function(fontSize) {
    this.contents.fontSize = fontSize;
};

/**
* Calculate actor Exp Rate
*/
Window_Base.prototype.calculateActorExpRate = function(actor) {
    var actorNextLevel = actor._level + 1;

    if ( actorNextLevel > 99 ) {
        actorNextLevel = 99;
    }

    var totalExpRequired = actor.expForLevel(actorNextLevel) - actor.expForLevel(actor._level);
    var ratio =  ( totalExpRequired - actor.nextRequiredExp() ) / totalExpRequired

    return ( Number(ratio.toFixed(18)));
}

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
        
        // set interval to animate actors in Main Menu.
        setInterval( function() {               
            if ( self._counter == 2 ) {
                self._frames = self._frames.reverse();
                self._counter = 0;
            }
            self.refresh();
            self._counter++;
        }, 175);    
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
        this.drawActorDataColOne(index);
        //this.drawActorDataColTwo(index);
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

        // draw actor name.
        this.resetTextColor();
        this.drawText(actor._name, rect.x, rect.y, 130, 'center' );
        this.drawActorIcons(actor, rect.x, rect.y + 30, 130 );
        
        // draw actor battle sprite
        var battlerSprite = ImageManager.loadSvActor(actor._battlerName);
        // this_frames and this._counter are updated in every window refresh.
        this.contents.blt(battlerSprite, this._frames[this._counter], 0, 65, 65, rect.x + 40, rect.y + 50);
        
        // draw actor class.
        this.setFontSize(22);
        this.drawText(actor.currentClass().name, rect.x + 160, rect.y, 130 );
        this.resetFontSettings();

        // draw actor Vit numbers and gauge.
        this.drawActorHp(actor, rect.x + 160, rect.y + 30, 150);

        // draw actor Mp numbers and gauge.
        this.drawActorMp(actor, rect.x + 160, rect.y + 75, 150);

        // draw actor Lv text and number.
        this.drawActorLevel(actor, rect.x + 400, rect.y + 29 );

        // draw actor Exp. gauge.
        //this.drawGauge(rect.x + 400, rect.y + 75, 150, actorExpRate, this.mpGaugeColor1(), this.mpGaugeColor2() );
        this.drawActorExpGauge(actor, rect.x + 400, rect.y + 75, 150);

        
    }

    /**
     * Calculate actor Exp Rate
     */
    

    /**
     * Increase Gauge Height and add optional height parameter.
     */
    Window_MenuStatus.prototype.drawGauge = function(x, y, width, rate, color1, color2, height) {
        var height = height || 10;
        var fillW = Math.floor(width * rate);
        var gaugeY = y + this.lineHeight() - 8;
        this.contents.fillRect(x, gaugeY, width, height, this.gaugeBackColor());
        this.contents.gradientFillRect(x, gaugeY, fillW, height, color1, color2);
    };

    /**
     * Draw Exp Gauge
     */
    Window_MenuStatus.prototype.drawActorExpGauge = function(actor, x, y, width) {
        width = width || 186;
        var color1 = this.mpGaugeColor1();
        var color2 = this.mpGaugeColor2();
        var actorNextLevel = actor._level + 1;
        var actorExpRate = this.calculateActorExpRate(actor);

        if ( actorNextLevel > 99 ) {
            actorNextLevel = 99;
        }

        var totalExpRequired = actor.expForLevel(actorNextLevel) - actor.expForLevel(actor._level);
        var currentExp = totalExpRequired - actor.nextRequiredExp();

        console.log( color1 );
        console.log( color2 );
        console.log( currentExp );
        console.log( totalExpRequired );

        this.drawGauge(x, y, width, actorExpRate, color1, color2);
        this.changeTextColor(this.systemColor());
        this.setFontSize(15);
        this.drawText(TextManager.expA, x, y, 44);
        this.resetFontSettings();
        this.drawCurrentAndMaxExp(currentExp, totalExpRequired, x, y, width,
                               this.hpColor(actor), this.normalColor());
    };


    /**
     * Remove condition to draw current Vit / max Vit in Status Window.
     * Used to draw current / max for both Vit and Mp
     */
    Window_MenuStatus.prototype.drawCurrentAndMax = function(current, max, x, y, width, color1, color2) {
        var labelWidth = this.textWidth('HP');
        var valueWidth = this.textWidth('0000');
        var slashWidth = this.textWidth('/');
        var x1 = x + width - valueWidth;
        var x2 = x1 - slashWidth;
        var x3 = x2 - valueWidth;

        this.setFontSize(20);
        this.changeTextColor(color1);
        this.drawText(current, x3 + 28, y, valueWidth, 'right');
        this.changeTextColor(color2);
        this.drawText(' / ', x2 + 28, y, slashWidth, 'right');
        this.drawText(max, x1, y, valueWidth, 'right');
        this.resetFontSettings();
    };

    /**
     * Draw current Exp, max exp above the exp gauge
     * TODO: Fix width issue - adap numbers width and recalculate x dinamically
     */
    Window_MenuStatus.prototype.drawCurrentAndMaxExp = function(current, max, x, y, width, color1, color2) {
        var labelWidth = this.textWidth('HP');
        var valueWidth = this.textWidth('0000');
        var slashWidth = this.textWidth('/');
        var x1 = x + width - valueWidth;
        var x2 = x1 - slashWidth;
        var x3 = x2 - valueWidth;

        this.setFontSize(15);
        this.changeTextColor(color1);
        this.drawText(current, x3, y, valueWidth, 'right');
        this.changeTextColor(color2);
        this.drawText(' / ', x2 + 5, y, slashWidth, 'right');
        this.drawText(max, x1 - 19, y, valueWidth, 'right');
        this.resetFontSettings();
    }

    /**
     * Change level position, update font size.
     */
    Window_Base.prototype.drawActorLevel = function(actor, x, y) {
        this.changeTextColor(this.systemColor());
        this.setFontSize(45);
        this.drawText(TextManager.levelA, x, y + 4.6, 48);
        this.resetTextColor();
        this.setFontSize(60);
        this.drawText(actor.level, x + 50, y, 46, 'left');
        this.resetFontSettings();
    };
    
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