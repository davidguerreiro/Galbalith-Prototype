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
     */
    Scene_Skill.prototype.create = function() {
        console.log( 'here' );
        _Scene_Skill_Base.call(this);
        this.createHelpWindow();
        this.createSkillTypeWindow();
        this.createStatusWindow();
        this.createItemWindow();
        this.createActorWindow();
    }

    /**
     * Remove Default help window.
     */
    
})();