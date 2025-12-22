export class PnS2CharacterSheet extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheetV2) 
{
  constructor(...args) 
  {
    super(...args);
    if (activateLogging) { console.log("----PnS2CharacterSheet opened for actor:", this.document.name); }
    
  }

  static PARTS = {
    main: {
      template: "systems/PnS2/templates/actor/character.hbs"
    }
  };

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["PnS2", "sheet", "actor", "character"],
      width: 600,
      height: "auto",
      submitOnChange: false,
      submitOnClose: false,
      tabs: [
        { group: "primary", navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "basiswerte" },
      ]
    });
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    
    context.actor = this.actor;
    context.system = this.actor.system;
    context.img = this.actor.img;
  
    return context;
  }

  /** Wire input listeners */
  _attachPartListeners(partId, html) {
    super._attachPartListeners(partId, html);

    html.querySelectorAll("input[name]").forEach(input => {
      input.addEventListener("change", this._onInputChange.bind(this));
    });

    html.querySelectorAll(".rollable").forEach(label => {
      label.addEventListener("click", this._onRoll.bind(this));
    });

    /* Click to open file picker */
    html.querySelector(".profile-img")?.addEventListener("click", () => {
      if (!this.actor.isOwner) return;

      new foundry.applications.apps.FilePicker.implementation({
        type: "image",
        current: this.actor.img,
        callback: path => this.actor.update({ img: path })
      }).render(true);
    });

    /* Drag & drop image */
    html.querySelector(".profile-img")?.addEventListener("drop", async event => {
      event.preventDefault();
      const data = TextEditor.getDragEventData(event);
      if (data?.type === "Image") {
        await this.actor.update({ img: data.src });
      }
    });
  }

  // Textbox changes
  async _onInputChange(event) {
    event.preventDefault();
    if (activateLogging) { console.log("--- Input change event triggered: ", this.document.name); }
    const input = event.currentTarget;
    const path = input.name;
    const value = input.type === "checkbox" ? input.checked : input.value;
    const dataType = input.dataset.dtype;
    if (activateLogging) {
      console.log("-- input: ", input);
      console.log("-- path: ", path);
      console.log("-- value: ", value);
      console.log("-- dataType: ", dataType);
    }

    let updateValue = value;
    if (dataType === "Number") {
      updateValue = Number(value);
    }
    
    if (!path) return;

    const updateData = { [path]: updateValue };

    // Check if the changed path is a value or modifier of a main stat.
    const statMatch = path.match(/^system\.([a-zA-Z]+)\.(value|modifier)$/);

    if (statMatch) {
      const statName = statMatch[1];
      const stat = this.actor.system[statName];

      // Ensure the stat and its properties exist
      if (stat && typeof stat.value === 'number' && typeof stat.modifier === 'number') {
        const currentValue = (path.endsWith('.value')) ? updateValue : stat.value;
        const currentModifier = (path.endsWith('.modifier')) ? updateValue : stat.modifier;
        updateData[`system.${statName}.total`] = Number(currentValue) + Number(currentModifier);
      }
    }

    await this.actor.update(updateData);
  }

  // Roll event
  async _onRoll(event) {
    if (activateLogging) { console.log("--- rollable event triggered: ", this.document.name); }
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    if (activateLogging) {
      console.log("-- element: ", element);
      console.log("-- dataset: ", dataset);
    }

    if (dataset.roll) {
      const roll = new Roll("1d100",{},{rollMode: game.settings.get("core", "rollMode")});
      if (activateLogging) { console.log("-- roll: ", roll); }
      let resultString;
      let resultIcon;
      const dice = roll.dice[0];
      const attributeKey = dataset.key;
      const attributeLabel = game.i18n.localize(`PnS2.${attributeKey.toUpperCase()}`);
      const attributeTotal = this.actor.system[dataset.key].total;
      const stat = this.actor.system[attributeKey];
      const value = Number(stat.value);
      const modifier = Number(stat.modifier);
      const total = Number(stat.total);
      
      await roll.evaluate();

      const isCriticalSuccess = roll.total <= 2;
      const isCriticalFail = roll.total >= 98;
      const isSuccess = roll.total <= attributeTotal;

      if (activateLogging) { console.log("-- roll.total: ", roll.total); }
      if (activateLogging) { console.log("-- attributeTotal: ", attributeTotal); }

      if (isCriticalSuccess) 
      {
        resultString = `<strong>${game.i18n.localize("PnS2.CRITICALSUCCESS")}</strong>`;
        resultIcon = `<div><img class="roll-critical-success" src="systems/PnS2/assets/success.svg"/><img class="roll-critical-success" src="systems/PnS2/assets/success.svg"/><img class="roll-critical-success" src="systems/PnS2/assets/success.svg"/></div>`;
      }
      else if (isCriticalFail) 
      {
        resultString = `<strong>${game.i18n.localize("PnS2.CRITICALFAIL")}</strong>`;
        resultIcon = `<div><img class="roll-critical-fail" src="systems/PnS2/assets/fail.svg"/><img class="roll-critical-fail" src="systems/PnS2/assets/fail.svg"/><img class="roll-critical-fail" src="systems/PnS2/assets/fail.svg"/></div>`;
      }
      else if (isSuccess) 
      {
        resultString = `<strong>${game.i18n.localize("PnS2.SUCCESS")}</strong>`;
        //resultIcon = `<img src="systems/PnS2/assets/success.svg" title="${roll.formula}" style="vertical-align: middle; height: 2em; border: none;"/>`;
        resultIcon = `<div> <img class="roll-success" src="systems/PnS2/assets/success.svg"/></div>`;
      } 
      else 
      {
        resultString = `<strong>${game.i18n.localize("PnS2.FAIL")}</strong>`;
        //resultIcon = `<img src="systems/PnS2/assets/fail.svg" title="${roll.formula}" style="vertical-align: middle; height: 2em; border: none;"/>`;
        resultIcon = `<div> <img class="roll-fail" src="systems/PnS2/assets/fail.svg"/> </div>`;
      }

      dice.options.flavor = `
        ${attributeKey}
        ${value} (value) + ${modifier} (modifier) = ${total}
      `;
      dice.options.label = resultIcon;

      const rollHtml = await roll.render();
      const flavor = `${attributeLabel} ${game.i18n.localize(`PnS2.Roll`)} (${game.i18n.localize(`PnS2.RollTarget`)}: ${attributeTotal})`;
      /* This part into the content will include the "normal" drop down behaviour
      <br/>
      ${rollHtml}
      <br/>
      */
      const content = `
        <div class="dice-roll">
            <div class="dice-result">
                <h4 class="dice-formula">${resultIcon}</h4>
                <h4 class="dice-total">${roll.total}</h4>
            </div>
        </div>
        <p>${resultString}</p>
      `;

      ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: flavor,
        content: content,
        rolls: [roll],              // THIS enables click-to-inspect
        flags: {
          PnS2: {
            attribute: attributeKey,
            target: total,
            isSuccess
          }
        }
      });
    }
  }
}
