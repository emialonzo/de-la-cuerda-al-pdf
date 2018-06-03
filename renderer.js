var {ipcRenderer, remote} = require('electron');

function generateDocument(urls){
  ipcRenderer.send('create-document', urls);
}


// Listen for async-reply message from main process
ipcRenderer.on('enviar-pdf', (event, arg) => {
  console.log('----------------');
    console.log('Mostrar link de descarga de pdf')
    console.log('----------------');
});
