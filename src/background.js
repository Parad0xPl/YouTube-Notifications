//Init

chrome.browserAction.setBadgeText({text: ""});

//Funkcja odejmująca dwie tablice wzgędlem indexu
function arr_diff (a1, a2) {
    var a = {}, diff = [], at2 = {}, at1 = {};
    a1.forEach(function(element, index){
        at1[element.id] = element;
    });
    a2.forEach(function(element, index){
        at2[element.id] = element;
    });
    $.each(at1, function(index, element) {
        a[index] = true;
    });
    $.each(at2, function(index, element){
        if(a[index]){
            delete a[index];
        }
    });
    for (var k in a) {
        diff.push(at1[k]);
    }
    return diff;
};


//Obkiet pod ogarnianie intervału
var interval = new Object;
interval.container = 0;//Kontener pod warotść setInterval
interval.func = null;//Zmienna pod trzymanie funckji do intervału
interval.time = 30 * 1000;//Domyślny czas intervału
interval.restart = function () {//Funckja do restartowania interwału
    console.log("Interval (RE)start");
    if (this.func == null || this.time <= 10*1000) {
        return -1;
    }
    if (this.container != 0) {
        clearInterval(this.container);
    }
    this.container = setInterval(function () { interval.func(); }, this.time);
    interval.func();
}

var flag = 1;//Flaga dla testu logowania
var maxPerYoutuber = 25;//Ograniczenie do zapytania do API
var ytControler = new Object;
var dataContener = new Object;
var ActualData = {videos:[]};//Obiekt pod ostatnio zgarnięte wideo

