function json2table(json, classes) {
  var cols = Object.keys(json[0]);

  var headerRow = "";
  var bodyRows = "";

  classes = classes || "";

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  cols.map(function (col) {
    headerRow += "<th>" + capitalizeFirstLetter(col) + "</th>";
  });

  json.map(function (row) {
    bodyRows += "<tr>";

    cols.map(function (colName) {
      if (row[colName] !== undefined && row[colName].includes(".pdf")) {
        let splitArr = row[colName].split("/");
        let fileName = splitArr[splitArr.length - 1];
        
        bodyRows += "<td>" + '<a href="' + row[colName] + '">' + fileName + "</a>" + "</td>";
      } else {
        bodyRows += "<td>" + row[colName] + "</td>";
      }
    });

    bodyRows += "</tr>";
  });

  return (
    '<table class="' +
    classes +
    '"><thead><tr>' +
    headerRow +
    "</tr></thead><tbody>" +
    bodyRows +
    "</tbody></table>"
  );
}

function wrapInHtmlTemplate(data) {
  return `
  <html>
    <head>
      <title> Generated Webpage </title>
    </head>
    <body>
      ${data}
    </body>
  </html>
  `;
}

function delay(time) {
  return new Promise(function(resolve) { 
      setTimeout(resolve, time)
  });
}

module.exports.json2table = json2table;
module.exports.wrapInHtmlTemplate = wrapInHtmlTemplate;
module.exports.delay = delay;
