(async () => {
  const $ = window.jQuery;

  const iframe = $('<iframe>', {
    src: 'https://raw.githubusercontent.com/andreasthuis/Smartschool_edit/refs/heads/main/html/settingsElement.html',
    css: {
      width: '100%',
      height: '700px',
      border: 'none',
      display: 'block'
    },
    id: 'smartschool-settings'
  });

  smartschool_addElement({
    parentSelector: '#leftcontainer',
    elementId: 'smartschool-settings',
    content: iframe.prop('outerHTML'),
    insertType: 'append'
  });
})();
