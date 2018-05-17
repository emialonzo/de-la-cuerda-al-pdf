// import fetch from 'node-fetch';
const fetch = require('node-fetch');
var fs = require('fs')
var PDFDocument = require('pdfkit')
var windows1252 = require('windows-1252');
var encoding = require("encoding");

  var doc = new PDFDocument()
  doc.pipe(fs.createWriteStream('output.pdf'))
  doc.fontSize(25)
  .text('Librito de acordes! :)', 120, 100)

  // http://acordes.lacuerda.net/TXT/zambayonny/120_monedas.txt
  var listaAcordes = [
    'http://acordes.lacuerda.net/TXT/zambayonny/120_monedas.txt',
    'http://acordes.lacuerda.net/TXT/zambayonny/yo_los_considero_mis_hermanos.txt',
'http://acordes.lacuerda.net/TXT/4_pesos_de_propina/mi_revolucion.txt',
'http://acordes.lacuerda.net/TXT/4_pesos_de_propina/esa_mezcla_de_placer_y_dolor.txt'
  ]

  var count = listaAcordes.length;

  listaAcordes.map(url=>generatePdfPage(url));

function generatePdfPage(url){
  fetch(url)
    .then(res => res.buffer())
    .then(res => encoding.convert(res, "UTF-8", "CP1252"))
    .then(res => res.toString())
    .then(body =>{

  // body = encoding.convert(body, "UTF-8", "CP1252");

  // body = procesar2(body)
  procesado = procesar(body)

  // Add another page
  doc.addPage()
  .font('Courier')
  .fontSize(15)
  .text(`${procesado.cancion} de ${procesado.artista}`, 30, 20)
   .moveDown(0.5)
  .fontSize(10)
  .text(procesado.letra)

  // Finalize PDF file
  count = count -1
  if(count===0){
    doc.end()
  }
  else{
    console.log(`Se proceso ${url}, quedan ${count} `)
  }

})
}


function removeLacuerda2(text){
  // let regexRemove = /[=]+ lacuerda.net [=]+[^]+[=]+ lacuerda.net [=]/gm;
  let regexRemove = /[=]{27} lacuerda.net [=]+[^]+[=]+ lacuerda.net [=]{28}/gm;
  return text.replace(regexRemove, '')
}

// =====================================================================
function procesar2(text){
  let regexRemove = /[=]{69}(?:.|[\r\n])*(?:ARTISTA:\s*([^|]*))(?:.|[\r\n])*(?:CANCION:\s*([^|]*))(?:.|[\r\n])*[=]{69}/gm;
  //var hallado = text.match(regexRemove);
  var hallado = regexRemove.exec(text);
  console.log(`${hallado[2].trim()} de ${hallado[1].trim()} `)
  // return text.replace(regexRemove, '')
  return `${hallado[2].trim()} de ${hallado[1].trim()}\n${removeLacuerda2(text.replace(regexRemove, ''))}`
}

function procesar(text){
  let regexRemove = /[=]{69}(?:.|[\r\n])*(?:ARTISTA:\s*([^|]*))(?:.|[\r\n])*(?:CANCION:\s*([^|]*))(?:.|[\r\n])*[=]{69}/gm;
  //var hallado = text.match(regexRemove);
  var hallado = regexRemove.exec(text);
  console.log(`${hallado[2].trim()} de ${hallado[1].trim()} `)
  // return text.replace(regexRemove, '')
  return {
    cancion:hallado[2].trim(),
    artista:hallado[1].trim(),
    letra:removeLacuerda2(text.replace(regexRemove, ''))
  }
}
