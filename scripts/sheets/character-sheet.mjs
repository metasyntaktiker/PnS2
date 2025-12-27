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
      width: 800,
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

    // Prepare talents 
    if (context.system.talents) {
      context.system.talents.forEach(talent => {
        const base1 = Math.floor(context.system[talent.base1]?.total / 3) || 0;
        const base2 = Math.floor(context.system[talent.base2]?.total / 3) || 0;
        const base3 = Math.floor(context.system[talent.base3]?.total / 3) || 0;
        talent.baseSum = Math.floor((base1 + base2 + base3) / 3);
        talent.total = talent.baseSum + talent.value;

        const attr1 = game.i18n.localize(`PnS2.${talent.base1.toUpperCase()}`);
        const attr2 = game.i18n.localize(`PnS2.${talent.base2.toUpperCase()}`);
        const attr3 = game.i18n.localize(`PnS2.${talent.base3.toUpperCase()}`);
        talent.combination = `${attr1}+${attr2}+${attr3}`;
        talent.combinationTooltip = `(${attr1} (${base1}) + ${attr2} (${base2}) + ${attr3} (${base3})) / 3`;
      });
    }
  
    return context;
  }

  // Sets the size of the character-sheet to 800px
  setPosition(position = {}) {
    if ( typeof position.width === "number" ) {
      position.width = Math.max(position.width, 800);
    }
    return super.setPosition(position);
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

    // Talents
    html.querySelector(".add-talent")?.addEventListener("click", this._onAddTalent.bind(this));
    html.querySelectorAll(".talents-delete").forEach(btn => {
        btn.addEventListener("click", this._onDeleteTalent.bind(this));
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
    
    if ( this._focusTab ) {
      const tabToActivate = this._focusTab;
      delete this._focusTab;

      // Manually activate the tab by manipulating classes
      const nav = this.element.querySelector('.sheet-tabs');
      const body = this.element.querySelector('.sheet-body');

      if (nav && body) {
        nav.querySelectorAll('.item').forEach(el => el.classList.remove('active'));
        body.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
        
        const navTab = nav.querySelector(`[data-tab="${tabToActivate}"]`);
        if (navTab) navTab.classList.add('active');

        const bodyTab = body.querySelector(`[data-tab="${tabToActivate}"]`);
        if (bodyTab) bodyTab.classList.add('active');
      }
    }
  }

  // Textbox changes
  async _onInputChange(event) {
    event.preventDefault();
    if (activateLogging) { console.log("--- Input change event triggered: ", this.document.name); }
    const input = event.currentTarget;
    const path = input.name;
    const value = input.type === "checkbox" ? input.checked : input.value;

    // Handle updates to talents specifically
    const talentMatch = path.match(/^system\.talents\.(\d+)\.value$/);
    if (talentMatch) {
      const index = Number(talentMatch[1]);
      const talents = foundry.utils.deepClone(this.actor.system.talents);
      if (talents[index]) {
        talents[index].value = Number(value);
        this._focusTab = "talents"; // Set the focus tab to "talents"
        return this.actor.update({ "system.talents": talents });
      }
    }

    // Generic update logic for other fields
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
        const currentValue = (path.endsWith('.value')) ? Number(updateValue) : stat.value;
        const currentModifier = (path.endsWith('.modifier')) ? Number(updateValue) : stat.modifier;
        updateData[`system.${statName}.total`] = currentValue + currentModifier;
      }
    }

    await this.actor.update(updateData);
  }

  // Add Talent
  async _onAddTalent(event) {
    event.preventDefault();

    const baseValues = {
        "str": "PnS2.STR",
        "agi": "PnS2.AGI",
        "pre": "PnS2.PRE",
        "con": "PnS2.CON",
        "int": "PnS2.INT",
        "cha": "PnS2.CHA",
        "wil": "PnS2.WIL"
    };

    const template = "systems/PnS2/templates/dialog/add-talent.hbs";
    const html = await foundry.applications.handlebars.renderTemplate(template, { baseValues });
    const DialogClass = foundry.applications.api.DialogV2;

    const dialog = new DialogClass({
    window: { title: game.i18n.localize("PNS.Talent.Add") },
    classes: ["pns2-add-talent-dialog"],
    width: 300,
    minWidth: 300,
    maxWidth: 300,
    content: html,
    buttons: [
    {
      action: "apply",
      label: game.i18n.localize("PNS.Button.Apply"),
      default: true,
      //callback: (event, button, dialog) => button.form.elements.choice.value
        callback: async (event) => {
          const form = event.currentTarget.closest('.dialog').querySelector('form');
          const formData = new FormData(form);
          const name = formData.get("name");
          const base1 = formData.get("base1");
          const base2 = formData.get("base2");
          const base3 = formData.get("base3");

          if (!name || !base1 || !base2 || !base3) {
            ui.notifications.warn("Please fill out all fields.");
            return false; // Prevent dialog from closing on validation failure
          }

          const newTalent = {
            name: name,
            base1: base1,
            base2: base2,
            base3: base3,
            value: 0
          };

          const talents = this.actor.system.talents.concat([newTalent]);
          this._focusTab = "talents";
          await this.actor.update({ "system.talents": talents });
        }
    },
    {
      action: "cancel",
      label: game.i18n.localize("PNS.Button.Cancel")
    }],
    submit: result =>
    {
      if ( result === "apply" ) console.log("-- user picked apply");
      else console.log(`-- user picked cancel`);
    }
  })
    dialog.render(true);
  }

  // Delete Talent
  async _onDeleteTalent(event) 
  {
    event.preventDefault();
    const talentId = event.currentTarget.closest(".talents-row").dataset.talentId;
    const talents = this.actor.system.talents.filter((_, id) => id != talentId);
    this._focusTab = "talents";
    await this.actor.update({ "system.talents": talents });
  }


  // Roll event
  async _onRoll(event) 
  {
    if (activateLogging) { console.log("--- rollable event triggered: ", this.document.name); }
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    if (activateLogging) {
      console.log("-- element: ", element);
      console.log("-- dataset: ", dataset);
    }

    if (dataset.roll) 
    {
      const attributeKey = dataset.key;
      let attributeLabel;
      let attributeTotal;
      let originalFlavorText;

      // Handle Talent Rolls
      if (attributeKey.startsWith('talent-')) 
      {
        const talentIndex = parseInt(attributeKey.split('-')[1], 10);
        const talent = this.actor.system.talents[talentIndex];
        if (!talent) return;

        const base1 = Math.floor(this.actor.system[talent.base1]?.total / 3) || 0;
        const base2 = Math.floor(this.actor.system[talent.base2]?.total / 3) || 0;
        const base3 = Math.floor(this.actor.system[talent.base3]?.total / 3) || 0;
        const baseSum = Math.floor((base1 + base2 + base3) / 3);

        attributeLabel = talent.name;
        attributeTotal = baseSum + talent.value;
        originalFlavorText = `
          ${game.i18n.localize('PNS.Talent.baseSum')}: ${baseSum} + 
          ${game.i18n.localize('PNS.Talent.talentValue')}: ${talent.value}
        `;
      }
      // Handle Luck Rolls
      else if (attributeKey.startsWith('luck'))
      {
        const stat = this.actor.system[attributeKey];
        if (!stat) return;

        const value = Number(stat.value);

        attributeLabel = game.i18n.localize(`PnS2.${attributeKey.toUpperCase()}`);
        attributeTotal = stat.value;
        originalFlavorText = `${value} (${game.i18n.localize('PnS2.CharacterSheet.Base')})`;
      }
      // Handle Attribute Rolls
      else 
      {
        const stat = this.actor.system[attributeKey];
        if (!stat) return;
        
        const value = Number(stat.value);
        const modifier = Number(stat.modifier);
        
        attributeLabel = game.i18n.localize(`PnS2.${attributeKey.toUpperCase()}`);
        attributeTotal = stat.total;
        originalFlavorText = `${value} (${game.i18n.localize('PnS2.CharacterSheet.Base')}) + ${modifier} (${game.i18n.localize('PnS2.CharacterSheet.Modifier')}) = ${attributeTotal}`;
      }

      // Modificator Roll Dialog
      const template = "systems/PnS2/templates/dialog/roll-dialog.hbs";
      const html = await foundry.applications.handlebars.renderTemplate(template, { targetValue: attributeTotal });
      const DialogClass = foundry.applications.api.DialogV2;

      const dialog = new DialogClass({
        window: { title: game.i18n.localize("PnS2.Roll.DialogTitle") },
        content: html,
        buttons: [
          {
            action: "roll",
            label: game.i18n.localize("PnS2.Roll.RollButton"),
            default: true,
            callback: async (event) => {
              const form = event.currentTarget.closest('.dialog').querySelector('form');
              const formData = new FormData(form);
              const modifier = parseInt(formData.get('modifier')) || 0;
              const newAttributeTotal = attributeTotal + modifier;

              const roll = new Roll("1d100", {}, { rollMode: game.settings.get("core", "rollMode") });
              await roll.evaluate();
              
              const dice = roll.dice[0];

              let flavorText = originalFlavorText;
              if (modifier !== 0) {
                flavorText += ` + ${modifier} (${game.i18n.localize('PnS2.Roll.Modify')}) = ${newAttributeTotal}`;
              }
              const chatFlavor = `${attributeLabel} ${game.i18n.localize('PnS2.Roll.Text')} (${game.i18n.localize('PnS2.RollTarget')}: ${newAttributeTotal})`;

              const isCriticalSuccess = roll.total <= 2;
              const isCriticalFail = roll.total >= 98;
              const isSuccess = roll.total <= newAttributeTotal;

              let resultString;
              let resultIcon;

              if (isCriticalSuccess) {
                resultString = `<strong>${game.i18n.localize("PnS2.CRITICALSUCCESS")}</strong>`;
                resultIcon = `<div><img class="roll-critical-success" src="systems/PnS2/assets/success.svg"/><img class="roll-critical-success" src="systems/PnS2/assets/success.svg"/><img class="roll-critical-success" src="systems/PnS2/assets/success.svg"/></div>`;
              } else if (isCriticalFail) {
                resultString = `<strong>${game.i18n.localize("PnS2.CRITICALFAIL")}</strong>`;
                resultIcon = `<div><img class="roll-critical-fail" src="systems/PnS2/assets/fail.svg"/><img class="roll-critical-fail" src="systems/PnS2/assets/fail.svg"/><img class="roll-critical-fail" src="systems/PnS2/assets/fail.svg"/></div>`;
              } else if (isSuccess) {
                resultString = `<strong>${game.i18n.localize("PnS2.SUCCESS")}</strong>`;
                resultIcon = `<div> <img class="roll-success" src="systems/PnS2/assets/success.svg"/></div>`;
              } else {
                resultString = `<strong>${game.i18n.localize("PnS2.FAIL")}</strong>`;
                resultIcon = `<div> <img class="roll-fail" src="systems/PnS2/assets/fail.svg"/> </div>`;
              }

              dice.options.flavor = flavorText;
              dice.options.label = resultIcon;

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
                flavor: chatFlavor,
                content: content,
                rolls: [roll],
                flags: {
                  PnS2: {
                    attribute: attributeKey,
                    target: newAttributeTotal,
                    isSuccess
                  }
                }
              });
            }
          }, 
          {
            action: "cancel",
            label: game.i18n.localize("PNS.Button.Cancel")
          }
        ],
        submit: () => {} // Prevent default submission
      });
      dialog.render(true);
    }
  }
}