function makeid(n)//Generator losowego id o długości n
{
    if(n==null || n=="")
      n = 5;
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";//Możliwe znaki

    for( var i=0; i < n; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

var test = function(arr){//Dostawia testowe wideo do tablicy arr
  var tempVideo = {};
  tempVideo.title = "Testowe";
  tempVideo.publishedAt = new Date();
  tempVideo.id = makeid();
  tempVideo.author = "Testowy Kanał";
  tempVideo.authorID = makeid();
  tempVideo.image = "";
  tempVideo.description = "Testy";
  tempVideo.publishedAtValue = tempVideo.publishedAt.valueOf();
  arr.videos.push(tempVideo);
  return 0;
}

var debug = false; //Nieużywana flaga pod debugowanie

ytControler.update = function () {//Funckja pod updatowanie
    var time = new Date();//Aktualny czas
    console.count("Start Updating");//Komunikat do debugu
    //dataContener.channels = new Array;
    dataContener.videos = new Array;//Obiekt dla aktualnie ściągancyh wideo
    var iGlobal = 0, vart;//Globalne wartości:
      //vart pod wykrywanie czy skończono funkcje asynchroniczne
      //iGlobal - iterator globalny. Po zakończeniu zapytania zwiękoszny o jeden
    //Zapytanie po liste subksrypcji aktualnie zalogowanej osoby
    $.get("https://www.youtube.com/subscription_manager", function (data, status) {
        if (status !== "success") {
            //Jeżeli coś poszło nie tak
            console.log("CONNECTION PROBLEM");
            return 0;
        };
        //Test czy zalogowany
        var asLog = /https:\/\/accounts.google.com\/ServiceLoginAuth/g;
        if (asLog.test(data) && flag) {
            console.log("Niezalogowany");
            chrome.notifications.create(
                            options = {
                                type: "basic",
                                iconUrl: "./icons/icon128.png",
                                title: "Zaloguj się",
                                message: "By otrzymywać powiadomienia o najnowszych filmach zaloguj się do swojego konta Google na stronie youtube.com"
                            });
            flag = 0;
        }
        if (!asLog.test(data))
            flag = 1;
        var res = data.match(/<a href=\"\/channel\/[A-Za-z0-9\-_]{24}/g);//wychwytywanie subskrypcji użytkownika
        res.shift();//wyrzucenie pierwszej wartości. Potrzbne nie pamiętam czemu
        for (i in res) {
            vart = res.length;
            var temp = res[i].match(/[A-Za-z0-9\-_]{24}/g);//Wyciągnięcie ip
            //Url pod zapytanie o dane kanału
            var url = "https://www.googleapis.com/youtube/v3/channels?part=contentDetails,snippet&id=" + temp + "&key=AIzaSyBJJU7gu3XSExlqX1N_SHm08S6HBVwbqfo";
            //Funkcja pod trwanienie danych z Api
            var toGet = function (arg1) {
                return function (data, status) {
                    if (status !== "success") {
                        console.log("CONNECTION PROBLEM");
                        return 0;
                    };
                    var tempChannel = new Object;
                    var obj = data.items[0];//wyciąganie danych
                    tempChannel.title = obj.snippet.title;//Tytuł kanału
                    var uploadsPlaylist = obj.contentDetails.relatedPlaylists.uploads;//Playlista "Wszystkie wysłane"
                    //Url do zapytania o maxPerYoutuber filmów z listy
                    var url2 = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=" + maxPerYoutuber + "&playlistId=" + uploadsPlaylist + "&key=AIzaSyBJJU7gu3XSExlqX1N_SHm08S6HBVwbqfo";
                    //Zapytanie
                    $.get(url2, function (data, status) {
                        if (status !== "success") {
                            console.log("CONNECTION PROBLEM");
                            return 0;
                        };
                        var obj2 = data;
                        var x;
                        //Dopisywanie wideo do listy
                        for (x = 0; x < obj2.items.length; x++) {
                            if (status !== "success") return 0;
                            var tempVideo = new Object;
                            tempVideo.title = obj2.items[x].snippet.title;
                            tempVideo.publishedAt = new Date(obj2.items[x].snippet.publishedAt);
                            tempVideo.id = obj2.items[x].snippet.resourceId.videoId;
                            tempVideo.author = tempChannel.title;
                            tempVideo.authorID = arg1;
                            tempVideo.image = obj2.items[x].snippet.thumbnails;
                            tempVideo.description = obj2.items[x].snippet.description;
                            if (tempVideo.publishedAt.valueOf() >= new Date().valueOf() - (2 * 7 * 24 * 60 * 60 * 1000)) {
                                tempVideo.publishedAtValue = tempVideo.publishedAt.valueOf();
                                dataContener.videos.push(tempVideo);
                            }
                        }
                        iGlobal++;//Zebrano dane, zwiększono licznik
                    });
                    //Ty była lista kanałów. Jako nie używałem to zakomentowałem
                    //dataContener.channels.push(tempChannel);

                };
            }

            $.get(url, toGet(new String(temp)));//Zapytanie o kanał
        };

    });
    var cont = setInterval(function () {
        //Sprawdź czy skończył zbierać dane
        if (iGlobal == vart || new Date().valueOf() - time.valueOf() > interval.time) {
            clearInterval(cont);//Jeżeli tak skońćż testy
            if (new Date().valueOf() - time.valueOf() > interval.time) {
                //Timeout
                console.debug("Cancel " + (new Date().valueOf() - time.valueOf()) / 1000);
                return 0;
            }
            //Sortowanie najpierw po czasie
            //Potem po tytule(czegoś)
            //Był bug, ze wrzucali planowaną publikacje i wtyczka zamieniała kolejność co bugowałe stary stystem wykrywania
            dataContener.videos.sort(compare2);
            dataContener.videos.sort(compare);
            if (ActualData.videos.length > 0 && dataContener.videos.length > 0) {
                if(debug)//flaga dla testów
                  test(dataContener);//Dostaw testowe wideo
                var videos = arr_diff(dataContener.videos, ActualData.videos);//Różnica
                if(videos.length > 0){//jest cokolwiek?
                  //Dopisanie ilości do Badge'a
                  chrome.browserAction.getBadgeText({}, function(text){
                    if(text == null)
                      text = "";
                    chrome.browserAction.setBadgeText({text: String(Number(text) + videos.length)});
                  });
                }
                //Dla każdego filmu wyrzuć powiadomienie
                for (n in videos) {
                    console.log("%o " + videos[n].publishedAtValue - new Date().valueOf() + " " + new Date().valueOf() + " " + interval.time * 1.5, videos[n]);
                    if (videos[n].publishedAtValue - new Date().valueOf() < interval.time * 1.5)
                        chrome.notifications.create(
                            null, options = {
                                type: "basic",
                                iconUrl: "./icons/icon128.png",
                                title: videos[n].title,
                                message: videos[n].description
                            }, null);
                }
            }
            //Wyczyść dane i zapisz akutalne
            ActualData = null;
            ActualData = Object.assign({}, dataContener);//Struktura tworząca nowy obkiet
            delete dataContener;//Usuń dane z wykonania
            console.count("End Updating");//Koniec Updatu
        }
    }, 150);
}
function compare(a,b){//Sortowanie po czasie
    if(b.publishedAt.valueOf() != a.publishedAt.valueOf()){
        return b.publishedAt.valueOf() - a.publishedAt.valueOf();
    } else {
        return 1;
    }
}
function compare2(a,b){//Sortowanie po tytule
    if(a.title < b.title) return -1;
    if(a.title > b.title) return 1;
    return 0;
}
interval.func = function () {//Ustawienie funkcjji
    ytControler.update();
}
interval.time = 1000*15;//Nowy czas do debugowania
interval.restart();//Odpalenie interwału
//Listener pod zapytania z popup'a
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.ask == "list") {
        chrome.browserAction.setBadgeText({text: ""});//Wyzeruj badge
        sendResponse(ActualData.videos);//Wyślij listę video
    }
});
