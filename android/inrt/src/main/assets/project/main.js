auto();
if (engines.all().length > 1) {
    toastLog("脚本引擎：发现多个脚本同时运行，即将杀死所有脚本，请重新运行本脚本！");
    console.hide();
    engines.stopAll();
}


var isQuit = false;
// var w = floaty.rawWindow(
//     <frame gravity="center">
//         <button id="quit" gravity="center" w="*" h="auto" text="停止"/>
//     </frame>
// );
// w.setPosition(5, device.height * 0.35)
// w.exitOnClose();
// w.quit.click(function(){
//     toastLog("停止");
//     console.hide();
//     exit();
// });

device.wakeUp();
device.keepScreenOn();



var commentMessage = dialogs.input("请输入私信内容,请保留引号", '"万事如意"');
toastLog('私信内容：' + commentMessage);

console.show();
toastLog("打开抖音短视频");
app.launchApp("抖音短视频");
sleep(3000)
toastLog("START");

var videoIndex = 0;
while (true) {
    sleep(random(3000, 3000));

    if (random() > 0.7) {
        continue;
    }

    nextVideo();

    // if (getCommentsSize() < 5) {
    //     toastLog('评论少，跳过！');
    //     continue;
    // }

    if (!openComment()) {
        toastLog('打开评论失败，切换下一个视频！');
        continue;
    }

    sleep(1000);

    if (!openPrivateLetter(0)) {
        toastLog('打开私信失败！');
        closeComment();
        continue;
    }

    sleep(1000);

    if (!sendMsg(commentMessage)) {
        toastLog('发送私信失败');
        closeComment();
        continue;
    }

    sleep(3000);

    if (!closeComment()) {
        continue;
    }
}


function nextVideo() {
    return swipe(device.width / 2, device.height * 0.8, device.width / 2, device.height * 0.4, 300);
}

function getCommentsSize() {
    var a = className("android.widget.LinearLayout").depth(6).clickable(true).descStartsWith("评论").find();
    var c = a.size() > 2 ? a.get(1).desc() : a.get(0).desc();
    if (c.indexOf('w') > -1) {
        return c.replace(/[^0-9]/ig, '') * 1000;
    }
    return c.replace(/[^0-9]/ig, '') * 1;
}

function openComment() {
    var a = className("android.widget.LinearLayout").depth(6).clickable(true).descStartsWith("评论").find();
    if (a.size() > 2) {
        return a.get(1).click();
    } else {
        return a.get(0).click();
    }
}

function closeComment() {
    var a = className("android.widget.ImageView").depth(2).clickable(true).find();
    if (a && a.size() > 2 && a.get(2).click()) {
        return true;
    } else {
        back();
        sleep(2100);
        return back();
    }
}

function openPrivateLetter(commentIndex) {
    var comments = className("android.support.v7.widget.RecyclerView").find().find(className("android.widget.FrameLayout").depth(3).clickable(true));
    if (comments.size() <= commentIndex) {
        toastLog('当前视频无评论');
        return false;
    }

    toastLog('私信 ' + (videoIndex++) + " : " + comments.get(commentIndex).find(className("android.widget.TextView")).get(0).text())
    if (!comments.get(commentIndex).longClick()) {
        toastLog('私信长按失败');
        return false;
    }
    sleep(1000);
    return text('私信回复').findOne(1000).click();;
}

function sendMsg(msg) {
    if (!setText(msg)) {
        toastLog('设置回复内容失败！');
        return false;
    }
    text('取消').findOne(1000).click();;
    return true;
}