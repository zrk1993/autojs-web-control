<template>
  <div class="dashboard-container">
    <div>
      <el-button type="primary" @click="run">执行养号脚本</el-button><el-button type="primary" @click="stopAllScript">停止所有脚本</el-button>
    </div>
    <div class="my10">
      在线设备{{ $store.state.device.list.filter(i => i.is_online).length }}
    </div>
    <div>
      <div>养号配置</div>
        <div>
            观看时间<el-input v-model="looktime1" style="width: 120px;"></el-input>秒，到<el-input v-model="looktime2" style="width: 120px;"></el-input>秒
        </div>
        <div>
            每次观看关注人<el-input v-model="guanzhuvideonum1" style="width: 120px;"></el-input>到<el-input v-model="guanzhuvideonum2" style="width: 120px;"></el-input>个视频
        </div>
        <div>
            每轮关注
            <el-input v-model="guanzhunum" style="width: 120px;"></el-input>人
        </div>
        <div>
            点赞概率
            <el-input v-model="likePercent" style="width: 120px;"></el-input>
        </div>
        <horizontal>
            主页浏览视频数 <el-input v-model="looknum1" style="width: 120px;"></el-input> 到 <el-input v-model="looknum2" style="width: 120px;"></el-input> 个
        </horizontal>
    </div>
    <div class="my15">
      <input type="file" ref="input" @change="upload" />
    </div>
    <div>共{{ uids.length }}</div>
    <div>
      <!-- <div v-for="uid in uids" :key="uid">
        <div>{{ uid }}</div>
      </div> -->
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

var code = `

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
    swipe(50, device.height * 0.7, device.width *0.8, device.height * 0.7, 600);
    sleep(500);
    swipe(device.width *0.8, device.height * 0.7, 50, device.height * 0.7, 600);
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
    var a = textMatches(/^[0-9\.]+[kwKW]?$/).find();
    if (a.size() > 7) {
        a.get(3).click();
    } else if (a.size() > 0) {
        a.get(0).click();
    }
    sleep(300);
}

function nextVideo() {
    return swipe(device.width / 2 + 50, device.height * 0.85, device.width / 2 + 50, device.height * 0.3, 500);
}

function readUid() {
    // if (!files.exists("/sdcard/uid.txt")) {
    //     toastLog("没有发现uid.txt");
    //     sleep(2000);
    // }

    // var uids = files.read("/sdcard/uid.txt");

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

import request from "@/utils/request";
export default {
  name: "Dashboard",
  data() {
    return {
      uids: [],
      looktime1: 10,
      looktime2: 20,
      guanzhuvideonum1: 1,
      guanzhuvideonum2: 1,
      looknum1: 5,
      looknum2: 5,
      guanzhunum: 5,
      likePercent: 0.5,
    };
  },
  computed: {
    ...mapGetters(["name"])
  },
  methods: {
    upload() {
      const that = this;
      const input = this.$refs.input;
      const file = input.files[0];
      const filename = file.name.split(".")[0];
      const reader = new FileReader();
      reader.onload = function() {
        that.showUids(this.result);
      };
      reader.readAsText(file);
    },
    showUids(result) {
      const uidList = result.split(/\r\n/gi);
      var uids = [];
      for (var i = 0; i < uidList.length; i++) {
        if (uidList[i].length > 4) {
          uids.push(uidList[i]);
        }
      }
      this.uids = uids;
    },
        stopAllScript() {
      request
        .post("/script/stop_all", {
          devices: this.checkedDevices
        })
        .then(res => {
          this.$message({
            message: "操作成功！",
            type: "success"
          });
        })
        .finally(() => {});
    },
    run() {
      if (!this.uids.length) {
        return this.$message({
          message: "请选择UID文件",
          type: "warning"
        });
      }

      let script = code.replace("@@@", JSON.stringify(this.uids));

      script = script.replace("@looktime1", JSON.stringify(this.looktime1));
      script = script.replace("@looktime2", JSON.stringify(this.looktime2));
      script = script.replace("@guanzhuvideonum1", JSON.stringify(this.guanzhuvideonum1));
      script = script.replace("@guanzhuvideonum2", JSON.stringify(this.guanzhuvideonum2));
      script = script.replace("@looknum1", JSON.stringify(this.looknum1));
      script = script.replace("@looknum2", JSON.stringify(this.looknum2));
      script = script.replace("@guanzhunum", JSON.stringify(this.guanzhunum));
      script = script.replace("@likePercent", JSON.stringify(this.likePercent));

      request
        .post("/script/run", {
          script,
          fileName: "养号",
          devices: ''
        })
        .then(res => {
          console.log(res);
        })
        .finally(() => {
          this.bustling = false;
        });
    }
  }
};
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
    margin-top: 2em;
    text-align: center;
  }
}
</style>
