const sharp = require('sharp');
const webp = require('webp-converter');

const inputImagePath = './uploads/imagen.png';
const outputImagePath = './uploads/imagen.webp';

// Paso 1: Carga la imagen
sharp(inputImagePath)
  .toFile(outputImagePath, (err, info) => {
    if (err) {
      console.error('Error al cargar la imagen:', err);
    } else {
      console.log('Imagen cargada con éxito:', info);

      // Paso 2: Convierte la imagen a WebP
      webp.cwebp(inputImagePath, outputImagePath, '-q 80', (status, error) => {
        if (status === '100') {
          console.log('Imagen convertida a WebP con éxito.');
          console.log('Puedes usar el archivo WebP como sticker en WhatsApp.');
        } else {
          console.error('Error al convertir la imagen:', error);
        }
      });
    }
  });


  // {
  //   "messages": [
  //     {
  //       "key": {
  //         "remoteJid": "584244596140@s.whatsapp.net",
  //         "fromMe": false,
  //         "id": "26F85C6CDFCDFF9D71C9A63265073642"
  //       },
  //       "messageTimestamp": 1694709332,
  //       "pushName": "Angel",
  //       "broadcast": false,
  //       "message": {
  //         "imageMessage": {
  //           "url": "https://mmg.whatsapp.net/o1/v/t62.7118-24/f1/m234/up-oil-image-d989cf69-6be5-4c08-bfab-1a7dfbbc3c88?ccb=9-4&oh=01_AdTi-yo8Etpvbf4MfHiinLfyLClM2szNjlXc_yB4-i9s6Q&oe=652A8F1B&_nc_sid=000000&mms3=true",
  //           "mimetype": "image/jpeg",
  //           "caption": "/sticker",
  //           "fileSha256": "kceMJIP2whnTNjuE3PtSo+GI//lI6fVX5G0Ob/6MIxY=",
  //           "fileLength": "3147977",
  //           "height": 1024,
  //           "width": 1024,
  //           "mediaKey": "LkSrV5TleM6g7gDOsoT11wbJ4Od83Bnpdj6Yni4sCBo=",
  //           "fileEncSha256": "GzJ+UyWwAYs/telQoyk2niPS15/oTYcjEd7zYmqvSBI=",
  //           "directPath": "/o1/v/t62.7118-24/f1/m234/up-oil-image-d989cf69-6be5-4c08-bfab-1a7dfbbc3c88?ccb=9-4&oh=01_AdTi-yo8Etpvbf4MfHiinLfyLClM2szNjlXc_yB4-i9s6Q&oe=652A8F1B&_nc_sid=000000",
  //           "mediaKeyTimestamp": "1694617666",
  //           "jpegThumbnail": "/9j/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCAAgACADASIAAhEBAxEB/8QAGAAAAwEBAAAAAAAAAAAAAAAAAAQFBgP/xAAoEAACAQMDAwQCAwAAAAAAAAABAgQAAxEFEiExQYEGEyJhFKFRcZH/xAAXAQADAQAAAAAAAAAAAAAAAAAAAQIE/8QAGxEBAAMBAQEBAAAAAAAAAAAAAQACAxEEElH/2gAMAwEAAhEDEQA/ALPqnV5+iXocmPbW9Fcm3dtkd+xB7HrVuNJtyUJQ8rwynqp/g0TIlqbGexfUMjYP9EHIP+1OFi3LIdyyPkhtjFd4B7/VZPRu4Ip0Zda/Ur5FQ9T9QGPqEbT4UVpEiQcKx4QDPJz3xTDQ46Js3MiuQCvuEBvrk12gWrd1hMKLu2lLfHKLnkeSP1UY+m2tyoc/Y2oHYzJVmsPsHyCnHJHOKz2kRrtw/l3LVl2RQLRJIcEZBBPk1pqWaEhubld0XJYqhxknvV+nG2nPmFLFRGISotyTGb3Ldj3lBCPdO8AHknoMdP1TemWysRGbPzJccnuc9KH05WdSt+8Fxh1Lbtw89PFO0vNhbNW0LWE4T//Z"
  //         },
  //         "messageContextInfo": {
  //           "deviceListMetadata": {
  //             "senderKeyHash": "fH6YIF6CRYaTGg==",
  //             "senderTimestamp": "1694404798",
  //             "recipientKeyHash": "hH9lL72+d0d4Ig==",
  //             "recipientTimestamp": "1694619077"
  //           },
  //           "deviceListMetadataVersion": 2
  //         }
  //       }
  //     }
  //   ],
  //   "type": "notify"
  // }