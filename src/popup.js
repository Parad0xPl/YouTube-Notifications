function textFormation(number, text){
    if(number < 2){
        return text + "e";
    } else if (number < 5) {
        return text + "y";
    } else {
        return text;
    }
}

var actual = new Date()

function getTime(val){;
    var stamp = parseInt(actual.valueOf()) - val;
    //console.log("%d %o", actual.valueOf(), val);
    if((stamp /= 1000) < 60){
        return String(Math.floor(stamp) + " "+textFormation(stamp, "sekund")+" temu");
    } else if((stamp /= 60) < 60) {
        return String(Math.floor(stamp) + " "+textFormation(stamp, "minut")+" temu");

    } else if((stamp /= 60) < 24) {
        return String(Math.floor(stamp) + " "+textFormation(stamp, "godzin")+" temu");

    } else {
        stamp /= 24;
        if(stamp < 2) return String(Math.floor(stamp) + " dzień temu");
        return String(Math.floor(stamp) + " dni temu");
    }
}

var glob, numberOfElements = 25, n = 1;
chrome.runtime.sendMessage({ ask: "list" }, function (obj) {
    glob = obj.videos;
    if(obj.isLogged){
      draw(numberOfElements, glob);
    }else{
      //Jezeli nie zalogowany
    }
});

function draw(number, obj){
    res = obj.slice(0,number);
    if (res[0]) {
        $("#listOfChannels").empty();
        $(res).each(function () {
            var temp2 = $('<td></td>');
            var srcimage = this.image["default"];
            if (srcimage) {
                var image = srcimage.url;
            }
            var temp = $('<div id="container"></div>');
            temp.append($('<div id="miniature"><a target="_blank" title="' + this.title + '" href="http://youtube.com/watch?v=' + this.id + '"><img src="' + image + '"></a></div>'));
            temp.append($('<div id="description"v><a target="_blank" title="' + this.title + '" href="http://youtube.com/watch?v=' + this.id + '">' + this.title.substr(0, 45) + '</a> by <a target="_blank" href="http://youtube.com/channel/' + this.authorID + '">' + this.author + '</a><p>' + getTime(this.publishedAtValue) + '</p></div>'));
            temp2.append(temp);
            //console.log(this);
            $("#listOfChannels").append($('<tr></tr>').append(temp2));
            //            $("#listOfChannels").append(temp);
        });
    }
}

$(document).ready(function () {
    $("#next").click(function () {
        draw(numberOfElements * ++n, glob);
    });
});
