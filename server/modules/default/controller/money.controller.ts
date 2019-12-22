import { Controller, Get, QuerySchame, Query, Ctx, Post, BodySchame, Body, Description } from '@/common/application';
import { ResultUtils } from '@/utils/result-utils';
import * as joi from 'joi';
import * as moment from 'moment';
import ScriptExecutor from '@/service/ScriptExecutor';
import ScriptModel from '@/model/script.model';
import Role from '@/decorators/role';

@Controller('/money')
@Description('')
@Role()
export class Money {
    @Post('/douyin_yanghao')
    async run(@Body() body: any) {
        const code_douyin_yanghao = `
            device.wakeUp();
            device.keepScreenOn();

            var Config = storages.create('养号配置');
            var alreadyDo = Config.get("alreadyDo", '') || [];

            var looktime1 = @looktime1 || 10;
            var looktime2 = @looktime2 || 20;
            var guanzhuvideonum1 = @guanzhuvideonum1 || 5;
            var guanzhuvideonum2 = @guanzhuvideonum2 || 5;
            var looknum1 = @looknum1 || 3;
            var looknum2 = @looknum2 || 4;
            var guanzhunum = @guanzhunum || 5;
            var likePercent = @likePercent || 0.5;

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
                startApp();
            }

            var curUid = null;

            function startApp() {
                app.launchApp("抖音短视频");
                waitForPackage("com.ss.android.ugc.aweme");
                sleep(3000);

                var uids = readUid();

                toastLog('共读取uid总数：' + uids.length );
                toastLog('已关注过' + alreadyDo.length );

                for (var i =0; i<uids.length;i++) {
                    var uid = uids[i];
                    toastLog("#"+i + ": " + uid);

                    focusMb(uid);

                    alreadyDo.push(uid);
                    Config.put("alreadyDo", alreadyDo);

                    if (i % guanzhunum == 0 && i != 0) {
                        zhuyaliulan();
                    }
                }
            }

            function zhuyaliulan() {
                var videoNum = random(looknum1, looknum2);
                toastLog("主页浏览" + videoNum);

                if (random() > 0.5) hah();

                for (var i=0;i<videoNum;i++) {
                    toastLog("浏览" + i);
                    sleep(random(looktime1, looktime2) * 1000);
                    if (random() > +likePercent) clickLike();
                    sleep(1000);
                    nextVideo();
                } 
            }

            function hah () {
                swipe(50, device.height * 0.7, device.width *0.8, device.height * 0.7, 1000);
                sleep(500);
                swipe(device.width *0.8, device.height * 0.7, 50, device.height * 0.7, 1000);
                sleep(500);
            }


            function focusMb(uid) {

                toUserProfile(uid);

                var btnQxGz = text('取消关注').findOne(3000);
                if (btnQxGz) {
                    toastLog(uid + "已关注过了");
                    back();
                    sleep(1000);
                    return;
                }

                var zuopin = textStartsWith("作品").findOne(3000);
                if (zuopin) {
                    var num = +zuopin.text().replace('作品', '');
                    if (num > 0) {
                        toastLog("该用户有"+num + "个作品");
                        sleep(2000);
                        startLook(num);
                        back();
                        sleep(1000);
                    } else {
                        toastLog("该用户有没作品");
                        back();
                        sleep(1000);
                        return;
                    }
                }

                var btnGz = text('关注').findOne(2000);
                if (btnGz) {
                    btnGz.click();
                    toastLog(uid + "关注成功");
                }

                var 取消 = text("取消").findOne(2000);
                if (取消) {
                    sleep(300);
                    取消.click();
                    sleep(1000);
                }

                sleep(1000);
                if(text("我知道了").findOne(2000)) {
                    text("我知道了").findOne(1000).click();
                    sleep(1000);
                }
                if (desc('返回').findOne()) {
                    back();
                    sleep(1000);
                }

                toastLog("ok");
            }

            function startLook(videoNum) {
                var its = descStartsWith("点赞数").find();
                if (its.size() > 0) {
                    var p = its.get(0).parent();
                    if (p) {
                        var rect = p.bounds();
                        click(rect.centerX(), rect.top + 10);
                        sleep(500);

                        var d = random(guanzhuvideonum1, guanzhuvideonum2);

                        for (var i=0;i<videoNum && i < d; i++) {
                            toastLog("作品 " + i);
                            sleep(random(looktime1, looktime2) * 1000);
                            clickLike();
                            sleep(1000);
                            nextVideo();
                        }
                        sleep(3000);

                    }
                }
            }

            function clickLike() {
                var W = device.width;
                var H = device.height;
                console.log("执行喜欢");
                click(W/2,H/2);
                sleep(100);
                click(W/2,H/2);
                sleep(1000);   
                return;
            }

            function nextVideo() {
            var W = device.width;
            var H = device.height;
            return swipe(W/2,H*4/5,W/2,H/5,1000);
            }

            function readUid() {

                var uidList = JSON.parse('@@@');

                var res = [];
                for (var i = 0; i< uidList.length; i ++) {
                    if (uidList[i].length > 4) {
                        if (alreadyDo.indexOf(uidList[i]) > -1) {

                        } else {
                            res.push(uidList[i]);
                        }
                    }
                }
                return res;
            }


            function toUserProfile(uid) {
                app.startActivity({ 
                    data: "snssdk1128://user/profile/" + uid
                });
                sleep(2000);
            }
        `;
        let script = code_douyin_yanghao.replace("@@@", JSON.stringify(body.uids));
        script = script.replace("@looktime1", body.looktime1);
        script = script.replace("@looktime2", body.looktime2);
        script = script.replace("@guanzhuvideonum1", body.guanzhuvideonum1);
        script = script.replace("@guanzhuvideonum2", body.guanzhuvideonum2);
        script = script.replace("@looknum1", body.looknum1);
        script = script.replace("@looknum2", body.looknum2);
        script = script.replace("@guanzhunum", body.guanzhunum);
        script = script.replace("@likePercent", body.likePercent);
        ScriptExecutor.getInstance().run('', "抖音养号", script);
        return ResultUtils.success();
    }

