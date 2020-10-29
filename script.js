let currency_ticker;

function get_currencies(){
    let testObj = {"US Dollar":"USD","Bitcoin Cash":"BCH","Ripple":"XRP","Chainlink":"LINK","Litecoin":"LTC","USD Coin":"USDC","Ethereum":"ETH","Bitcoin":"BTC","Zcash":"ZEC","Stellar":"XLM","Basic Attention Token":"BAT"};

    let url = 'https://accessgate-test.netlify.app/.netlify/functions/symbols';
    fetch(url) 
    .then(response => response.text())
    .then(result => {
        result = JSON.parse(result);
        for (var key in result) {
            console.log(key + ":" + result[key]);
        }
    })
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
              "symbol": "BTCUSD"
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