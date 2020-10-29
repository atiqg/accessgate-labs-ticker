let currency_ticker;

function get_currencies(){
    let testObj = {1: "BTC", 2: "USD", 3: "XRP", 4: "LINK", 5: "LTC", 6: "USDC", 7: "BCH", 8: "ETH", 9: "ZEC", 10: "BAT", 11: "XLM"};

    /**
    let url = 'https://accessgate-test.netlify.app/.netlify/functions/currencies';
    fetch(url) 
    .then(response => response.text())
    .then(result => {
        result = JSON.parse(result);
        for (var key in result) {
            console.log(key + ":" + result[key]);
        }
    })
     */
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