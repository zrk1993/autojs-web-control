CREATE TABLE `t_admin` (
  `admin_id` int(11) NOT NULL AUTO_INCREMENT,
  `uname` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`admin_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;


INSERT INTO `t_admin` (`uname`, `password`) VALUES ('admin', '123456');

#209-12-16
ALTER TABLE `t_device`
MODIFY COLUMN `create_time`  datetime NULL DEFAULT NULL AFTER `ip`,
MODIFY COLUMN `connect_time`  datetime NULL DEFAULT NULL AFTER `create_time`,
ADD COLUMN `category`  varchar(255) NULL DEFAULT 'default' AFTER `connect_time`