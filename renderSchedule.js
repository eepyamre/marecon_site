const fs = require('node:fs');
const { google } = require("googleapis");

const shedule = {
  day1: [
    
  ],
  day2: [
    
  ],
  day3: [
    
  ],
}
const getSubstringBetween = (str, start, end) => {
  let startIndex = str.indexOf(start);
  if (startIndex === -1) return "";
  startIndex += start.length;

  let endIndex = str.indexOf(end, startIndex);
  if (endIndex === -1) return "";

  return str.substring(startIndex, endIndex);
}

const minutesToHHMM = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return (hours ? hours : '') + (hours ? " hour" + (hours > 1 ? 's ' : ' ') : '') + (remainingMinutes ? remainingMinutes : '' ) + (remainingMinutes ? ' min' : '');
}

const writeHTML = () => {
  try {
    const data = fs.readFileSync('./index.html', 'utf8');
    const prevContent = getSubstringBetween(data.toString(), '<!-- Shedule Start -->', '<!-- Shedule End -->');
    const days = ['16 feb', '17 feb', '18 feb']
    let content = '<div class="row">'
    days.forEach((day, idx) => {
      content += `<div class="col"><p>${day}</p>`;
      (shedule['day'+(idx+1)]).forEach(item => {
        content += `<div class="card">
          <p class="card__title">${item.title}</p>
          <p>${item.from} | Duration: ${minutesToHHMM(item.duration)}</p>
          <p class="card__channels">Channels: `
        
        item.ch.forEach(ch => {
          content += `<a target="_blank" href="${ch}">${ch.replace('https://cytu.be', '')}</a>`
        })  
        content += `</p><p class="card__descirpion">${item.description}</p></div>`
      })
      content += '</div>'
    })
    content += '</div>'
    try {
      fs.writeFileSync('./index.html', data.replace(prevContent, content));
    } catch (err) {
      console.error(err);
    }
  } catch (err) {
    console.error(err);
  }
}

const getSchedule = async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });

  const client = await auth.getClient();
  const googleSheets = google.sheets({ version: "v4", auth: client });

  const spreadsheetId = "1vBs2XKjHjuoGv8OU_EU_JPCGKPvDKf2RhJ6L4ErGyMA";
  const sheet = await googleSheets.spreadsheets.get({spreadsheetId: spreadsheetId, includeGridData: true})
  const cells = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: "Sheet1!A6:E224",
  });
  const rawCells = sheet.data.sheets[0].data[0].rowData;

  const channels = ['https://cytu.be/r/marecon', 'https://cytu.be/r/marecon2-comfys-cottage', 'https://cytu.be/r/marecon3-smileys-studio']
  const merges = sheet.data.sheets[0].merges;
  const rows = cells.data.values;
  
  let day = 1
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowIdx = i + 5
    if(row[0] === 'Saturday'){
      day = 2
      continue;
    }
    if(row[0] === 'Sunday'){
      day = 3
      continue;
    }
    if(row.length > 1){
      for (let j = 2; j < row.length; j++) {
        if(!row[j]) continue;
        const obj = {
          title: row[j],
          from: row[0] + ' GMT-0500',
          duration: 15,
          description: '',
          ch: [channels[j-2]],
        }
        obj.description = rawCells[rowIdx].values[j].note || ''
        const merged = merges.find(item => item.startRowIndex === rowIdx && item.startColumnIndex === j)
        if(merged){
          obj.duration = 15 * (merged.endRowIndex - merged.startRowIndex)
          for (let n = 1; n < merged.endColumnIndex - merged.startColumnIndex; n++) {
            obj.ch.push(channels[n])
          }
        }
        (shedule['day'+day]).push(obj)
      }
    } 
  }
  writeHTML()
}

getSchedule()
setInterval(() => {
  console.log('update');
  shedule.day1 = []
  shedule.day2 = []
  shedule.day3 = []
  getSchedule()
}, 1000*15)