var ytControler = new Object;
var dataContener = new Object;
var maxPerYoutuber = 5;
dataContener.channels = new Array;
dataContener.videos = new Array;

/*$('body').on('click', 'a', function(){
    console.log(this);
    chrome.tabs.create({url: $(this).attr('href')});
    return false;
});*/

/*$("a").click(function () {
    chrome.tabs.create({ url: $(this).attr('href') });
    console.log("test");
    return false;
});*/

ytControler.update = function () {
    $.get("https://www.youtube.com/subscription_manager", function (data, status) {
        var res = data.match(/<a href=\"\/channel\/[A-Za-z0-9\-_]{24}/g);
        res.shift();
        /*res.each(function () {
        $("#listOfChannels").append("<td>" +this + "</td>");
        })*/
        var i;
        for (i in res) {
            var temp = res[i].match(/[A-Za-z0-9\-_]{24}/g);
            var url = "https://www.googleapis.com/youtube/v3/channels?part=contentDetails,snippet&id=" + temp + "&key=AIzaSyBJJU7gu3XSExlqX1N_SHm08S6HBVwbqfo";
            //console.log(url);
            $.get(url, function (data, status) {
                var tempChannel = new Object;
                var obj = data.items[0];
                tempChannel.title = obj.snippet.title;
                tempChannel.videos = new Array;
                var uploadsPlaylist = obj.contentDetails.relatedPlaylists.uploads;
                var url2 = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=" + maxPerYoutuber + "&playlistId=" + uploadsPlaylist + "&key=AIzaSyBJJU7gu3XSExlqX1N_SHm08S6HBVwbqfo";
                $.get(url2, function (data, status) {
                    var obj2 = data;
                    //console.log(obj2.items.length);
                    var x;
                    for (x = 0; x < obj2.items.length; x++) {
                        //console.log(x);
                        var tempVideo = new Object;
                        tempVideo.title = obj2.items[x].snippet.title;
                        tempVideo.publishedAt = new Date(obj2.items[x].snippet.publishedAt);
                        tempVideo.id = obj2.items[x].snippet.resourceId.videoId;
                        tempVideo.autor = tempChannel.title;
                        tempChannel.videos.push(tempVideo);
                    }

                });
                //console.log("Title:%s, Play:%s", title, uploadsPlaylist);
                dataContener.channels.push(tempChannel);
            })
        };

    });
}
ytControler.update();
function compare(a,b){
    return b.publishedAt.valueOf() - a.publishedAt.valueOf();
}
setTimeout(function () {
    var x;
    for (x in dataContener.channels) {
        //console.log("%s %s", x, y);
        var y;
        for (y in dataContener.channels[x].videos) {
            if (dataContener.channels[x].videos[y].publishedAt.valueOf() >= new Date().valueOf() - (2 * 7 * 24 * 60 * 60 * 1000)) {
                dataContener.videos.push(dataContener.channels[x].videos[y]);
            }
            //console.log("%o", dataContener.channels[x].videos[y].publishedAt.valueOf());
        }
    }
    var y;
    console.log(dataContener);
    /*for (y = 1; y < dataContener.videos.length; ) {
    if (dataContener.videos[y].publishedAt.valueOf() - dataContener.videos[y - 1].publishedAt.valueOf()) {
    var temp = dataContener.videos[y];
    console.log(y);
    dataContener.videos[y] = dataContener.videos[y - 1];
    dataContener.videos[y - 1] = temp;
    y--;
    if (y < 1) y = 1;
    } else {
    y++;
    }
    }*/
    dataContener.videos.sort(compare);
    //console.log(dataContener);
    $(dataContener.videos).each(function () {
        var temp = $('<tr><td><a target="_blank" href="http://youtube.com/watch?v='+this.id +'">'+this.title.substr(0, 45)+'</a></td></tr>');
        $("#listOfChannels").append(temp);
    });
}, 3000);

