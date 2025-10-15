(function () {
  'use strict';

  const $ = window.jQuery;

  function createSettingsPanel() {
    const panel = $('<div/>')
      .attr('id', 'smartschool-settings-panel')
      .addClass('settings-panel')
      .css({
        padding: '10px',
        marginTop: '10px',
        textAlign: 'left',
      });

    const title = $('<h3/>')
      .text('⚙️ Smartschool instellingen')
      .css({ marginBottom: '8px', fontSize: '16px' });

    const themeToggle = $('<label/>')
      .css({ display: 'block', margin: '6px 0' })
      .html(`<input type="checkbox" id="darkThemeToggle"> Donker thema inschakelen`);

    const predictionToggle = $('<label/>')
      .css({ display: 'block', margin: '6px 0' })
      .html(`<input type="checkbox" id="gradePredictToggle"> Toon puntvoorspelling`);

    const saveBtn = $('<button/>')
      .text('Opslaan')
      .addClass('smscButton')
      .css({ marginTop: '8px' })
      .click(() => {
        const settings = {
          darkTheme: $('#darkThemeToggle').is(':checked'),
          gradePredict: $('#gradePredictToggle').is(':checked')
        };
        smartschoolSettings.set('user_settings', settings);
        alert('Instellingen opgeslagen ✅');
      });

    const saved = smartschoolSettings.get('user_settings', {});
    if (saved.darkTheme) $('#darkThemeToggle').prop('checked', true);
    if (saved.gradePredict) $('#gradePredictToggle').prop('checked', true);

    panel.append(title, themeToggle, predictionToggle, saveBtn);
    return panel;
  }

  smartschool_addElement({
    parentSelector: '#leftcontainer', // <-- changed from #homepage__block--google
    elementId: 'smartschool-settings',
    content: createSettingsPanel(),
    insertType: 'append'
  });

})();
