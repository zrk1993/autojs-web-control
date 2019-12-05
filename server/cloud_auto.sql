/*
Navicat MySQL Data Transfer

Source Server         : www.calibur.pro
Source Server Version : 50725
Source Host           : localhost:3309
Source Database       : cloud_auto

Target Server Type    : MYSQL
Target Server Version : 50725
File Encoding         : 65001

Date: 2019-12-05 17:21:30
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for t_device
-- ----------------------------
DROP TABLE IF EXISTS `t_device`;
CREATE TABLE `t_device` (
  `device_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `ip` varchar(255) NOT NULL,
  `create_time` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `connect_time` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`device_id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of t_device
-- ----------------------------
INSERT INTO `t_device` VALUES ('47', '120.36.168.178', '120.36.168.178', '2019-12-04 16:25:48', '2019-12-04 16:25:48');

-- ----------------------------
-- Table structure for t_log
-- ----------------------------
DROP TABLE IF EXISTS `t_log`;
CREATE TABLE `t_log` (
  `log_id` int(11) NOT NULL AUTO_INCREMENT,
  `log_type` varchar(255) DEFAULT NULL,
  `log_level` varchar(255) DEFAULT NULL,
  `content` varchar(255) DEFAULT NULL,
  `device_id` int(11) DEFAULT NULL,
  `device_name` varchar(255) DEFAULT NULL,
  `task_id` int(11) DEFAULT NULL,
  `task_name` varchar(255) DEFAULT NULL,
  `script_id` int(11) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of t_log
-- ----------------------------

-- ----------------------------
-- Table structure for t_scheduler
-- ----------------------------
DROP TABLE IF EXISTS `t_scheduler`;
CREATE TABLE `t_scheduler` (
  `scheduler_id` int(11) NOT NULL AUTO_INCREMENT,
  `scheduler_name` varchar(255) NOT NULL,
  `cron_time` varchar(255) NOT NULL COMMENT '时间',
  `last_execute_time` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '上次执行时间',
  `script_id` int(11) NOT NULL COMMENT '执行的任务',
  `device_ids` varchar(1024) DEFAULT NULL COMMENT '执行的设备 可以多个',
  `active` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`scheduler_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of t_scheduler
-- ----------------------------

-- ----------------------------
-- Table structure for t_script
-- ----------------------------
DROP TABLE IF EXISTS `t_script`;
CREATE TABLE `t_script` (
  `script_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '脚本',
  `script_name` varchar(255) DEFAULT NULL COMMENT '脚本名称',
  `script` text COMMENT '脚本内容',
  `script_args` varchar(255) DEFAULT NULL COMMENT '脚本参数',
  `create_time` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`script_id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of t_script
-- ----------------------------
INSERT INTO `t_script` VALUES ('24', 'TEST', 'auto();\nif (engines.all().length > 1) {\n    toastLog(\"脚本引擎：发现多个脚本同时运行，即将杀死所有脚本，请重新运行本脚本！\");\n    console.hide();\n    engines.stopAll();\n}\n\n\nvar isQuit = false;\n// var w = floaty.rawWindow(\n//     <frame gravity=\"center\">\n//         <button id=\"quit\" gravity=\"center\" w=\"*\" h=\"auto\" text=\"停止\"/>\n//     </frame>\n// );\n// w.setPosition(5, device.height * 0.35)\n// w.exitOnClose();\n// w.quit.click(function(){\n//     toastLog(\"停止\");\n//     console.hide();\n//     exit();\n// });\n\ndevice.wakeUp();\ndevice.keepScreenOn();\n\n\n\nvar commentMessage = dialogs.input(\"请输入私信内容,请保留引号\", \'\"万事如意\"\');\ntoastLog(\'私信内容：\' + commentMessage);\n\nconsole.show();\ntoastLog(\"打开抖音短视频\");\napp.launchApp(\"抖音短视频\");\nsleep(3000)\ntoastLog(\"START\");\n\nvar videoIndex = 0;\nwhile (true) {\n    sleep(random(3000, 3000));\n\n    if (random() > 0.7) {\n        continue;\n    }\n\n    nextVideo();\n\n    var commentsSize = getCommentsSize();\n    if (commentsSize < 100) {\n        toastLog(\'评论少，跳过！\' + commentsSize);\n        continue;\n    }\n\n    if (!openComment()) {\n        toastLog(\'打开评论失败，切换下一个视频！\');\n        continue;\n    }\n\n    sleep(1000);\n\n    if (!openPrivateLetter(0)) {\n        toastLog(\'打开私信失败！\');\n        closeComment();\n        continue;\n    }\n\n    sleep(1000);\n\n    if (!sendMsg(commentMessage)) {\n        toastLog(\'发送私信失败\');\n        closeComment();\n        continue;\n    }\n\n    sleep(3000);\n\n    if (!closeComment()) {\n        continue;\n    }\n}\n\n\nfunction nextVideo() {\n    return swipe(device.width / 2, device.height * 0.8, device.width / 2, device.height * 0.4, 300);\n}\n\nfunction getCommentsSize() {\n    var a = className(\"android.widget.LinearLayout\").depth(6).clickable(true).descStartsWith(\"评论\").find();\n    var c = a.size() > 6 ? a.get(3).desc() : a.get(0).desc();\n    if (c.indexOf(\'w\') > -1) {\n        return c.replace(/[^0-9]/ig, \'\') * 1000;\n    }\n    return c.replace(/[^0-9]/ig, \'\') * 1;\n}\n\nfunction openComment() {\n    var a = className(\"android.widget.LinearLayout\").depth(6).clickable(true).descStartsWith(\"评论\").find();\n    if (a.size() > 6) {\n        return a.get(3).click();\n    } else {\n        return a.get(0).click();\n    }\n}\n\nfunction closeComment() {\n    var a = className(\"android.widget.ImageView\").depth(2).clickable(true).find();\n    if (a && a.size() > 5) {\n        return back();\n    } else {\n        back();\n        sleep(2100);\n        return back();\n    }\n}\n\nfunction openPrivateLetter(commentIndex) {\n    var comments = className(\"android.support.v7.widget.RecyclerView\").find().find(className(\"android.widget.FrameLayout\").depth(3).clickable(true));\n    if (comments.size() <= commentIndex) {\n        toastLog(\'当前视频无评论\');\n        return false;\n    }\n\n    toastLog(\'私信 \' + (videoIndex++) + \" : \" + comments.get(commentIndex).find(className(\"android.widget.TextView\")).get(0).text())\n    if (!comments.get(commentIndex).longClick()) {\n        toastLog(\'私信长按失败\');\n        return false;\n    }\n    sleep(1000);\n    return text(\'私信回复\').findOne(1000).click();;\n}\n\nfunction sendMsg(msg) {\n    if (!setText(msg)) {\n        toastLog(\'设置回复内容失败！\');\n        return false;\n    }\n    text(\'发送\').findOne(1000).click();;\n    return true;\n}', '', '2019-11-30 11:01:01', '2019-11-30 11:01:01');
INSERT INTO `t_script` VALUES ('25', '自动上滑', 'auto();\nif (engines.all().length > 1) {\n    toastLog(\"脚本引擎：发现多个脚本同时运行，即将杀死所有脚本，请重新运行本脚本！\");\n    console.hide();\n    engines.stopAll();\n}\n\ndevice.wakeUp();\ndevice.keepScreenOn();\nwhile (true) {\n    sleep(random(3000, 15000));\n    console.log(\"look\");\n    nextVideo();\n}\n\n\nfunction nextVideo() {\n    return swipe(device.width / 2, device.height * 0.85, device.width / 2, device.height * 0.1, 200);\n}\n\n', '', '2019-11-30 11:22:45', '2019-11-30 11:22:45');
INSERT INTO `t_script` VALUES ('29', '新建脚本', 'log(\"大佬666\")', '', '2019-11-30 15:37:18', '2019-11-30 15:37:18');
INSERT INTO `t_script` VALUES ('34', 'syaHi', 'toastLog(\"hello\")', '', '2019-12-04 15:22:34', '2019-12-04 15:22:34');
INSERT INTO `t_script` VALUES ('36', '新建脚本', '', '', null, null);

-- ----------------------------
-- Table structure for t_task
-- ----------------------------
DROP TABLE IF EXISTS `t_task`;
CREATE TABLE `t_task` (
  `task_id` int(11) NOT NULL AUTO_INCREMENT,
  `task_name` varchar(255) DEFAULT NULL,
  `device_id` int(11) NOT NULL COMMENT '指定设备',
  `script_id` int(11) NOT NULL,
  `script_args` varchar(255) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `start_time` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `finish_time` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `status` varchar(255) DEFAULT NULL COMMENT '运行状态',
  `task_result` varchar(255) DEFAULT NULL COMMENT '运行结果',
  `batch_number` varchar(64) DEFAULT NULL COMMENT '同一批次的任务 批次号一样',
  PRIMARY KEY (`task_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of t_task
-- ----------------------------
