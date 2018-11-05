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

    // console.log(Scene_Magic);

    /**
     * Init Menu and set windows.
     */
    Scene_Menu.prototype.create = function() {
        _Scene_Menu_Base.call(this);
        this.createCommandWindow();
        this.createGoldWindow();
        this.createMapNameWindow();
        this.createStatusWindow(this);

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

        // Menu animation variables
        this.menuAnimations = this.setPartyAnimations();
        this.counter = 0;
        Window_Selectable.prototype.initialize.call(this, x, y, width, height);
        this._formationMode = false;
        this._pendingIndex = -1;

        // frames used to animate battles in the main menu.
        this.refresh();
 
        // set interval to animate actors in Main Menu.
        this._animateMenuStatusChar = setInterval( function() {
            if ( self.counter == 2 ) {
                for(var i = 0; i < self.menuAnimations.length; i++) {
                    self.menuAnimations[i].x = self.menuAnimations[i].x.reverse();
                }
                self.counter = 0;
            }
            self.refresh();
            self.counter++;
        }, 175);
        
    };

    /**
     * Remove setIntervals if the menu has been closed
     * and the player is already performing actions.
     */
    Window_MenuStatus.prototype.refresh = function() {
        Window_Selectable.prototype.refresh.call(this);

        if ( ! $gamePlayer.canMove() ) {
            clearInterval(this._animateMenuStatusChar);
        }
    }

    /**
     * Create Status Window
     */
    Scene_Menu.prototype.createStatusWindow = function() {
        this._statusWindow = new Window_MenuStatus(this._commandWindow.width, 0);
        this._statusWindow.reserveFaceImages();
        this.addWindow(this._statusWindow);
    };

    /**
     * Set animation frames for all party members
     * Animations vary depending of state, so
     * each party member has a different set
     * of frames array to loop when animate
     * 
     * @return {array} animations
     */
    Window_MenuStatus.prototype.setPartyAnimations = function() {
        var members = $gameParty.members();
        var stateAnimation = 'normal';
        var animations = [];

        for( var i = 0; i < members.length; i++ ) {
            // init for each member.
            stateAnimation = 'normal';


            // death animation.
            if (members[i]._hp <= 0) {
                stateAnimation = 'death';
                this.menuSpriteHeight = 60;
            }
            
            // status condition animation.
            if (members[i]._states.length >= 1) {
                stateAnimation = 'status_condition';
            }
            
            animations.push(this.getAnimationFrames(stateAnimation));
        }
        return animations;
    }

    /**
     * Get MenuStatus Animations frames
     * 
     * @param {string} animation
     * @return {object} frames
     */
    Window_MenuStatus.prototype.getAnimationFrames = function(animation) {
        var animation = animation || 'normal';
        var basicWidthHeight = 65;
        var frames = {
            x: [],
            y: [],
        };

        switch(animation) {
            case 'normal' :
                frames.x = [130, 65, 0];
                frames.y = [0, 0, 0];
                frames.width = basicWidthHeight;
                frames.height = basicWidthHeight;
                break;
            case 'status_condition':
                frames.x = [390, 455, 390];
                frames.y = [130, 130, 130];
                frames.width = basicWidthHeight;
                frames.height = basicWidthHeight;
                break
            case 'death' :
                frames.x = [383, 383, 383];
                frames.y = [324, 324, 324];
                frames.width = basicWidthHeight;
                frames.height = 60;
                break;
            default:
                frames.x = [130, 65, 0];
                frames.y = [0, 0, 0];
                frames.width = basicWidthHeight;
                frames.height = basicWidthHeight;
                break
        }
        
        return frames;
    }

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
        this.drawActorData(index);

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
    Window_MenuStatus.prototype.drawActorData = function(index) {
        var actor = $gameParty.members()[index];
        var rect = this.itemRectForText(index);

        // draw actor name.
        this.resetTextColor();
        this.drawText(actor._name, rect.x, rect.y, 130, 'center' );
        this.drawActorIcons(actor, rect.x, rect.y + 30, 130 );

        // draw actor battle sprite
        var battlerSprite = ImageManager.loadSvActor(actor._battlerName);
        // this_frames and this._counter are updated in every window refresh.
        this.contents.blt(battlerSprite, this.menuAnimations[index].x[this.counter], this.menuAnimations[index].y[this.counter], this.menuAnimations[index].width, this.menuAnimations[index].height, rect.x + 40, rect.y + 50);
        this.drawVertLine(rect.x + 145, rect.y, rect.height, 30);
        
        // draw actor class.
        this.setFontSize(22);
        this.drawText(actor.currentClass().name, rect.x + 160, rect.y, 130 );
        this.resetFontSettings();

        // draw actor Vit numbers and gauge.
        this.drawActorHp(actor, rect.x + 160, rect.y + 30, 180);

        // draw actor Mp numbers and gauge.
        this.drawActorMp(actor, rect.x + 160, rect.y + 75, 180);

        this.drawVertLine(rect.x + 370, rect.y, rect.height, 30);

        // draw actor Lv text and number.
        this.drawActorLevel(actor, rect.x + 398, rect.y + 29 );

        // draw actor Exp. gauge.
        this.drawActorExpGauge(actor, rect.x + 400, rect.y + 75, 150);
    }

    /**
     * Draw vertical line
     */
    Window_MenuStatus.prototype.drawVertLine = function(x, y, height, cutBorders) {
        var cutBorders = cutBorders || 0;
        var height = height || this.contentsHeight();
        height = (cutBorders) ? height - cutBorders : height;
        
        // add extra height when there is only 1 party member.
        if ( $gameParty.members().length <= 1 ) {
            height = height + 22;
        }

        this.contents.paintOpacity = 48;
        this.contents.fillRect(x, y, 2, height, this.normalColor());
        this.contents.paintOpacity = 255;
    };
    

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
        var fontSize = 15;
        var color1 = this.mpGaugeColor1();
        var color2 = this.mpGaugeColor2();
        var actorNextLevel = actor._level + 1;
        var actorExpRate = this.calculateActorExpRate(actor);

        if ( actorNextLevel > 99 ) {
            actorNextLevel = 99;
        }

        var totalExpRequired = actor.expForLevel(actorNextLevel) - actor.expForLevel(actor._level);
        var currentExp = totalExpRequired - actor.nextRequiredExp();

        this.drawGauge(x, y, width, actorExpRate, color1, color2);
        this.changeTextColor(this.systemColor());
        this.setFontSize(fontSize);
        this.drawText(TextManager.expA, x, y, 44);
        this.resetFontSettings();
        this.drawCurrentAndMax(currentExp, totalExpRequired, x, y, width, this.hpColor(actor), this.normalColor(), fontSize, true);
    };


    /**
     * Remove condition to draw current Vit / max Vit in Status Window.
     * Used to draw current / max for both Vit and Mp
     */
    Window_MenuStatus.prototype.drawCurrentAndMax = function(current, max, x, y, width, color1, color2, fontSize, isExp) {
        /**
         * Light ajust to y position.
         * Done here to avoid extend custom drawHpGauge
         * method to just change 1 pixel.
         */
        y--;
        var isExp = isExp || false;                 // exp requires some extra logic due to position and font size.
        var fontSize = fontSize || 20;
        var maxString = max.toString();
        var currentString = max.toString();
        var labelWidth = this.textWidth('Vit');
        var slashWidth = this.textWidth('/');
        var currentValueWidth = this.textWidth(currentString);
        var maxValueWidth = this.textWidth(maxString);
        var topToAjust = ( isExp ) ? 5 : 4;        // exp can go over 9999.

        if ( isExp ) {
            var base = 19;
        }

        // calculate x values.
        var xMaxValue = x + width - labelWidth;

        /**
         * Reajust x position for maximun digits to lower
         */
        if ( maxString.length <= ( topToAjust - 1 ) ) {
            xMaxValue = xMaxValue + ( ( topToAjust - maxString.length ) * 10);
        }

        /**
         * Values above are set for Window
         * Menu Status FontSize 20 or above
         * Reajust values for exp gauge (which uses
         * lower font size)
         * 
         * TODO : Replace for loop by algorithm.
         */
        if ( isExp ) {
            for (var i = 0; i <= ( maxString.length - 2); i++ ) {
                base = base - 3;
            }
            xMaxValue = xMaxValue - ( topToAjust + base); 
            y = y + 3;
        }

        var xSlashValue = xMaxValue - slashWidth;
        /**
         * Light 3px reajust for current value
         * as '/' creates visual effect of impairing
         * x positon.
         */
        var xCurrentValue = ( xSlashValue - currentValueWidth ) - 3;
        
        
        this.setFontSize(fontSize);
        this.changeTextColor(color1);
        this.drawText(max, xMaxValue, y, maxValueWidth, 'left');
        this.drawText('/', xSlashValue, y, slashWidth, 'left');
        this.drawText(current, xCurrentValue, y, currentValueWidth, 'right');
        this.resetFontSettings();
    };

    /**
     * Draw current Exp, max exp above the exp gauge.
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
    Window_MenuStatus.prototype.drawActorLevel = function(actor, x, y) {
        this.changeTextColor(this.systemColor());
        this.setFontSize(45);
        this.drawText(TextManager.levelA, x, y + 4.6, 48);
        this.resetTextColor();
        this.setFontSize(60);
        this.drawText(actor.level, x + 50, y, 46, 'right');
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
        this._iconSprite = this.getIconSpriteSheet();
        
        Window_Base.prototype.initialize.call(this, x, y, width, height);
        this.refresh();

        // refres every second to display played time in real time.
        setInterval(function(){
            self.refresh();
        }, 1000);

        // load icon spreadsheet into cache.
        this._iconSprite.addLoadListener(function() {
            this.refresh();
        }.bind(this));
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
     * Draw currency value, text
     * and currency icon.
     */
    Window_Gold_Menu.prototype.drawCurrencyValue = function(value, unit, x, y, width) {
        var unitWidth = Math.min(80, this.textWidth(unit));
        this.resetTextColor();
        this.contents.blt(this._iconSprite, 310, 291, 23, 22, x + 2, y + 6, 26, 25 );
        this.drawText(value, x, y, width - unitWidth - 6, 'right');
        this.changeTextColor(this.systemColor());
        this.drawText(unit, x + width - unitWidth, y, unitWidth, 'right');
    };

    /**
     * Draw current gameplay time
     * and current time icon.
     */
    Window_Gold_Menu.prototype.drawCurrentGameplayTime = function( value, x, y, width) {
       this.resetTextColor();
       this.contents.blt(this._iconSprite, 288, 264, 23, 22, x + 2, y + 6, 26, 25 );
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
        this.drawCurrentMapName(x, 0, width);
    };

    /**
     * Display current map name.
     */
    Window_MapName_Menu.prototype.drawCurrentMapName = function(x, y, width) {
        this.resetTextColor();
        this.drawText($dataMap.displayName, x, y, width, 'center');
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
        this._commandWindow = new Window_MainMenuCommand(0, 0);
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
     * Window MainMenuCommand has to be prototype linked
     * to Window_MenuCommnad. Changes have to remain only
     * to commands displayed on the Main Menu Screen
     */
    function Window_MainMenuCommand() {
        this.initialize.apply(this, arguments);
    }

    Window_MainMenuCommand.prototype = Object.create(Window_MenuCommand.prototype);
    Window_MainMenuCommand.prototype.constructor = Window_MainMenuCommand;

    Window_MainMenuCommand.prototype.initialize = function(x, y) {
        this._iconSprite = this.getIconSpriteSheet();
        /**
         * Load spreadsheet into cache and refresh window
         * once is loaded.
         */
        
        Window_MenuCommand.prototype.initialize.call(this, x, y);
        this._iconSprite.addLoadListener(function() {
            this.refresh();
        }.bind(this));
    };


    /**
     * Refresh metho for Menu Command Window
     */
    Window_MainMenuCommand.prototype.refresh = function() { 
        this.clearCommandList();
        this.makeCommandList();
        this.createContents();
        Window_Selectable.prototype.refresh.call(this);
    };

    /**
     * Get IconSet Bitmap object to draw icons on
     * commmand menu items. Window Base exteded so
     * icon spreadsheet is available for all windows
     * if required.
     * 
     * @return {Bitmap}
     */
    Window_Base.prototype.getIconSpriteSheet = function() {
        return ImageManager.loadSystem('IconSetOld');
    }

    /**
     * Added function to add Quests to Main Menu.
     */
    Window_MainMenuCommand.prototype.makeCommandList = function() {
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
    Window_MainMenuCommand.prototype.addMainCommands = function() {
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
    Window_MainMenuCommand.prototype.addQuestCommand = function() {
        this.addCommand('Misiones', 'quest', true);
    }

    /**
     * Add extra padding on commands on the left to draw
     * icon for menu commands.
     * Add function to draw item.
     */
    Window_MainMenuCommand.prototype.drawItem = function(index) {
        var rect = this.itemRectForText(index);
        var align = this.itemTextAlign();
        this.resetTextColor();
        this.changePaintOpacity(this.isCommandEnabled(index));
        this.drawCommandIconSprite(rect.x, rect.y, this.commandName(index));
        this.drawText(this.commandName(index), rect.x + 40, rect.y, rect.width, align);
    };

    /**
     * Draws command icon sprite
     * 
     * @param {string} commandName 
     * @return void
     */
    Window_MainMenuCommand.prototype.drawCommandIconSprite = function(x, y, commandName) {
        var width = 23;
        var height = 22;
        var alignY = 6;
        var alignX = 2;
        switch(commandName) {
            case 'Objetos':
                this.contents.blt(this._iconSprite, 0, 218, width, height, x + alignX, y + alignY, width + 3, height + 3 );
                break;
            case 'Equipo':
                this.contents.blt(this._iconSprite, 95, 362, width, height, x + alignX, y + alignY, width + 3, height + 3 );
                break;
            case 'Magia':
                this.contents.blt(this._iconSprite, 241.5, 145, width, height, x + alignX, y + alignY, width + 4, height + 3 );
                break;
            case 'Límites':
                this.contents.blt(this._iconSprite, 73, 194, width, height, x + alignX, y + alignY, width + 3, height + 3 );
                break;
            case 'Estado':
                this.contents.blt(this._iconSprite, 216, 194, width, height, x + alignX, y + alignY, width + 3, height + 3 );
                break;
            case 'Formación':
                this.contents.blt(this._iconSprite, 97, 194, width, height, x + alignX, y + alignY, width + 7, height + 3 );
                break;
            case 'Misiones':
                this.contents.blt(this._iconSprite, 143, 217, width, height, x + alignX, y + alignY, width + 3, height + 3 );
                break;
            case 'Opciones':
                this.contents.blt(this._iconSprite, 145, 194, width, height, x + alignX, y + alignY, width + 7, height + 3 );
                break;
            case 'Guardar':
                this.contents.blt(this._iconSprite, 312, 194, width, height, x + alignX, y + alignY, width + 3, height + 3 );
                break;
            case 'Salir':
                this.contents.blt(this._iconSprite, 360, 192, width, height, x + alignX, y + alignY, width + 3, height + 3 );
                break;
            default:
                break;
        }
    }

 })();