device.wakeUp();
device.keepScreenOn();

var Config = storages.create('多闪配置');
var SendRecord = storages.create('多闪发送记录');

var msg1 = "你好1" || "你好1";
var msg2 = "你好2" || "你好2";
var msg3 = "你好3" || "你好3";

if (engines.all().length > 1) {
    toastLog("脚本引擎：发现多个脚本同时运行，即将杀死所有脚本，请重新运行本脚本！");
    console.hide();
    engines.stopAll();
}
console.show();
try {
  main();
} catch (error) {
  toastLog(error);
}


function main() {
    goFriemds();
}

function goFriemds() {
    app.launchApp("多闪");
    waitForPackage("my.maya.android");

    var ds = className('android.widget.TextView').text("消息").untilFind();
    if (ds.size() > 1) {
        ds.get(1).click();
    } else {
        ds.get(0).click();
    }

    var tb = className('android.widget.ImageView').depth(10).clickable(true).untilFind()
    if (tb.get(1)) {
        tb.get(1).click();
    } else {
        tb.get(0).click();
    }

    work(0);
}

function work(mb_index) {

    mb_index = mb_index || 0;

    swipe(device.width / 2, device.height * 0.9, device.width / 2, device.height * 0.9 - 200, 500);
    var $members = className('android.widget.RelativeLayout').depth(9).clickable(true).find();
    if ($members.size() == 0) {
        log('...');
        return work(mb_index);
    }

    var $mb = $members[mb_index];

    if (!$mb) {
        toastLog('运行结束');
        return;
    }

    var me_name = $mb.findOne(className('android.widget.TextView')).text();

    if (SendRecord.contains(me_name)) {
        log('已发送跳过：' + me_name);
        swipe(device.width / 2, device.height * 0.9, device.width / 2, device.height * 0.9 - 200, 500);
        return work(mb_index + 1);
    }

    $mb.click();
    text('发消息').findOne(5000).click();

    sleep(600);

    if (sendmsg(me_name)) {
        log(me_name);
        SendRecord.put(me_name, 1);
    }

    sleep(1000);
    back();
    sleep(1000);
    back();
    sleep(1000);
    if (text('发消息').findOne(1000)) {
        back();
        sleep(1000);
    }

    work(mb_index);
}

var emojs = [
    '[微笑]','[色]','[发呆]','[得意]','[害羞]','[呲牙]','[调皮]','[偷笑]','[愉快]','[奋斗]','[悠闲]','[憨笑]','[尬笑]','[做鬼脸]','[可怜]','[亲亲]','[嘿哈]','[耶]','[西瓜]','[玫瑰]','[拥抱]','[太阳]','[惊喜]','[吐彩虹]'
];

function sendmsg(me_name) {

    if (!SendRecord.contains(me_name + '1')) {
        setText(Config.get("msg1", "1"));
        if (!clickSend()) {
            return false;
        }
    }
    if (!SendRecord.contains(me_name + '2')) {
        setText(Config.get("msg2", "2"));
        if (!clickSend()) {
            return false;
        }
    }
    if (!SendRecord.contains(me_name + '3')) {
        setText(Config.get("msg3", "3"));
        if (!clickSend()) {
            return false;
        }
    }

    

    setText(emojs[random(0, emojs.length - 1)]);
    if (!clickSend()) {
        return false;
    }
    return true;
}

function clickSend(i) {
    i = i || 0;
    var a = className('android.widget.TextView').text('发送').findOne(1000);
    if (a) {
        a.click();
        sleep(1000);
        return true;
    } else {
        if (i < 5) return clickSend(i + 1);
        else {
            return false;
        }
    }   
}