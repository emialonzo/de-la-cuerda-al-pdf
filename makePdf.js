const fetch = require('node-fetch');
const PDFDocument = require('pdfkit')
const blobStream = require('blob-stream')
const encoding = require("encoding");
var fs = require('fs')


var listasPorArtista = {}
var count = 0;
var listaUrls = [];

function convertir(urls, cb){
    listaUrls = urls.trim().split('\n');
    count = listaUrls.length;
    processUrl(cb);
}

function convertirPromise(urls){
    listaUrls = urls.trim().split('\n');
    count = listaUrls.length;
    return new Promise((resolve, reject) => {
        processUrl(resolve);
    })
}

function processUrl(cb){
    console.log(`A procesar urls con funcion:${cb}`)
    listaUrls.map(url => getDocuments(url, cb));
}

function getDocuments(url, cb) {
    return fetch(url)
      .then(res => res.buffer())
      .then(res => encoding.convert(res, "UTF-8", "CP1252"))
      .then(res => res.toString())
      .then(body => {
          count = count - 1

          let procesado = procesar(body)
          console.log(`Procesando ${url} para ${procesado.artista} con coun=${count} funcion:${cb}`)
          procesado.url = url;
          let artista = procesado.artista;
          if(!listasPorArtista[artista]){
            listasPorArtista[artista] = [];
          }
          listasPorArtista[artista].push(procesado);

            if (count === 0) {
                console.log('Hacer documento')
                hacerDocumento(cb);
            }
      }
    ).catch(e=> {
      console.error(e)
      // //FIXME
      // if (count === 0) {
      //     hacerDocumento();
      // }
      }
    )
}

function borrarTextosRepetidos(text) {
    let regexRemove = /[=]{27} lacuerda.net [=]+[^]+[=]+ lacuerda.net [=]{28}/gm;
    return text.replace(regexRemove, '')
  }

function procesar(text) {
    let regexRemove = /[=]{69}(?:.|[\r\n])*(?:ARTISTA:\s*([^|]*))(?:.|[\r\n])*(?:CANCION:\s*([^|]*))(?:.|[\r\n])*[=]{69}/gm;
    var hallado = regexRemove.exec(text);
    return {
      cancion: hallado[2].trim(),
      artista: hallado[1].trim(),
      letra: borrarTextosRepetidos(text.replace(regexRemove, ''))
    }
  }


  function hacerDocumento(cb){
      let fileName = 'output.pdf';
      var doc = new PDFDocument()
        doc.pipe(fs.createWriteStream(fileName))
        doc.fontSize(25)
        .text('Librito de acordes! :)', 120, 100)

        Object.keys(listasPorArtista).forEach(function(key) {
            listasPorArtista[key].map(elm => {
                doc.addPage()
                .font('Courier')
                .fontSize(15)
                .text(`${elm.cancion} de ${elm.artista}`, 30, 20, {
                    link:elm.url
                })
                 .moveDown(0.5)
                .fontSize(10)
                .text(elm.letra, {
                    columns: 2,
                })
            })
        });
        doc.end();
        cb(fileName);
        
  }

  function hacerDocumentoUrl(cb){
    //   let fileName = 'output.pdf';
      var doc = new PDFDocument()
    // doc.pipe(fs.createWriteStream(fileName))
    doc.fontSize(25)
    .text('Librito de acordes! :)', 120, 100)

    Object.keys(listasPorArtista).forEach(function(key) {
        listasPorArtista[key].map(elm => {
            console.log(`Agregando pagina para ${elm.cancion} de ${elm.artista} `);
            doc.addPage()
            .font('Courier')
            .fontSize(15)
            .text(`${elm.cancion} de ${elm.artista}`, 30, 20, {
                link:elm.url
            })
                .moveDown(0.5)
            .fontSize(10)
            .text(elm.letra, {
                columns: 2,
            })
        })
    });
    doc.end();
        
    var stream = doc.pipe(blobStream());        
    stream.on('finish', function() {
        var url =  stream.toBlobURL('application/pdf');
        console.log('en make es ' + url)
        cb(url);
    });
  }



module.exports = {
  getDocuments : getDocuments,
  convertir:convertir,
  convertirPromise:convertirPromise
}
