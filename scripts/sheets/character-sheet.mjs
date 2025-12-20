export class PnS2CharacterSheet extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.sheets.ActorSheetV2
) {

  // constructor(...args) 
  // {
  //   super(...args);
  //   console.log("PnS2CharacterSheet opened for actor:", this.document.name);
  // }

  static PARTS = {
    main: {
      template: "systems/PnS2/templates/actor/character.hbs"
    }
  };

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["PnS2", "sheet", "actor", "character"],
      width: 600,
      height: 400,
      submitOnChange: false,   // IMPORTANT
      submitOnClose: false     // IMPORTANT
    });
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    context.system = this.actor.system;
    context.system.hp ??= { value: 10, max: 10 };

    context.system.hpPercent =
      context.system.hp.max > 0
        ? Math.round((context.system.hp.value / context.system.hp.max) * 100)
        : 0;

    return context;
  }

  /** Wire input listeners */
  _attachPartListeners(partId, html) {
    super._attachPartListeners(partId, html);

    html.querySelectorAll("input[name]").forEach(input => {
      input.addEventListener("change", this._onInputChange.bind(this));
    });
  }

  /** Handle changes */
  async _onInputChange(event) {
    event.preventDefault();

    const input = event.currentTarget;
    const path = input.name;
    const value = Number(input.value);

    if (!path) return;

    await this.actor.update({ [path]: value });
  }
}
