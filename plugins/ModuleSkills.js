//=============================================================================
// ModuleSkills.js
//=============================================================================

/*:
 * @plugindesc Galbalith Prototype Menu Skills Screen.
 * @author David Guerreiro
 *
 * @help This plugin does not provide plugin commands.
 * 
 * Prototype version of Galbalith Menu Skills / Magic Screen.
 */

(function() {
    var _Scene_Skill_Base = Scene_Skill.prototype.create;

    /**
     * Init create Window Skills
     * 
     * @return {void}
     */
    Scene_Skill.prototype.create = function() {
        _Scene_Skill_Base.call(this);
        
        // reset all constructor windows.
        this.closeOriginalWindows();
        this.createPartyWindow();
    }


    /**
     * Creates the Selectable Party Window.
     * 
     * @return {void}
     */
    Scene_Skill.prototype.createPartyWindow = function() {
        this._skillsActorSelectable = new Window_SkillsActorSelectable();
        this.addWindow(this._skillsActorSelectable);
        console.log( 'added' );
    }


    /**
     * Close all the class original windows.
     * This approach has been taken to re-use the
     * Scene Skill class instead of creating a new one.
     * 
     * @return {null}
     */
    Scene_Skill.prototype.closeOriginalWindows = function() {
        this._helpWindow.close();
        this._skillTypeWindow.close();
        this._statusWindow.close();
        this._itemWindow.close();
    }

    /**
     * Window Character Selectable.
     * 
     * Window to select which party memeber
     * skills are displayed.
     * 
     * @return {object}
     */
    function Window_SkillsActorSelectable() {
        this.initialize.apply(this, arguments);
    }

    Window_SkillsActorSelectable.prototype = Object.create(Window_MenuStatus.prototype);
    Window_SkillsActorSelectable.prototype.constructor = Window_SkillsActorSelectable;

    /**
     * Init Actor Skills Selectable Window in Skills Screen.
     * 
     * @param {number} x 
     * @param {number} y 
     * @return {null}
     */
    Window_SkillsActorSelectable.prototype.initialize = function(x, y) {
        var width = this.windowWidth();
        var height = this.windowHeight();
        console.log( width );
        console.log( height ); 
        console.log( heigh );
        Window_Selectable.prototype.initialize.call(this, x, y, width, height);
        this.refresh();
    }

    /**
     * Get Window Width
     * 
     * @return {number}
     */
    Window_SkillsActorSelectable.prototype.windowWidth = function() {
        return Graphics.boxWidth;
    }

    /**
     * Get Window Height
     * 
     * @return {number}
     */
    Window_SkillsActorSelectable.prototype.windowHeight = function() {
        return Graphics.boxHeight;
    }

    /**
     * Set max number of commands items
     * 
     * @return {number}
     */
    Window_SkillsActorSelectable.prototype.maxItems = function() {
        return $gameParty.size();
    }

    /**
     * Set maximum number of visible cols
     * 
     * @return {number}
     */
    Window_SkillsActorSelectable.prototype.maxCols = function() {
        return 4;
    }


    /**
     * Overwrites the default drawItem method
     * to draw Actor battle sprite and class name
     * 
     * @return {void}
     */
    Window_SkillsActorSelectable.prototype.drawItem = function(index) {
        // TODO : Call here the methods to draw the actor data.
        var actor = $gameParty.members()[index];
        var rect = this.itemRectForText(index);

        this.drawText(actor._name, rect.x, rect.y, 130, 'center' );
    }
    
})();