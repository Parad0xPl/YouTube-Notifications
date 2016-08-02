//Definition of Interval Object
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

var interval = new Object;
interval.container = 0;
interval.func = null;
interval.time = 30 * 1000;
interval.restart = function () {
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

var flag = 1;
var maxPerYoutuber = 25;
var ytControler = new Object;
var dataContener = new Object;
var ActualData = {videos:[]};

function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

var test = function(arr){
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

var debug = false;

ytControler.update = function () {
    var time = new Date();
    console.count("Start Updating");
    //dataContener.channels = new Array;
    dataContener.videos = new Array;
    var iGlobal = 0, vart;
    $.get("https://www.youtube.com/subscription_manager", function (data, status) {
        if (status !== "success") {
            console.log("CONNECTION PROBLEM");
            return 0;
        };
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
        var res = data.match(/<a href=\"\/channel\/[A-Za-z0-9\-_]{24}/g);
        res.shift();
        for (i in res) {
            vart = res.length;
            var temp = res[i].match(/[A-Za-z0-9\-_]{24}/g);
            var url = "https://www.googleapis.com/youtube/v3/channels?part=contentDetails,snippet&id=" + temp + "&key=AIzaSyBJJU7gu3XSExlqX1N_SHm08S6HBVwbqfo";

            var toGet = function (arg1) {
                return function (data, status) {
                    if (status !== "success") {
                        console.log("CONNECTION PROBLEM");
                        return 0;
                    };
                    var tempChannel = new Object;
                    var obj = data.items[0];
                    tempChannel.title = obj.snippet.title;
                    var uploadsPlaylist = obj.contentDetails.relatedPlaylists.uploads;
                    var url2 = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=" + maxPerYoutuber + "&playlistId=" + uploadsPlaylist + "&key=AIzaSyBJJU7gu3XSExlqX1N_SHm08S6HBVwbqfo";
                    $.get(url2, function (data, status) {
                        if (status !== "success") {
                            console.log("CONNECTION PROBLEM");
                            return 0;
                        };
                        var obj2 = data;
                        var x;
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
                        iGlobal++;
                    });

                    //dataContener.channels.push(tempChannel);

                };
            }

            $.get(url, toGet(new String(temp)));
        };

    });
    var cont = setInterval(function () {
        if (iGlobal == vart || new Date().valueOf() - time.valueOf() > interval.time) {
            clearInterval(cont);
            if (new Date().valueOf() - time.valueOf() > interval.time) {
                console.debug("Cancel " + (new Date().valueOf() - time.valueOf()) / 1000);
                return 0;
            }
            dataContener.videos.sort(compare2);
            dataContener.videos.sort(compare);
            if (ActualData.videos.length > 0 && dataContener.videos.length > 0) {
                if(debug)
                  test(dataContener);
                var videos = arr_diff(dataContener.videos, ActualData.videos);
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
            ActualData = null;
            ActualData = Object.assign({}, dataContener);
            dataContener = new Object();
            console.count("End Updating");
        }
    }, 150);
}
function compare(a,b){
    if(b.publishedAt.valueOf() != a.publishedAt.valueOf()){
        return b.publishedAt.valueOf() - a.publishedAt.valueOf();
    } else {
        return 1;
    }
}
function compare2(a,b){
    if(a.title < b.title) return -1;
    if(a.title > b.title) return 1;
    return 0;
}
interval.func = function () {
    ytControler.update();
}
interval.time = 1000*15;
interval.restart();
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.ask == "list") {
        sendResponse(ActualData.videos);
    }
});
