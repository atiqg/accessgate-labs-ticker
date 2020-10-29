let currency_ticker;

function get_currencies(){
    let url = 'https://accessgate-test.netlify.app/.netlify/functions/currencies';
    fetch(url) 
    .then(response => response.text())
    .then(result => {
        result = JSON.stringify(result);
        console.log(result);
        result.forEach(function(entry) {
            console.log(entry.fullName);
        });
    })
    .catch(() => console.log("Can’t access " + url + " response. Blocked by browser?"));
}

function open_ticker(){

    //initialize websocket
    const url = 'wss://api.crosstower.com/api/2/ws';
    currency_ticker = new WebSocket(url)
    currency_ticker.onopen = () => {
        console.log('Websocket is open');
        currency_ticker.send(JSON.stringify({
            "method": "subscribeTicker",
            "params": {
              "symbol": "ETHBTC"
            },
            "id": 123
          }));
    }

    currency_ticker.onmessage = (e) => {
        let message = JSON.parse(e.data);
        console.log(message);
    }
    
    currency_ticker.onerror = (error) => {
        console.log(`WebSocket error: ${error}`);
        currency_ticker.close();
    }

    currency_ticker.onclose = function () {
        console.log('websocket is closed');
    };
}



function close_ticker(){
    if(currency_ticker){
        currency_ticker.close();
    }
}

window.onbeforeunload = function() {
    if(currency_ticker){
        currency_ticker.close();
    }
};


function httpGetAsync(url, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", url, true);
    xmlHttp.send(null);
}