function getNeedAlert(soonThreshold) {
  return function (delta) {
    if (delta < 0) return "expired";
    if (delta < soonThreshold) return "expires-soon";
    if (delta < 2 * soonThreshold) return "expires-soon-2x";
    return false;
  };
}

function executeScript(event) {
  var soonThreshold = Number(event.getParameter("soonThresholdMs"));
  if (soonThreshold) {
    event.log("have soonThreshold: " + soonThreshold.toFixed(0));
    var credInfo = event.getParameter("credInfo"); // is json
    var needAlert = getNeedAlert(soonThreshold);
    if (credInfo.hasOwnProperty("expiresAt")) {
      var expiryMs = Number(credInfo.expiresAt);
      if (expiryMs != -1) {
        // convert
        var currentTimeMs = new Date().valueOf();
        var key = credInfo.consumerKey;
        var delta = expiryMs - currentTimeMs;
        var reason = needAlert(delta);
        if (reason) {
          event.log("reason: " + reason);
          var payload = {
            key: credInfo.consumerKey,
            expiry: expiryMs,
            expiryDate: new Date(expiryMs).toISOString(),
            delta: delta,
            reason: reason,
          };
          event.log("payload: " + JSON.stringify(payload));
          event.log("log A");
          event.setParameter("flagged", payload);
          event.log("log B");
        } else {
          event.log("no reason.");
        }
      }
    }
    event.log("done checking");
  } else {
    event.log("no soonThreshold");
  }
}
