function wrapInTable(rowsHtml) {
  var html =
    "<table class='results'>\n" +
    "<tbody>\n" +
    "  <tr><th colspan='4'>API keys Expiry Report</th></tr>\n";
  html +=
    "  <tr>\n" +
    "    <th align='left'>email</th>\n" +
    "    <th align='left'>apikey</th>\n" +
    "    <th align='left'>expiry</th>\n" +
    "    <th align='left'>status</th>\n" +
    "  </tr>\n";
  html += rowsHtml;
  html += "\n</tbody>\n</table>\n";
  return html;
}

function humanizeExpiry(status, timespan) {
  if (status == "expires-soon") {
    return `expires within ${timespan}`;
  }
  if (status == "expires-soon-2x") {
    const parts = timespan.split(" ");
    const number = Number(parts[0]) * 2;
    return `expires within ${number} ${parts[1]}`;
  }
  return status;
}

function handleOneDev(event) {
  const timespan = event.getParameter("friendlyTimespan");
  return (blob) => {
    var devEmail = Object.keys(blob)[0];

    // blob[devEmail] is an array of appinfos, each one has a single key
    return blob[devEmail]
      .map(function (appBlob) {
        var appName = Object.keys(appBlob)[0];
        return appBlob[appName]
          .map(function (appCred) {
            var status = appCred.reason ? appCred.reason : "none";
            var row =
              "  <tr>\n" +
              "    <td>" +
              devEmail +
              "</td>" +
              " <td>" +
              appCred.key +
              "</td>" +
              " <td>" +
              appCred.expiryDate +
              "</td>" +
              " <td class='" +
              status +
              "'>" +
              humanizeExpiry(appCred.reason, timespan) +
              "</td>\n" +
              "  </tr>";
            return row;
          })
          .join("\n");
      })
      .join("\n");
  };
}

function executeScript(event) {
  var alertedCreds = event.getParameter("alertedCreds");
  var html = alertedCreds.map(handleOneDev(event)).join("\n");
  event.setParameter("formattedEmailTable", wrapInTable(html));
}