    @Post('/duosan_msg')
    async run2(@Body() body: any) {
        const code = `

        device.wakeUp();
        device.keepScreenOn();
        var mb_index = 0;
        var senddd = 0;
        
        var emojs = [
            '[微笑]','[色]','[发呆]','[得意]','[害羞]','[呲牙]','[调皮]','[偷笑]','[愉快]','[奋斗]','[悠闲]','[憨笑]','[尬笑]','[做鬼脸]','[可怜]','[亲亲]','[嘿哈]','[耶]','[西瓜]','[玫瑰]','[拥抱]','[太阳]','[惊喜]','[吐彩虹]'
        ];
        
        var Config = storages.create('多闪配置');
        var SendRecord = storages.create('多闪发送记录');
        
        var msg1 = "@msg1" || "你好1";
        var msg2 = "@msg2" || "你好2";
        var msg3 = "@msg3" || "你好3";
        
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
            log('start');
            work();
        }
        
        function work() {
            while(1) {
                df();
                scrollDown();
                sleep(1000);
            }
        }
        function df() {
            var jumpnum = +Config.get("jumpnum", "30");
            var $members = className('android.widget.RelativeLayout').depth(9).clickable(true).find();
        
            for (var i=0; i < $members.size(); i++) {
                var $members2 = className('android.widget.RelativeLayout').depth(9).clickable(true).find();
                if(!$members2) return;
                var $mb = $members2[i];
                if (!$mb) {
                    toastLog('mb null');
                    continue;
                }
        
                var ax = $mb.findOne(className('android.widget.TextView'));
                if (!ax) {
                    toastLog('ax null');
                    continue;
                }
                var me_name = ax.text();
        
                if (SendRecord.contains(me_name)) {
                    log(senddd + '已发送跳过：' + me_name);
                    senddd += 1;
        
                    if (senddd > jumpnum && senddd > 20) {
                        log('运行结束 本次共私信 ' + mb_index   + '人');
                        sleep(3000);
                        exit();
                        return;
                    }
        
                    continue;
                }
        
                $mb.click();
                text('发消息').findOne(5000).click();
        
                sleep(600);
        
                if (sendmsg(me_name)) {
                    mb_index += 1;
                    senddd = 0;
                    log( mb_index + ' ' + me_name);
                    SendRecord.put(me_name, 1);
                } else {
                    i = i-1;
                    log( mb_index + ' ' + me_name + ' 重试');
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
            }
        
        }
        
        
        function sendmsg(me_name) {
        
            if (!SendRecord.contains(me_name + '1')) {
                setText(msg1);
                if (!clickSend()) {
                    return false;
                }
            }
            if (!SendRecord.contains(me_name + '2')) {
                setText(msg2);
                if (!clickSend()) {
                    return false;
                }
            }
            if (!SendRecord.contains(me_name + '3')) {
                setText(msg3);
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
        
        `;
        let script = code.replace("@msg1", body.msg1);
        script = script.replace("@msg2", body.msg2);
        script = script.replace("@msg3", body.msg3);
        ScriptExecutor.getInstance().run('', "多闪私信", script);
        return ResultUtils.success();
    }
}
