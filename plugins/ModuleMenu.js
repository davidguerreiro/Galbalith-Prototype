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
        this.createStatusWindow();

        this._statusWindow.x = 0;
        this._commandWindow.x = this._statusWindow.width;

        
        this._goldWindow.x = this._statusWindow.width;
    };

//-----------------------------------------------------------------------------
// Status Window
//
// The window for displaying party status.

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

    //-----------------------------------------------------------------------------
    // Window_Gold
    //
    // The window for displaying the party's gold.
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


 })();