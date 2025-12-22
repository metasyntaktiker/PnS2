export class PnS2CharacterSheet extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheetV2) 
{
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
      height: "auto",
      submitOnChange: false,    // IMPORTANT
      submitOnClose: false,     // IMPORTANT
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "stats" }]
    });
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    
    context.actor = this.actor;
    context.system = this.actor.system;
    context.img = this.actor.img;
    
    // context.system.hp ??= { value: 10, total: 10 };

    // context.system.hpPercent =
    //   context.system.hp.total > 0
    //     ? Math.round((context.system.hp.value / context.system.hp.total) * 100)
    //     : 0;
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
      // const roll = new Roll("1d100");
      const roll = new Roll(
        "1d100",
        {},
        {
          flavor: `${dataset.key.toUpperCase()} Check`,
          rollMode: game.settings.get("core", "rollMode")
        }
      );

      const dice = roll.dice[0];
      const attributeKey = dataset.key;
      const attributeLabel = game.i18n.localize(`PnS2.${attributeKey.toUpperCase()}`);

      const stat = this.actor.system[attributeKey];
      const value = Number(stat.value);
      const modifier = Number(stat.modifier);
      const total = Number(stat.total);

      const isCriticalSuccess = roll.total <= 5;
      const isCriticalFail = roll.total >= 96;
      const isSuccess = roll.total <= total;
      
      
      dice.options.flavor = `
        ${dataset.key.toUpperCase()}
        ${value} (value) + ${modifier} (modifier) = ${total}
      `;

      /* ✅ Correct async evaluation */
      await roll.evaluate();

      /* ---------- RESULT LABEL ---------- */
      let resultString;
      if (isCriticalSuccess) resultString = game.i18n.localize("PnS2.CRITICALSUCCESS");
      else if (isCriticalFail) resultString = game.i18n.localize("PnS2.CRITICALFAIL");
      else if (isSuccess) resultString = game.i18n.localize("PnS2.SUCCESS");
      else resultString = game.i18n.localize("PnS2.FAIL");

      /* ---------- STAT BREAKDOWN ---------- */
      const breakdown = `
        <div class="pns2-roll-breakdown">
          <strong>${attributeLabel}</strong><br/>
          ${value} (value) + ${modifier} (modifier) = <strong>${total}</strong>
        </div>
      `;

      /* ---------- ROLL HTML (CLICKABLE) ---------- */
      const rollHtml = await roll.render();

      const content = `
        ${rollHtml}
        ${breakdown}
        <p><strong>${resultString}</strong></p>
      `;

      ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        content,
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
